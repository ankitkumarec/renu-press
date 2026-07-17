import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";

if (config.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export async function uploadToCloudinary(opts: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}): Promise<{ url: string; publicId: string } | null> {
  if (!config.cloudinary.enabled) return null;

  const b64 = opts.buffer.toString("base64");
  const dataUri = `data:${opts.mimeType};base64,${b64}`;

  const res = await cloudinary.uploader.upload(dataUri, {
    folder: opts.folder || "renu-press/support",
    resource_type: "auto",
    public_id: opts.fileName.replace(/\.[^.]+$/, "").slice(0, 80) + "-" + Date.now(),
  });

  return { url: res.secure_url, publicId: res.public_id };
}
