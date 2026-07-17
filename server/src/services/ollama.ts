import { config } from "../config";
import type { AiStructuredOutput } from "../engine/businessRules";

export async function isOllamaUp(): Promise<boolean> {
  try {
    const res = await fetch(`${config.ollamaBaseUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ollamaChat(opts: {
  system: string;
  user: string;
  imagesBase64?: string[];
}): Promise<string> {
  const body: Record<string, unknown> = {
    model: config.ollamaModel,
    stream: false,
    format: "json",
    options: { temperature: 0.4 },
    messages: [
      { role: "system", content: opts.system },
      {
        role: "user",
        content: opts.user,
        ...(opts.imagesBase64?.length ? { images: opts.imagesBase64 } : {}),
      },
    ],
  };

  const res = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.ollamaTimeoutMs),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Ollama error ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  return data.message?.content || "";
}

export function parseAiJson(text: string): AiStructuredOutput {
  let raw = text.trim();
  // strip fences if model ignores format
  raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  try {
    const j = JSON.parse(raw) as AiStructuredOutput;
    return j;
  } catch {
    // try extract object
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as AiStructuredOutput;
      } catch {
        /* fallthrough */
      }
    }
    return {
      reply: raw.slice(0, 1500) || "Thank you. Our support team is reviewing your message.",
      intent: "general",
      lead_score: 20,
      priority: "Low",
      recommended_products: [],
    };
  }
}
