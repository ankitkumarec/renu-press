import path from "path";
import dotenv from "dotenv";

// Load root .env then server/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  port: Number(process.env.SUPPORT_GATEWAY_PORT || process.env.PORT || 4001),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "renu-press-dev-secret",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000,https://renu-press.vercel.app")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // Ollama — local vision/language model
  ollamaBaseUrl: (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, ""),
  ollamaModel: process.env.OLLAMA_MODEL || "qwen2.5vl:7b",
  ollamaTimeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 120_000),

  // PaddleOCR optional Python helper
  paddleOcrCmd: process.env.PADDLE_OCR_CMD || "python",
  paddleOcrScript: process.env.PADDLE_OCR_SCRIPT || path.resolve(__dirname, "../scripts/paddle_ocr.py"),

  // Cloudinary optional
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    enabled: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
    ),
  },

  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024),
  rateLimitWindowMs: 60_000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 120),
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || "RENU PRESS",
};

export type AppConfig = typeof config;
