/**
 * Local structured responder when Ollama is offline.
 * Still returns the same JSON contract — business rules already applied upstream.
 */
import type { AiStructuredOutput } from "../engine/businessRules";
import { PRICE_PROTECTION_REPLY } from "../engine/businessRules";

export function rulesFallbackReply(opts: {
  message: string;
  priceAsk?: boolean;
  ocrText?: string;
  fileNames?: string[];
}): AiStructuredOutput {
  if (opts.priceAsk) {
    return {
      reply: PRICE_PROTECTION_REPLY,
      intent: "price_inquiry",
      lead_score: 40,
      priority: "Medium",
      recommended_products: [],
      next_question: "Please share product, size and quantity so our team can prepare a quotation.",
    };
  }

  const m = opts.message.toLowerCase();
  let intent = "general_inquiry";
  const recommended: string[] = [];

  if (/banner|flex|hoarding/.test(m)) {
    intent = "Banner Printing";
    recommended.push("Flex Banner", "Star Flex", "Vinyl Banner");
  } else if (/visiting|business\s*card/.test(m)) {
    intent = "Visiting Cards";
    recommended.push("Visiting Cards", "Business Cards");
  } else if (/t-?shirt|hoodie|cap/.test(m)) {
    intent = "Apparel Printing";
    recommended.push("T-Shirt Printing", "Caps");
  } else if (/packag|box|bag/.test(m)) {
    intent = "Packaging";
    recommended.push("Packaging", "Sticker Printing", "Paper Bag");
  } else if (/gift|mug|trophy/.test(m)) {
    intent = "Gift Printing";
    recommended.push("Corporate Gifts", "Mugs");
  } else if (/led|acp|glow|board|sign/.test(m)) {
    intent = "Signage";
    recommended.push("ACP Board", "LED Sign Board", "Glow Sign Board");
  } else if (/shop|branding|restaurant|election/.test(m)) {
    intent = "Branding package";
    recommended.push("ACP Board", "Flex Banner", "Visiting Cards", "Sticker Printing");
  }

  const filesNote = opts.fileNames?.length
    ? `\n\nWe've received your file(s): ${opts.fileNames.join(", ")}. Our team will review print readiness.`
    : "";
  const ocrNote = opts.ocrText?.trim()
    ? `\n\nWe noted text from your upload for reference.`
    : "";

  const reply = recommended.length
    ? `Thank you for contacting RENU PRESS Support Team.${filesNote}${ocrNote}\n\nBased on what you shared, these options often work well:\n${recommended.map((r) => `• ${r}`).join("\n")}\n\nWhat size and quantity do you need?`
    : `Thank you for contacting RENU PRESS Support Team.${filesNote}${ocrNote}\n\nPlease tell us what you'd like to print — or choose Banner, Visiting Card, T-Shirt, Packaging, or Gift Printing.`;

  return {
    reply,
    intent,
    lead_score: recommended.length ? 55 : 25,
    priority: recommended.length ? "Medium" : "Low",
    recommended_products: recommended,
    next_question: "What size and quantity do you need?",
    analysis: opts.fileNames?.length
      ? { files_received: opts.fileNames.length, ocr_preview: (opts.ocrText || "").slice(0, 200) }
      : undefined,
  };
}
