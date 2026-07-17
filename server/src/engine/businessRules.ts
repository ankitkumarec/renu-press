/**
 * Business Rules Engine
 * ALL decisions pass here BEFORE and AFTER the AI model.
 * AI never accesses DB, prices, invoices, or inventory.
 */

export type PolicyContext = {
  message: string;
  hasFiles?: boolean;
  sessionId?: string;
  role?: string;
};

export type PolicyResult = {
  allowed: boolean;
  blockedReason?: string;
  /** Force a fixed customer reply (price protection etc.) */
  forcedReply?: string;
  /** Flags for prompt builder */
  flags: {
    priceAsk: boolean;
    deliveryPromiseAsk: boolean;
    discountAsk: boolean;
    restricted: boolean;
  };
  /** Sanitized message for AI */
  sanitizedMessage: string;
  restrictedHits: string[];
};

const PRICE_RE =
  /\b(price|rate|kitna|kitne|cost|charge|quotation\s*amount|₹|rs\.?|rupees?|pricing|how\s*much|kya\s*rate|kitne\s*ka)\b/i;
const DISCOUNT_RE = /\b(discount|sasta|offer|percent\s*off|%|\boff\b|negotiate|kam\s*kar)\b/i;
const DELIVERY_PROMISE_RE =
  /\b(guarantee(d)?\s*delivery|confirm\s*date|same\s*day\s*guaranteed|exact\s*delivery\s*date|promise\s*delivery)\b/i;

/** Words that must never appear in customer-facing AI output or be used as self-identity */
export const FORBIDDEN_IDENTITY = [
  "i am an ai",
  "i'm an ai",
  "i am a bot",
  "i'm a bot",
  "i am chatgpt",
  "as an ai",
  "as a language model",
  "virtual assistant",
  "i am a chatbot",
  "i'm a chatbot",
  "automated assistant",
];

const RESTRICTED_CUSTOMER = [
  /drop\s*database/i,
  /sql\s*injection/i,
  /show\s*me\s*(the\s*)?(admin|erp|password|jwt|secret)/i,
  /bypass\s*(price|auth|admin)/i,
];

export const PRICE_PROTECTION_REPLY =
  "Our support team will review your requirements and share the best quotation shortly.";

export function applyInboundBusinessRules(ctx: PolicyContext): PolicyResult {
  const message = (ctx.message || "").trim();
  const restrictedHits: string[] = [];

  for (const re of RESTRICTED_CUSTOMER) {
    if (re.test(message)) restrictedHits.push(re.source);
  }

  const flags = {
    priceAsk: PRICE_RE.test(message),
    deliveryPromiseAsk: DELIVERY_PROMISE_RE.test(message),
    discountAsk: DISCOUNT_RE.test(message),
    restricted: restrictedHits.length > 0,
  };

  if (flags.restricted) {
    return {
      allowed: true,
      flags,
      sanitizedMessage: message,
      restrictedHits,
      forcedReply:
        "We can only help with printing and branding requirements. Please share what you'd like to print — our support team is here to help.",
    };
  }

  // Pure price/discount asks → never send to model for commercial invention
  if ((flags.priceAsk || flags.discountAsk) && message.length < 80 && !ctx.hasFiles) {
    return {
      allowed: true,
      flags,
      sanitizedMessage: message,
      restrictedHits,
      forcedReply: PRICE_PROTECTION_REPLY,
    };
  }

  return {
    allowed: true,
    flags,
    sanitizedMessage: message.slice(0, 4000),
    restrictedHits,
  };
}

export type AiStructuredOutput = {
  reply: string;
  intent?: string;
  lead_score?: number;
  priority?: "High" | "Medium" | "Low" | string;
  next_question?: string;
  recommended_products?: string[];
  analysis?: Record<string, unknown>;
  collected?: Record<string, string | null | undefined>;
};

/** Strip forbidden identity + commercial inventing from model output */
export function validateOutboundAi(raw: AiStructuredOutput, inbound: PolicyResult): AiStructuredOutput {
  let reply = (raw.reply || "").trim();

  const lower = reply.toLowerCase();
  for (const bad of FORBIDDEN_IDENTITY) {
    if (lower.includes(bad)) {
      reply = reply.replace(new RegExp(bad, "ig"), "our support team");
    }
  }

  // Remove invented prices (₹ amounts, "Rs. 500" etc.)
  reply = reply.replace(/(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?/gi, "[quotation by team]");
  reply = reply.replace(/\b\d{2,6}\s*(?:rs|rupees|\/-)\b/gi, "[quotation by team]");

  if (inbound.flags.priceAsk || inbound.flags.discountAsk) {
    if (!/quotation|support team|review/i.test(reply)) {
      reply = `${reply}\n\n${PRICE_PROTECTION_REPLY}`.trim();
    }
  }

  if (!reply) {
    reply =
      "Thank you for reaching out to RENU PRESS Support Team. Please share a bit more about what you'd like to print, or upload a logo/PDF.";
  }

  const leadScore = Math.max(0, Math.min(100, Number(raw.lead_score) || 0));
  let priority = raw.priority || "Medium";
  if (leadScore >= 80) priority = "High";
  else if (leadScore >= 50) priority = "Medium";
  else priority = "Low";

  return {
    reply,
    intent: raw.intent || undefined,
    lead_score: leadScore,
    priority,
    next_question: raw.next_question,
    recommended_products: Array.isArray(raw.recommended_products)
      ? raw.recommended_products.slice(0, 12).map(String)
      : [],
    analysis: raw.analysis && typeof raw.analysis === "object" ? raw.analysis : undefined,
    collected: raw.collected,
  };
}

export function buildSystemPrompt(companySlice: string, flags: PolicyResult["flags"]) {
  return `You are a human member of the ❤️ RENU PRESS Support Team (official verified printing business in Saharsa, Bihar).

NEVER say you are AI, bot, ChatGPT, assistant, or automation.
Speak as "we" / "our team". Language: Hindi, English, or Hinglish — natural, short, professional.

RULES (absolute):
- NEVER invent or quote final prices, discounts, or guaranteed delivery dates.
- NEVER claim to create invoices or update inventory.
- If asked for price/discount, say the support team will review and share the best quotation shortly.
- Ask ONE clarifying question at a time when collecting requirements.
- Recommend products only after understanding needs.
- Output ONLY valid JSON (no markdown fences) with this shape:
{
  "reply": "customer-facing message",
  "intent": "short intent",
  "lead_score": 0-100,
  "priority": "High|Medium|Low",
  "next_question": "optional next question",
  "recommended_products": ["..."],
  "analysis": {},
  "collected": { "product": null, "size": null, "quantity": null, "name": null, "phone": null }
}

Company knowledge (subset only — not full ERP):
${companySlice}

Inbound flags: priceAsk=${flags.priceAsk}, discountAsk=${flags.discountAsk}, deliveryPromiseAsk=${flags.deliveryPromiseAsk}`;
}
