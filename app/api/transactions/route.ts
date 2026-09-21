import { z } from "zod";
import { getCloudflareBindings } from "@/lib/cloudflare-bindings";

const inputSchema = z.object({
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
const userId = (request: Request) =>
  request.headers.get("oai-authenticated-user-id");

export async function GET(request: Request) {
  const owner = userId(request);
  if (!owner)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  const { DB } = await getCloudflareBindings();
  if (!DB)
    return Response.json(
      { error: "Banco temporariamente indisponível." },
      { status: 503 },
    );
  const url = new URL(request.url);
  const origin = url.searchParams.get("origin");
  const statement = origin
    ? DB.prepare(
        "SELECT id,type,origin,amount_cents AS amountCents,occurred_on AS occurredOn,description,category,payment_method AS paymentMethod,status,notes,receipt_id AS receiptId FROM transactions WHERE user_id = ? AND origin = ? ORDER BY occurred_on DESC, created_at DESC LIMIT 200",
      ).bind(owner, origin)
    : DB.prepare(
        "SELECT id,type,origin,amount_cents AS amountCents,occurred_on AS occurredOn,description,category,payment_method AS paymentMethod,status,notes,receipt_id AS receiptId FROM transactions WHERE user_id = ? ORDER BY occurred_on DESC, created_at DESC LIMIT 200",
      ).bind(owner);
  const result = await statement.all();
  return Response.json({ transactions: result.results });
}

export async function POST(request: Request) {
  const owner = userId(request);
  if (!owner)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  const { DB } = await getCloudflareBindings();
  if (!DB)
    return Response.json(
      { error: "Banco temporariamente indisponível." },
      { status: 503 },
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
  const id = crypto.randomUUID();
  const now = Date.now();
  const v = parsed.data;
  await DB.prepare(
    "INSERT INTO transactions (id,user_id,type,origin,amount_cents,occurred_on,description,category,payment_method,status,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
  )
    .bind(
      id,
      owner,
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
