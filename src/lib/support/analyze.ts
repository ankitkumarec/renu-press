/** Heuristic artwork / file analysis (no hallucination of prices) */

export type FileAnalysis = {
  category: string;
  qualityNotes: string[];
  logoChecks: string[];
  suitableFor: string[];
  summary: string;
  ocrHints: string[];
};

const CATEGORY_RULES: { re: RegExp; category: string }[] = [
  { re: /banner|hoarding|hoard/i, category: "Banner / Hoarding" },
  { re: /poster|flyer|pamphlet/i, category: "Poster / Flyer" },
  { re: /logo|brand.?mark/i, category: "Logo" },
  { re: /visiting|business.?card|vcard/i, category: "Business Card" },
  { re: /wedding|shaadi|invitation|card/i, category: "Wedding / Invitation Card" },
  { re: /packag|box|carton/i, category: "Packaging" },
  { re: /sticker|label/i, category: "Sticker / Label" },
  { re: /flex|vinyl/i, category: "Flex / Vinyl" },
  { re: /t[- ]?shirt|hoodie|apparel|tee/i, category: "T-Shirt / Apparel Design" },
  { re: /mug|cup/i, category: "Mug Design" },
  { re: /id.?card|pvc|lanyard/i, category: "ID / PVC Card" },
  { re: /certif|award/i, category: "Certificate" },
  { re: /vehicle|car.?brand|auto/i, category: "Vehicle Graphics" },
  { re: /board|signage|acp|glow|led/i, category: "Sign Board / LED / ACP" },
  { re: /gift|trophy|medal/i, category: "Gift / Trophy" },
  { re: /photo|frame|portrait/i, category: "Photo Print / Frame" },
  { re: /bill|invoice|receipt|upi|payment/i, category: "Bill / Invoice / Receipt" },
  { re: /brochure|catalogue/i, category: "Brochure" },
];

export function detectCategory(fileName: string, mimeType: string, userHint = ""): string {
  const hay = `${fileName} ${userHint}`;
  for (const r of CATEGORY_RULES) {
    if (r.re.test(hay)) return r.category;
  }
  if (mimeType.startsWith("image/")) return "Artwork / Image";
  if (mimeType === "application/pdf") return "PDF Document";
  if (mimeType.startsWith("audio/")) return "Voice Note";
  if (mimeType.startsWith("video/")) return "Video Reference";
  if (/zip|rar/i.test(mimeType) || /\.(zip|rar)$/i.test(fileName)) return "Archive (ZIP/RAR)";
  if (/\.(ai|psd|cdr|svg)$/i.test(fileName)) return "Design Source File";
  return "Reference File";
}

export function analyzeUpload(opts: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  userHint?: string;
}): FileAnalysis {
  const category = detectCategory(opts.fileName, opts.mimeType, opts.userHint);
  const qualityNotes: string[] = [];
  const logoChecks: string[] = [];
  const suitableFor: string[] = [];
  const ocrHints: string[] = [];

  const ext = opts.fileName.split(".").pop()?.toLowerCase() || "";
  const isImage = opts.mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "heic"].includes(ext);
  const isVector = ["svg", "ai", "cdr", "eps", "pdf"].includes(ext);
  const isPdf = opts.mimeType === "application/pdf" || ext === "pdf";

  if (opts.sizeBytes < 40_000 && isImage) {
    qualityNotes.push(
      "File size chhoti lag rahi hai — large banner / flex ke liye resolution kam ho sakti hai. Agar possible ho to higher resolution artwork bhej dein.",
    );
  }
  if (opts.sizeBytes > 6 * 1024 * 1024) {
    qualityNotes.push("File size badi hai — receive ho gayi. Team print-ready check karegi.");
  }

  if (category === "Logo" || /logo/i.test(opts.fileName)) {
    logoChecks.push(
      isVector
        ? "Vector / design source format detect hua — large print ke liye better."
        : "Raster image lag rahi hai — logo ke liye vector (AI/SVG/PDF) prefer kiya jata hai.",
    );
    logoChecks.push("Transparency / background team artwork review me check karegi.");
    logoChecks.push("Large banner / flex ke liye high-resolution ya vector best rehta hai.");
    suitableFor.push("Visiting cards", "Letterheads", "Flex / Banner (if high-res)", "Sign boards");
  }

  if (isImage) {
    suitableFor.push("Print reference", "Colour / layout preview");
    ocrHints.push("Business card / bill / certificate ho to team text (name, phone, GST) extract karke lead me note karegi.");
  }
  if (isPdf) {
    suitableFor.push("Specification / artwork PDF");
    ocrHints.push("PDF se size, quantity, aur instructions summary banayi jayegi.");
  }
  if (opts.mimeType.startsWith("audio/")) {
    qualityNotes.push("Voice note receive — team sun kar requirement note karegi.");
  }

  if (!suitableFor.length) suitableFor.push("Team review after handover");

  const summary = [
    `File type: ${category}.`,
    qualityNotes[0] || "File safely receive ho gayi hai.",
    logoChecks[0] || "",
  ]
    .filter(Boolean)
    .join(" ");

  return { category, qualityNotes, logoChecks, suitableFor, summary, ocrHints };
}

export function buildFileAgentReply(analysis: FileAnalysis, lang: "hi" | "en" | "hinglish") {
  const lines: string[] = [];
  if (lang === "en") {
    lines.push(`Thank you — file received.`);
    lines.push(`Looks like: ${analysis.category}.`);
    if (analysis.qualityNotes[0]) lines.push(analysis.qualityNotes[0]);
    if (analysis.logoChecks[0]) lines.push(analysis.logoChecks[0]);
    lines.push("Our team will verify print readiness. Final printability is confirmed after admin review.");
  } else {
    lines.push(`Dhanyavaad — file receive ho gayi.`);
    lines.push(`Yeh lag raha hai: ${analysis.category}.`);
    if (analysis.qualityNotes[0]) lines.push(analysis.qualityNotes[0]);
    if (analysis.logoChecks[0]) lines.push(analysis.logoChecks[0]);
    lines.push("Print readiness team verify karegi. Final confirmation admin review ke baad hoti hai.");
  }
  return lines.join("\n\n");
}
