import { randomBytes } from "crypto";
import { prisma } from "../db";
import {
  applyInboundBusinessRules,
  buildSystemPrompt,
  validateOutboundAi,
  type AiStructuredOutput,
} from "../engine/businessRules";
import { retrieveCompanySlice } from "./productKb";
import { isOllamaUp, ollamaChat, parseAiJson } from "./ollama";
import { rulesFallbackReply } from "./rulesFallback";
import { runOcr } from "./ocr";
import { uploadToCloudinary } from "./cloudinary";
import { config } from "../config";

function newSessionId() {
  return `rp_${randomBytes(16).toString("hex")}`;
}

const WELCOME = `👋 Welcome to RENU PRESS

Thank you for contacting us.

Please tell us what you need.

You can also upload:

📷 Image
🎨 Logo
📄 PDF
🖼️ Banner Design
💳 Visiting Card
📦 Packaging Design

We'll review everything and our support team will get back to you with the best quotation.

How can we help you today?`;

const QUICK = [
  { id: "banner", label: "📢 Banner", send: "Banner Printing" },
  { id: "visiting", label: "💳 Visiting Card", send: "Visiting Cards" },
  { id: "gift", label: "🎁 Gift Printing", send: "Corporate Gifts" },
  { id: "tshirt", label: "👕 T-Shirt", send: "T-Shirt Printing" },
  { id: "packaging", label: "📦 Packaging", send: "Packaging" },
  { id: "other", label: "✍️ Something Else", send: "Something else — custom printing" },
];

export async function createOrGetSession(sessionId?: string | null) {
  if (sessionId) {
    const found = await prisma.supportConversation.findUnique({
      where: { sessionId },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 200 },
        files: { where: { deleted: false }, orderBy: { createdAt: "desc" } },
      },
    });
    if (found) return found;
  }

  const sid = newSessionId();
  return prisma.supportConversation.create({
    data: {
      sessionId: sid,
      nextField: "product",
      status: "NEW_INQUIRY",
      messages: {
        create: {
          role: "agent",
          content: WELCOME,
          messageType: "welcome",
          metadata: JSON.stringify({ type: "welcome", quickReplies: QUICK }),
        },
      },
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      files: true,
    },
  });
}

async function ensureLead(conversationId: string, ai: AiStructuredOutput) {
  const conv = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
    include: { files: { where: { deleted: false } } },
  });
  if (!conv) return null;

  const name = conv.customerName || ai.collected?.name || "Guest";
  const phone = conv.phone || ai.collected?.phone || "pending";
  if (phone === "pending" && !conv.phone) {
    // wait for phone before full lead — still update score
    await prisma.supportConversation.update({
      where: { id: conv.id },
      data: {
        leadScore: ai.lead_score || conv.leadScore,
        urgency: priorityToUrgency(ai.priority),
        customerIntent: ai.intent || conv.customerIntent,
        recommendedProducts: JSON.stringify(ai.recommended_products || []),
        aiSummary: ai.reply?.slice(0, 500),
      },
    });
    return null;
  }

  const summary = [
    `Intent: ${ai.intent || conv.customerIntent || "—"}`,
    `Priority: ${ai.priority}`,
    `Score: ${ai.lead_score}`,
    `Product: ${conv.product || ai.collected?.product || "—"}`,
    `Phone: ${phone}`,
    `Recommended: ${(ai.recommended_products || []).join(", ")}`,
    `Files: ${conv.files.map((f) => f.fileName).join(", ") || "none"}`,
  ].join("\n");

  let leadId = conv.leadId;
  if (leadId) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        name: String(name),
        phone: String(phone),
        service: conv.product || ai.intent || undefined,
        message: summary,
        status: "waiting_review",
        leadScore: ai.lead_score || 0,
        urgency: priorityToUrgency(ai.priority),
        summary,
        source: "support_gateway",
        notes: (ai.recommended_products || []).join(", "),
      },
    });
  } else {
    const lead = await prisma.lead.create({
      data: {
        name: String(name),
        phone: String(phone),
        service: conv.product || ai.intent || undefined,
        message: summary,
        status: "waiting_review",
        leadScore: ai.lead_score || 0,
        urgency: priorityToUrgency(ai.priority),
        summary,
        source: "support_gateway",
        notes: (ai.recommended_products || []).join(", "),
      },
    });
    leadId = lead.id;
    await prisma.supportConversation.update({
      where: { id: conv.id },
      data: { leadId },
    });
  }

  await prisma.supportConversation.update({
    where: { id: conv.id },
    data: {
      leadScore: ai.lead_score || conv.leadScore,
      urgency: priorityToUrgency(ai.priority),
      customerIntent: ai.intent || conv.customerIntent,
      recommendedProducts: JSON.stringify(ai.recommended_products || []),
      aiSummary: summary,
      status: "WAITING_REVIEW",
      notifiedAdmin: true,
      adminNotifiedAt: new Date(),
    },
  });

  await prisma.adminAlert.create({
    data: {
      type: "SUPPORT_LEAD",
      title: `Support lead · ${name}`,
      body: `${ai.intent || "Inquiry"} · score ${ai.lead_score} · ${phone}`,
      href: `/erp/support/${conv.id}`,
      meta: JSON.stringify({ conversationId: conv.id, leadId, priority: ai.priority }),
    },
  });

  return leadId;
}

function priorityToUrgency(p?: string) {
  if (!p) return "normal";
  if (/high/i.test(p)) return "high";
  if (/low/i.test(p)) return "low";
  return "normal";
}

function hotWarmCold(score: number) {
  if (score >= 80) return "Hot Lead";
  if (score >= 50) return "Warm Lead";
  return "Cold Lead";
}

export async function handleChatMessage(opts: {
  sessionId: string;
  message: string;
}) {
  const conv = await prisma.supportConversation.findUnique({
    where: { sessionId: opts.sessionId },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 12 },
      files: { where: { deleted: false }, take: 10 },
    },
  });
  if (!conv) throw new Error("SESSION_NOT_FOUND");

  const policy = applyInboundBusinessRules({
    message: opts.message,
    sessionId: opts.sessionId,
    hasFiles: conv.files.length > 0,
  });

  await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      role: "customer",
      content: opts.message.slice(0, 4000),
      messageType: "text",
    },
  });

  let structured: AiStructuredOutput;

  if (policy.forcedReply) {
    structured = {
      reply: policy.forcedReply,
      intent: policy.flags.priceAsk ? "price_inquiry" : "restricted",
      lead_score: policy.flags.priceAsk ? 45 : 15,
      priority: "Medium",
      recommended_products: [],
    };
  } else {
    const memory = conv.messages
      .slice()
      .reverse()
      .map((m) => `${m.role}: ${m.content.slice(0, 400)}`)
      .join("\n");

    const companySlice = retrieveCompanySlice(opts.message);
    const system = buildSystemPrompt(companySlice, policy.flags);
    const userBlock = [
      `Customer message: ${policy.sanitizedMessage}`,
      `Known fields: name=${conv.customerName || "?"} phone=${conv.phone || "?"} product=${conv.product || "?"}`,
      `Recent conversation:\n${memory}`,
    ].join("\n\n");

    const ollamaOk = await isOllamaUp();
    if (ollamaOk) {
      try {
        const raw = await ollamaChat({ system, user: userBlock });
        structured = parseAiJson(raw);
      } catch {
        structured = rulesFallbackReply({
          message: opts.message,
          priceAsk: policy.flags.priceAsk,
          fileNames: conv.files.map((f) => f.fileName),
        });
      }
    } else {
      structured = rulesFallbackReply({
        message: opts.message,
        priceAsk: policy.flags.priceAsk,
        fileNames: conv.files.map((f) => f.fileName),
      });
    }
  }

  structured = validateOutboundAi(structured, policy);

  // Merge collected fields carefully (Node owns ERP writes)
  const patch: Record<string, unknown> = {
    lastCustomerAt: new Date(),
    lastAgentAt: new Date(),
    leadScore: structured.lead_score || conv.leadScore,
    urgency: priorityToUrgency(structured.priority),
    customerIntent: structured.intent || conv.customerIntent,
    recommendedProducts: JSON.stringify(structured.recommended_products || []),
  };
  if (structured.collected?.product) patch.product = structured.collected.product;
  if (structured.collected?.size) patch.size = structured.collected.size;
  if (structured.collected?.quantity) patch.quantity = structured.collected.quantity;
  if (structured.collected?.name) patch.customerName = structured.collected.name;
  if (structured.collected?.phone) patch.phone = structured.collected.phone;

  // Heuristic phone/name from message
  const phoneMatch = opts.message.replace(/\D/g, "").match(/([6-9]\d{9})/);
  if (phoneMatch) patch.phone = phoneMatch[1];

  await prisma.supportConversation.update({ where: { id: conv.id }, data: patch });

  const agentMsg = await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      role: "agent",
      content: structured.reply,
      messageType: "text",
      metadata: JSON.stringify({
        type: "gateway_ai",
        intent: structured.intent,
        lead_score: structured.lead_score,
        priority: structured.priority,
        temperature_label: hotWarmCold(structured.lead_score || 0),
        recommended_products: structured.recommended_products,
        next_question: structured.next_question,
        analysis: structured.analysis,
        model: (await isOllamaUp()) ? config.ollamaModel : "rules-engine",
      }),
    },
  });

  const leadId = await ensureLead(conv.id, structured);

  return {
    reply: structured.reply,
    message: agentMsg,
    sessionId: conv.sessionId,
    conversationId: conv.id,
    erp: {
      intent: structured.intent,
      lead_score: structured.lead_score,
      priority: structured.priority,
      lead_temperature: hotWarmCold(structured.lead_score || 0),
      recommended_products: structured.recommended_products,
      next_question: structured.next_question,
      analysis: structured.analysis,
      leadId,
    },
  };
}

export async function handleUpload(opts: {
  sessionId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  caption?: string;
}) {
  const conv = await prisma.supportConversation.findUnique({
    where: { sessionId: opts.sessionId },
  });
  if (!conv) throw new Error("SESSION_NOT_FOUND");

  if (opts.sizeBytes > config.maxUploadBytes) throw new Error("FILE_TOO_LARGE");

  // Virus scan hook (placeholder — integrate ClamAV later)
  const virusScan = { clean: true, engine: "hook-ready" };

  const cloud = await uploadToCloudinary({
    buffer: opts.buffer,
    fileName: opts.fileName,
    mimeType: opts.mimeType,
  });

  const ocr = await runOcr({
    buffer: opts.buffer,
    fileName: opts.fileName,
    mimeType: opts.mimeType,
  });

  let storageData: string | null = cloud?.url || null;
  if (!storageData && opts.sizeBytes <= 2 * 1024 * 1024 && opts.mimeType.startsWith("image/")) {
    storageData = `data:${opts.mimeType};base64,${opts.buffer.toString("base64")}`;
  }

  // Optional vision analysis via Ollama
  let visionAnalysis: Record<string, unknown> = {};
  const ollamaOk = await isOllamaUp();
  if (ollamaOk && opts.mimeType.startsWith("image/")) {
    try {
      const b64 = opts.buffer.toString("base64");
      const raw = await ollamaChat({
        system: buildSystemPrompt(retrieveCompanySlice(opts.caption || opts.fileName), {
          priceAsk: false,
          deliveryPromiseAsk: false,
          discountAsk: false,
          restricted: false,
        }),
        user: `Analyse this print artwork file "${opts.fileName}". OCR text: ${ocr.text.slice(0, 1500) || "(none)"}. Caption: ${opts.caption || ""}. Return JSON with reply summarizing for customer + analysis fields image_quality, resolution, logo, suitable_products.`,
        imagesBase64: [b64],
      });
      const parsed = parseAiJson(raw);
      visionAnalysis = parsed.analysis || {};
      const policy = applyInboundBusinessRules({ message: opts.caption || "file upload", hasFiles: true });
      const structured = validateOutboundAi(
        {
          ...parsed,
          reply:
            parsed.reply ||
            `We've received your file (${opts.fileName}). Our support team will review print quality and get back with the best quotation.`,
          lead_score: parsed.lead_score || 60,
        },
        policy,
      );

      const file = await prisma.supportFile.create({
        data: {
          conversationId: conv.id,
          fileName: opts.fileName,
          mimeType: opts.mimeType,
          sizeBytes: opts.sizeBytes,
          storageData,
          category: "Artwork",
          analysis: JSON.stringify({ ocr, vision: visionAnalysis, virusScan, cloudinary: cloud?.publicId }),
          ocrText: ocr.text || null,
        },
      });

      await prisma.supportMessage.create({
        data: {
          conversationId: conv.id,
          role: "customer",
          content: opts.caption || `Uploaded: ${opts.fileName}`,
          messageType: opts.mimeType.startsWith("image/") ? "image" : "file",
          metadata: JSON.stringify({ fileId: file.id, url: cloud?.url }),
        },
      });

      const agentMsg = await prisma.supportMessage.create({
        data: {
          conversationId: conv.id,
          role: "agent",
          content: structured.reply,
          messageType: "text",
          metadata: JSON.stringify({
            type: "gateway_ai",
            analysis: structured.analysis || visionAnalysis,
            ocr_engine: ocr.engine,
            recommended_products: structured.recommended_products,
          }),
        },
      });

      await ensureLead(conv.id, structured);

      return {
        reply: structured.reply,
        file,
        ocr,
        analysis: structured.analysis || visionAnalysis,
        message: agentMsg,
        sessionId: conv.sessionId,
      };
    } catch {
      /* fall through to non-vision path */
    }
  }

  // Non-vision / fallback path
  const policy = applyInboundBusinessRules({ message: opts.caption || "file upload", hasFiles: true });
  const structured = validateOutboundAi(
    rulesFallbackReply({
      message: opts.caption || opts.fileName,
      fileNames: [opts.fileName],
      ocrText: ocr.text,
    }),
    policy,
  );

  const file = await prisma.supportFile.create({
    data: {
      conversationId: conv.id,
      fileName: opts.fileName,
      mimeType: opts.mimeType,
      sizeBytes: opts.sizeBytes,
      storageData,
      category: "Artwork",
      analysis: JSON.stringify({ ocr, virusScan, cloudinary: cloud?.publicId }),
      ocrText: ocr.text || null,
    },
  });

  await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      role: "customer",
      content: opts.caption || `Uploaded: ${opts.fileName}`,
      messageType: opts.mimeType.startsWith("image/") ? "image" : "file",
      metadata: JSON.stringify({ fileId: file.id }),
    },
  });

  const agentMsg = await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      role: "agent",
      content: structured.reply,
      messageType: "text",
      metadata: JSON.stringify({ type: "gateway_ai", ocr_engine: ocr.engine }),
    },
  });

  await ensureLead(conv.id, structured);

  return {
    reply: structured.reply,
    file,
    ocr,
    analysis: { ocr_engine: ocr.engine },
    message: agentMsg,
    sessionId: conv.sessionId,
  };
}
