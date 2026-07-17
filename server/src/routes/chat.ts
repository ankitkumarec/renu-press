import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { createOrGetSession, handleChatMessage, handleUpload } from "../services/chatService";
import { config } from "../config";
import { getIo } from "../socket";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes },
});

export const chatRouter = Router();

chatRouter.post("/session", async (req, res) => {
  try {
    const body = z.object({ sessionId: z.string().optional().nullable() }).parse(req.body || {});
    const conv = await createOrGetSession(body.sessionId);
    res.json({
      ok: true,
      sessionId: conv.sessionId,
      conversationId: conv.id,
      status: conv.status,
      messages: conv.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        messageType: m.messageType,
        metadata: m.metadata,
        createdAt: m.createdAt,
      })),
      files: conv.files?.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        mimeType: f.mimeType,
        category: f.category,
        sizeBytes: f.sizeBytes,
      })),
      gateway: true,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Could not start session" });
  }
});

chatRouter.post("/chat", async (req, res) => {
  try {
    const body = z
      .object({
        sessionId: z.string().min(8),
        message: z.string().min(1).max(4000),
      })
      .parse(req.body);

    const result = await handleChatMessage(body);

    try {
      getIo()?.to(`session:${body.sessionId}`).emit("support:message", {
        role: "agent",
        content: result.reply,
        erp: result.erp,
      });
    } catch {
      /* socket optional */
    }

    res.json({
      ok: true,
      reply: result.reply,
      message: {
        id: result.message.id,
        role: result.message.role,
        content: result.message.content,
        messageType: result.message.messageType,
        metadata: result.message.metadata,
        createdAt: result.message.createdAt,
      },
      sessionId: result.sessionId,
      erp: result.erp,
      gateway: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chat failed";
    if (msg === "SESSION_NOT_FOUND") {
      res.status(404).json({ ok: false, message: "Session expired. Refresh page." });
      return;
    }
    console.error(e);
    res.status(500).json({ ok: false, message: "Could not send message" });
  }
});

chatRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const sessionId = String(req.body.sessionId || "");
    const caption = String(req.body.caption || "");
    if (!sessionId) {
      res.status(400).json({ ok: false, message: "Missing session" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ ok: false, message: "No file" });
      return;
    }

    const result = await handleUpload({
      sessionId,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype || "application/octet-stream",
      sizeBytes: req.file.size,
      buffer: req.file.buffer,
      caption,
    });

    try {
      getIo()?.to(`session:${sessionId}`).emit("support:message", {
        role: "agent",
        content: result.reply,
      });
    } catch {
      /* ignore */
    }

    res.json({
      ok: true,
      reply: result.reply,
      file: {
        id: result.file.id,
        fileName: result.file.fileName,
        mimeType: result.file.mimeType,
        category: result.file.category,
        sizeBytes: result.file.sizeBytes,
      },
      ocr: result.ocr,
      analysis: result.analysis,
      message: {
        id: result.message.id,
        role: result.message.role,
        content: result.message.content,
        createdAt: result.message.createdAt,
      },
      sessionId: result.sessionId,
      gateway: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg === "SESSION_NOT_FOUND") {
      res.status(404).json({ ok: false, message: "Session expired" });
      return;
    }
    if (msg === "FILE_TOO_LARGE") {
      res.status(400).json({ ok: false, message: "File too large" });
      return;
    }
    console.error(e);
    res.status(500).json({ ok: false, message: "Upload failed" });
  }
});
