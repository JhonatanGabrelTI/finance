import { z } from "zod";
import { getCloudflareBindings } from "@/lib/cloudflare-bindings";
import { ownerForRequest } from "@/lib/auth-session";

const inputSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["receita", "despesa"]),
  origin: z.enum(["pessoal", "barbearia"]),
  amountCents: z.number().int().positive(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(80),
  paymentMethod: z.enum([
    "pix",
    "dinheiro",
    "credito",
    "debito",
    "transferencia",
    "boleto",
    "outro",
  ]),
  status: z.enum(["pago", "pendente"]),
  notes: z.string().trim().max(500).optional(),
});
export async function GET(request: Request) {
  const session = ownerForRequest(request);
  if (!session)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  const url = new URL(request.url);
  const requestedOrigin = url.searchParams.get("origin");
  const origin = session.workspace === "business" ? "barbearia" : "pessoal";
  if (requestedOrigin && requestedOrigin !== origin)
    return Response.json({ error: "Este ambiente não tem acesso a esses dados." }, { status: 403 });
  const { DB } = await getCloudflareBindings();
  if (!DB)
    return Response.json(
      { error: "Banco temporariamente indisponível." },
      { status: 503 },
    );
  const statement = origin
    ? DB.prepare(
        "SELECT id,type,origin,amount_cents AS amountCents,occurred_on AS occurredOn,description,category,payment_method AS paymentMethod,status,notes,receipt_id AS receiptId FROM transactions WHERE user_id = ? AND origin = ? ORDER BY occurred_on DESC, created_at DESC LIMIT 200",
      ).bind(session.owner, origin)
    : DB.prepare(
        "SELECT id,type,origin,amount_cents AS amountCents,occurred_on AS occurredOn,description,category,payment_method AS paymentMethod,status,notes,receipt_id AS receiptId FROM transactions WHERE user_id = ? ORDER BY occurred_on DESC, created_at DESC LIMIT 200",
      ).bind(session.owner);
  const result = await statement.all();
  return Response.json({ transactions: result.results });
}

export async function POST(request: Request) {
  const session = ownerForRequest(request);
  if (!session)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      {
        error: "Revise os dados informados.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  const requiredOrigin = session.workspace === "business" ? "barbearia" : "pessoal";
  if (parsed.data.origin !== requiredOrigin)
    return Response.json(
      { error: "Este lançamento não pertence ao ambiente ativo." },
      { status: 403 },
    );
  const { DB } = await getCloudflareBindings();
  if (!DB)
    return Response.json(
      { error: "Banco temporariamente indisponível." },
      { status: 503 },
    );
  const id = parsed.data.id ?? crypto.randomUUID();
  const now = Date.now();
  const v = parsed.data;
  await DB.prepare(
    "INSERT INTO transactions (id,user_id,type,origin,amount_cents,occurred_on,description,category,payment_method,status,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
  )
    .bind(
      id,
      session.owner,
      v.type,
      v.origin,
      v.amountCents,
      v.occurredOn,
      v.description,
      v.category,
      v.paymentMethod,
      v.status,
      v.notes ?? null,
      now,
      now,
    )
    .run();
  return Response.json({ id, ...v }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = ownerForRequest(request);
  if (!session) return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success)
    return Response.json({ error: "Lançamento inválido." }, { status: 400 });
  const { DB } = await getCloudflareBindings();
  if (!DB) return Response.json({ error: "Banco temporariamente indisponível." }, { status: 503 });
  const origin = session.workspace === "business" ? "barbearia" : "pessoal";
  await DB.prepare("DELETE FROM transactions WHERE id = ? AND user_id = ? AND origin = ?")
    .bind(id, session.owner, origin)
    .run();
  return Response.json({ deleted: true });
}
