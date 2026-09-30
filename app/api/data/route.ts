import { getCloudflareBindings } from "@/lib/cloudflare-bindings";
import { ownerForRequest } from "@/lib/auth-session";

export async function DELETE(request: Request) {
  const session = ownerForRequest(request);
  if (!session)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );

  const { DB, RECEIPTS } = await getCloudflareBindings();
  if (!DB)
    return Response.json(
      { error: "Banco temporariamente indisponível." },
      { status: 503 },
    );

  const origin = session.workspace === "business" ? "barbearia" : "pessoal";
  const receiptRows = await DB.prepare(
    "SELECT object_key AS objectKey FROM receipts WHERE user_id = ?",
  )
    .bind(session.owner)
    .all<{ objectKey: string }>();
  const objectKeys = (receiptRows.results ?? []).map((row) => row.objectKey);

  if (objectKeys.length && !RECEIPTS)
    return Response.json(
      { error: "O armazenamento de comprovantes está indisponível; nenhum dado foi removido." },
      { status: 503 },
    );

  try {
    if (RECEIPTS) {
      for (const objectKey of objectKeys) await RECEIPTS.delete(objectKey);
    }
    const receipts = await DB.prepare(
      "DELETE FROM receipts WHERE user_id = ?",
    )
      .bind(session.owner)
      .run();
    const transactions = await DB.prepare(
      "DELETE FROM transactions WHERE user_id = ? AND origin = ?",
    )
      .bind(session.owner, origin)
      .run();

    return Response.json({
      deleted: true,
      receipts: receipts.meta.changes,
      transactions: transactions.meta.changes,
      workspace: session.workspace,
    });
  } catch {
    return Response.json(
      { error: "Não foi possível concluir a limpeza. Tente novamente." },
      { status: 500 },
    );
  }
}
