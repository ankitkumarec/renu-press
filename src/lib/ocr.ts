/**
 * Lightweight OCR helper for expense proofs.
 * Parses text / filenames for amount, date, UPI refs, GST, invoice nos.
 * Ready to swap with Tesseract / cloud OCR later.
 */

export type OcrExpenseDraft = {
  amount?: number;
  expenseDate?: string;
  vendorName?: string;
  gstNumber?: string;
  billNumber?: string;
  upiRef?: string;
  title?: string;
  confidence: number;
  raw: string;
};

export function parseExpenseFromText(text: string): OcrExpenseDraft {
  const raw = text || "";
  const amountMatch =
    raw.match(/(?:rs\.?|inr|₹)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/i) ||
    raw.match(/\b([0-9]{2,7}(?:\.[0-9]{1,2})?)\s*(?:rs|inr)?\b/i);
  const dateMatch =
    raw.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/) ||
    raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  const gstMatch = raw.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]\b/i);
  const upiMatch =
    raw.match(/(?:upi|ref|utr)[:\s#-]*([A-Z0-9]{8,22})/i) ||
    raw.match(/\b(\d{12})\b/);
  const invMatch =
    raw.match(/(?:invoice|bill|inv)[:\s#-]*([A-Z0-9\-\/]{3,20})/i);
  const vendorMatch =
    raw.match(/(?:from|paid to|vendor|merchant)[:\s]+([A-Za-z0-9 &.]{3,40})/i);

  let amount: number | undefined;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  }

  return {
    amount: Number.isFinite(amount) ? amount : undefined,
    expenseDate: dateMatch?.[1],
    vendorName: vendorMatch?.[1]?.trim(),
    gstNumber: gstMatch?.[0]?.toUpperCase(),
    billNumber: invMatch?.[1],
    upiRef: upiMatch?.[1],
    title: vendorMatch?.[1] ? `Payment — ${vendorMatch[1].trim()}` : "Expense from proof",
    confidence: [amountMatch, dateMatch, upiMatch, invMatch].filter(Boolean).length / 4,
    raw: raw.slice(0, 2000),
  };
}

/** Demo OCR from filename patterns e.g. paytm_1200_2024-01-15_vendor.jpg */
export function parseExpenseFromFilename(name: string): OcrExpenseDraft {
  const base = name.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ");
  return parseExpenseFromText(base + " " + name);
}
