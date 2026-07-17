import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { config } from "../config";

/**
 * PaddleOCR integration (optional).
 * If Python script unavailable, returns empty OCR + note — Node still proceeds with VL model / heuristics.
 */
export async function runOcr(opts: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<{ text: string; engine: string; ok: boolean }> {
  if (!opts.mimeType.startsWith("image/") && opts.mimeType !== "application/pdf") {
    return { text: "", engine: "none", ok: true };
  }

  const script = config.paddleOcrScript;
  if (!fs.existsSync(script)) {
    return {
      text: "",
      engine: "paddleocr-unavailable",
      ok: false,
    };
  }

  const tmp = path.join(os.tmpdir(), `rp-ocr-${Date.now()}-${opts.fileName.replace(/[^\w.-]/g, "_")}`);
  await fs.promises.writeFile(tmp, opts.buffer);

  try {
    const text = await new Promise<string>((resolve, reject) => {
      const child = spawn(config.paddleOcrCmd, [script, tmp], {
        timeout: 60_000,
        windowsHide: true,
      });
      let out = "";
      let err = "";
      child.stdout.on("data", (d) => (out += d.toString()));
      child.stderr.on("data", (d) => (err += d.toString()));
      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) resolve(out.trim());
        else reject(new Error(err || `OCR exit ${code}`));
      });
    });
    return { text, engine: "paddleocr", ok: true };
  } catch {
    return { text: "", engine: "paddleocr-failed", ok: false };
  } finally {
    fs.promises.unlink(tmp).catch(() => undefined);
  }
}
