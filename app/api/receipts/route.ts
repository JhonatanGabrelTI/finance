import { receiptParser } from "@/services/receipt-parser";
import { getCloudflareBindings } from "@/lib/cloudflare-bindings";
import { ownerForRequest } from "@/lib/auth-session";

const allowed = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX = 10 * 1024 * 1024;
export async function POST(request: Request) {
  const session = ownerForRequest(request);
  if (!session)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  const { DB, RECEIPTS } = await getCloudflareBindings();
  if (!DB || !RECEIPTS)
    return Response.json(
      { error: "Armazenamento temporariamente indisponível." },
      { status: 503 },
    );
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return Response.json({ error: "Selecione um arquivo." }, { status: 400 });
  if (!allowed.has(file.type) || file.size > MAX)
    return Response.json(
      { error: "Use PNG, JPG ou PDF de até 10 MB." },
      { status: 400 },
    );
  const bytes = await file.arrayBuffer();
  const parsed = await receiptParser.parse(bytes, file.type);
  const id = crypto.randomUUID();
  const key = `${session.owner}/${id}`;
  const now = Date.now();
  await RECEIPTS.put(key, bytes, {
    httpMetadata: { contentType: file.type },
    customMetadata: { owner: session.owner },
  });
  try {
    await DB.prepare(
      "INSERT INTO receipts (id,user_id,object_key,file_name,content_type,size,status,parsed_json,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    )
      .bind(
        id,
        session.owner,
        key,
        file.name,
        file.type,
        file.size,
        "pending_review",
        JSON.stringify(parsed),
        now,
      )
      .run();
  } catch (error) {
    await RECEIPTS.delete(key);
    throw error;
  }
  return Response.json(
    { id, fileName: file.name, status: "pending_review", parsed },
    { status: 201 },
  );
}
