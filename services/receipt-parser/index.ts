export type ParsedReceipt = {
  amountCents: number | null;
  occurredOn: string | null;
  description: string | null;
  beneficiary: string | null;
  suggestedCategory: string | null;
  suggestedType: "receita" | "despesa" | null;
  suggestedOrigin: "pessoal" | "barbearia" | null;
  confidence: number;
};

export interface ReceiptParser {
  parse(file: ArrayBuffer, contentType: string): Promise<ParsedReceipt>;
}

export class SafeFallbackReceiptParser implements ReceiptParser {
  async parse(): Promise<ParsedReceipt> {
    return {
      amountCents: null,
      occurredOn: null,
      description: null,
      beneficiary: null,
      suggestedCategory: null,
      suggestedType: null,
      suggestedOrigin: null,
      confidence: 0,
    };
  }
}

export const receiptParser: ReceiptParser = new SafeFallbackReceiptParser();
