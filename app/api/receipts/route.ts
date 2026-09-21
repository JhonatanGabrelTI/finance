import { env } from "cloudflare:workers";
import { receiptParser } from "@/services/receipt-parser";

const allowed = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX = 10 * 1024 * 1024;
export async function POST(request: Request) {
  const owner = request.headers.get("oai-authenticated-user-id");
  if (!owner)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  if (!env.DB || !env.RECEIPTS)
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
  const key = `${owner}/${id}`;
  const now = Date.now();
  await env.RECEIPTS.put(key, bytes, {
    httpMetadata: { contentType: file.type },
    customMetadata: { owner },
  });
  try {
    await env.DB.prepare(
      "INSERT INTO receipts (id,user_id,object_key,file_name,content_type,size,status,parsed_json,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    )
      .bind(
        id,
        owner,
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
    await env.RECEIPTS.delete(key);
    throw error;
  }
  return Response.json(
    { id, fileName: file.name, status: "pending_review", parsed },
    { status: 201 },
  );
}
