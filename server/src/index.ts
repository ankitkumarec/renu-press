import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { chatRouter } from "./routes/chat";
import { initSocket } from "./socket";
import { isOllamaUp } from "./services/ollama";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(
  rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", async (_req, res) => {
  const ollama = await isOllamaUp();
  res.json({
    ok: true,
    service: "renu-press-support-gateway",
    ollama,
    model: config.ollamaModel,
    cloudinary: config.cloudinary.enabled,
    time: new Date().toISOString(),
  });
});

/**
 * Public support API (mirrors Next /api/support/* for drop-in frontend)
 * AI never touches DB — only services behind this gateway do.
 */
app.use("/api/support", chatRouter);
app.use("/v1/support", chatRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[gateway]", err);
  res.status(500).json({ ok: false, message: "Internal error" });
});

const server = http.createServer(app);
initSocket(server);

server.listen(config.port, () => {
  console.log(`❤️ RENU PRESS Support Gateway → http://localhost:${config.port}`);
  console.log(`   Ollama: ${config.ollamaBaseUrl} model=${config.ollamaModel}`);
  console.log(`   Cloudinary: ${config.cloudinary.enabled ? "on" : "off"}`);
});
