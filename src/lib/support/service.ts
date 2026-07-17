import { prisma } from "@/lib/db";
import { analyzeUpload, buildFileAgentReply } from "./analyze";
import {
  buildSummary,
  computeLeadScore,
  computeUrgency,
  initialWelcome,
  polishWithGrok,
  processCustomerMessage,
  recommendedProducts,
  type ConversationState,
} from "./agent";
import { ALLOWED_EXT, ALLOWED_MIME, MAX_FILE_BYTES, MAX_STORAGE_BYTES } from "./constants";
import {
  matchPortfolio,
  recommendFromImageScene,
  serializeRecommendation,
} from "./recommend";
import { randomBytes } from "crypto";

function sessionId() {
  return `rp_${randomBytes(16).toString("hex")}`;
}

export async function getOrCreateConversation(existingSessionId?: string | null) {
  if (existingSessionId) {
    const found = await prisma.supportConversation.findUnique({
      where: { sessionId: existingSessionId },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 200 },
        files: { where: { deleted: false }, orderBy: { createdAt: "desc" } },
      },
    });
    if (found) return found;
  }

  const sid = sessionId();
  const welcome = initialWelcome("hinglish");
  const conv = await prisma.supportConversation.create({
    data: {
      sessionId: sid,
      nextField: "product",
      status: "NEW_INQUIRY",
      messages: {
        create: {
          role: "agent",
          content: welcome,
          messageType: "text",
        },
      },
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      files: true,
    },
  });
  return conv;
}

function stateFromConv(c: {
  customerName: string | null;
  phone: string | null;
  email: string | null;
  businessName: string | null;
  city: string | null;
  deliveryAddress: string | null;
  product: string | null;
  size: string | null;
  material: string | null;
  quantity: string | null;
  deadline: string | null;
  budget: string | null;
  remarks: string | null;
  nextField: string | null;
  collectedFields: string;
  language: string;
  status: string;
  customerIntent?: string | null;
  interestedCategory?: string | null;
  suggestedBundle?: string | null;
  recommendedProducts?: string | null;
  recommendationJson?: string | null;
}): ConversationState {
  return {
    customerName: c.customerName,
    phone: c.phone,
    email: c.email,
    businessName: c.businessName,
    city: c.city,
    deliveryAddress: c.deliveryAddress,
    product: c.product,
    size: c.size,
    material: c.material,
    quantity: c.quantity,
    deadline: c.deadline,
    budget: c.budget,
    remarks: c.remarks,
    nextField: c.nextField,
    collectedFields: c.collectedFields,
    language: c.language,
    status: c.status,
    customerIntent: c.customerIntent,
    interestedCategory: c.interestedCategory,
    suggestedBundle: c.suggestedBundle,
    recommendedProducts: c.recommendedProducts,
    recommendationJson: c.recommendationJson,
  };
}

async function attachPortfolio(rec: NonNullable<ReturnType<typeof processCustomerMessage>["recommendation"]>) {
  const items = await prisma.portfolioItem.findMany({
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: 24,
  });
  return matchPortfolio(rec.products, items);
}

async function ensureLeadAndNotify(conversationId: string) {
  const conv = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
    include: { files: { where: { deleted: false } }, messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conv || !conv.phone || !conv.customerName) return null;

  const fileNames = conv.files.map((f) => f.fileName);
  const summary = buildSummary(stateFromConv(conv), fileNames);
  const score = computeLeadScore(stateFromConv(conv), conv.files.length);
  const urgency = computeUrgency(stateFromConv(conv));
  const rec = recommendedProducts(conv.product);

  const leadMessage = [
    summary,
    "",
    "— Digital Support Desk —",
    `Urgency: ${urgency}`,
    `Lead score: ${score}`,
    `Session: ${conv.sessionId}`,
  ].join("\n");

  let leadId = conv.leadId;
  if (leadId) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        name: conv.customerName,
        phone: conv.phone,
        email: conv.email,
        service: conv.product,
        message: leadMessage,
        status: conv.status.toLowerCase(),
        urgency,
        leadScore: score,
        city: conv.city,
        businessName: conv.businessName,
        summary,
        notes: rec.join(", "),
        source: "support_desk",
      },
    });
  } else {
    const lead = await prisma.lead.create({
      data: {
        name: conv.customerName,
        phone: conv.phone,
        email: conv.email,
        service: conv.product,
        message: leadMessage,
        status: "waiting_review",
        urgency,
        leadScore: score,
        city: conv.city,
        businessName: conv.businessName,
        summary,
        notes: [
          conv.suggestedBundle ? `Bundle: ${conv.suggestedBundle}` : "",
          conv.customerIntent ? `Intent: ${conv.customerIntent}` : "",
          `Recommended: ${rec.join(", ")}`,
        ]
          .filter(Boolean)
          .join(" · "),
        source: "support_desk",
      },
    });
    leadId = lead.id;
    await prisma.supportConversation.update({
      where: { id: conv.id },
      data: { leadId: lead.id },
    });
  }

  await prisma.supportConversation.update({
    where: { id: conv.id },
    data: {
      aiSummary: summary,
      leadScore: score,
      urgency,
      recommendedProducts: JSON.stringify(rec),
      status: "WAITING_REVIEW",
      notifiedAdmin: true,
      adminNotifiedAt: new Date(),
    },
  });

  // Admin alert
  const existing = await prisma.adminAlert.findFirst({
    where: {
      type: "SUPPORT_LEAD",
      href: `/erp/support/${conv.id}`,
      createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
  });
  if (!existing) {
    await prisma.adminAlert.create({
      data: {
        type: "SUPPORT_LEAD",
        title: `New support lead · ${conv.customerName}`,
        body: `${conv.product || "Inquiry"} · ${urgency} · score ${score} · ${conv.phone}`,
        href: `/erp/support/${conv.id}`,
        meta: JSON.stringify({
          conversationId: conv.id,
          leadId,
          product: conv.product,
          urgency,
          leadScore: score,
          files: fileNames,
        }),
      },
    });
  }

  // Notify admin users
  const admins = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
    select: { id: true },
  });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: `Support desk: ${conv.customerName}`,
        body: `${conv.product || "Inquiry"} · ${conv.phone} · score ${score}`,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "SUPPORT_LEAD_HANDOVER",
      entity: "SupportConversation",
      meta: JSON.stringify({ conversationId: conv.id, leadId, score, urgency }),
    },
  });

  return leadId;
}

export async function handleChat(sessionId: string, message: string) {
  const conv = await prisma.supportConversation.findUnique({ where: { sessionId } });
  if (!conv) throw new Error("SESSION_NOT_FOUND");

  const text = (message || "").slice(0, 4000);

  await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      role: "customer",
      content: text || "(empty)",
      messageType: "text",
    },
  });

  const result = processCustomerMessage(stateFromConv(conv), text);
  let reply = result.reply;
  let meta: string | null = null;

  if (result.recommendation) {
    const portfolio = await attachPortfolio(result.recommendation);
    meta = serializeRecommendation(result.recommendation, portfolio);
    result.patch.recommendationJson = meta;
  }

  // Don't polish recommendation cards into unstructured prose when we have structured cards
  if (!result.recommendation) {
    const polished = await polishWithGrok({
      systemContext: buildSummary({ ...stateFromConv(conv), ...result.patch }, []),
      userMessage: text,
      draftReply: reply,
    });
    if (polished) reply = polished;
  }

  const data: Record<string, unknown> = {
    lastCustomerAt: new Date(),
    lastAgentAt: new Date(),
  };
  const p = result.patch;
  const keys = [
    "customerName",
    "phone",
    "email",
    "businessName",
    "city",
    "deliveryAddress",
    "product",
    "size",
    "material",
    "quantity",
    "deadline",
    "budget",
    "remarks",
    "nextField",
    "collectedFields",
    "language",
    "status",
    "leadScore",
    "urgency",
    "aiSummary",
    "recommendedProducts",
    "customerIntent",
    "interestedCategory",
    "suggestedBundle",
    "recommendationJson",
  ] as const;
  for (const k of keys) {
    if (p[k] !== undefined) data[k] = p[k];
  }

  await prisma.supportConversation.update({
    where: { id: conv.id },
    data,
  });

  const agentMsg = await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      role: "agent",
      content: reply,
      messageType: result.messageType || "text",
      metadata: meta,
    },
  });

  if (p.readyForHandover) {
    await ensureLeadAndNotify(conv.id);
  } else if (p.phone && p.customerName && p.product) {
    const updated = await prisma.supportConversation.findUnique({ where: { id: conv.id } });
    if (updated?.phone && updated.customerName && (updated.leadScore || 0) >= 40) {
      await ensureLeadAndNotify(conv.id);
    }
  }

  return {
    reply,
    message: agentMsg,
    conversationId: conv.id,
    sessionId: conv.sessionId,
    recommendation: result.recommendation
      ? JSON.parse(meta || "{}")
      : null,
  };
}

export async function handleUpload(opts: {
  sessionId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl?: string;
  caption?: string;
}) {
  const conv = await prisma.supportConversation.findUnique({ where: { sessionId: opts.sessionId } });
  if (!conv) throw new Error("SESSION_NOT_FOUND");

  const ext = opts.fileName.split(".").pop()?.toLowerCase() || "";
  if (opts.sizeBytes > MAX_FILE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  if (!ALLOWED_MIME.has(opts.mimeType) && !ALLOWED_EXT.has(ext)) {
    // allow if extension ok
    if (!ALLOWED_EXT.has(ext)) throw new Error("FILE_TYPE_NOT_ALLOWED");
  }

  // Virus scan hook (no-op ready)
  await virusScanHook({ fileName: opts.fileName, mimeType: opts.mimeType, sizeBytes: opts.sizeBytes });

  let storageData: string | null = null;
  if (opts.dataUrl && opts.dataUrl.length <= MAX_STORAGE_BYTES * 1.4) {
    storageData = opts.dataUrl;
  }

  const analysis = analyzeUpload({
    fileName: opts.fileName,
    mimeType: opts.mimeType,
    sizeBytes: opts.sizeBytes,
    userHint: opts.caption,
  });

  const file = await prisma.supportFile.create({
    data: {
      conversationId: conv.id,
      fileName: opts.fileName,
      mimeType: opts.mimeType,
      sizeBytes: opts.sizeBytes,
      storageData,
      analysis: JSON.stringify(analysis),
      category: analysis.category,
      ocrText: analysis.ocrHints.join(" | ") || null,
    },
  });

  await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      role: "customer",
      content: opts.caption || `Uploaded: ${opts.fileName}`,
      messageType: opts.mimeType.startsWith("image/")
        ? "image"
        : opts.mimeType.startsWith("audio/")
          ? "voice"
          : "file",
      metadata: JSON.stringify({ fileId: file.id, fileName: opts.fileName, mimeType: opts.mimeType }),
    },
  });

  const lang = (conv.language as "hi" | "en" | "hinglish") || "hinglish";
  const fileReply = buildFileAgentReply(analysis, lang);
  const imageRec = recommendFromImageScene(analysis.category, opts.fileName, lang);
  const result = processCustomerMessage(stateFromConv(conv), opts.caption || analysis.category, {
    fileJustUploaded: true,
    fileReply,
    forceRecommendation: imageRec,
  });

  let reply = result.reply;
  let meta: string | null = null;
  if (result.recommendation) {
    const portfolio = await attachPortfolio(result.recommendation);
    meta = serializeRecommendation(result.recommendation, portfolio);
    result.patch.recommendationJson = meta;
  } else {
    meta = JSON.stringify({ fileId: file.id, analysis });
  }

  if (!result.recommendation) {
    const polished = await polishWithGrok({
      systemContext: `File: ${opts.fileName} · ${analysis.summary}`,
      userMessage: opts.caption || `[file ${opts.fileName}]`,
      draftReply: reply,
    });
    if (polished) reply = polished;
  }

  const data: Record<string, unknown> = {
    lastCustomerAt: new Date(),
    lastAgentAt: new Date(),
  };
  const p = result.patch;
  for (const k of [
    "nextField",
    "collectedFields",
    "language",
    "status",
    "leadScore",
    "urgency",
    "aiSummary",
    "product",
    "recommendedProducts",
    "customerIntent",
    "interestedCategory",
    "suggestedBundle",
    "recommendationJson",
  ] as const) {
    if (p[k] !== undefined) data[k] = p[k];
  }

  await prisma.supportConversation.update({ where: { id: conv.id }, data });

  await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      role: "agent",
      content: reply,
      messageType: result.messageType || "text",
      metadata: meta,
    },
  });

  if (p.readyForHandover) await ensureLeadAndNotify(conv.id);

  return {
    file,
    reply,
    analysis,
    recommendation: result.recommendation ? JSON.parse(meta || "{}") : null,
  };
}

/** Hook for future AV scanning integration */
export async function virusScanHook(_meta: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<{ clean: boolean }> {
  return { clean: true };
}
