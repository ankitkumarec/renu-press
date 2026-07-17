/**
 * RENU PRESS — Enterprise Artwork Quality Inspector
 * Senior pre-press QC logic (heuristic + buffer metadata). Never mutates original.
 */

export type PrintGrade = "Excellent" | "Good" | "Average" | "Needs Improvement" | "Not Printable";

export type InspectionCheck = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "info";
  value: string;
  detail: string;
};

export type PrintReadinessReport = {
  version: number;
  analyzedAt: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  score: number;
  grade: PrintGrade;
  headline: string;
  friendlySummary: string;
  resolution: {
    level: "Low" | "Medium" | "High" | "Unknown";
    estimatedDpi: number | null;
    pixelWidth: number | null;
    pixelHeight: number | null;
    aspectRatio: string | null;
    maxPrintSize: string;
  };
  colour: {
    mode: string;
    recommendation: string;
  };
  format: {
    type: "Vector" | "Raster" | "Document" | "Archive" | "Unknown";
    hasTransparency: string;
    compressionNote: string;
  };
  logo: {
    isLogoLikely: boolean;
    scalable: string;
    suitableNotes: string[];
  };
  bleed: {
    status: string;
    suggestion: string;
  };
  typography: {
    status: string;
    notes: string[];
  };
  imageQuality: {
    blurRisk: string;
    noiseRisk: string;
    screenshotRisk: string;
    contrastNote: string;
  };
  checks: InspectionCheck[];
  warnings: string[];
  suggestions: string[];
  oneClickFixes: { id: string; label: string; description: string; optional: boolean }[];
  suitableFor: { product: string; ok: boolean; reason: string }[];
  maxPrintSize: string;
  visualHints: { zone: string; severity: "info" | "warn" | "fail"; note: string }[];
  originalPreserved: true;
};

const PRINT_PRODUCTS = [
  "Flex Banner",
  "Vinyl",
  "Sticker",
  "Business Card",
  "Visiting Card",
  "Wedding Card",
  "Bill Book",
  "Poster",
  "Flyer",
  "Brochure",
  "Catalogue",
  "Photo",
  "Canvas",
  "Packaging",
  "Box",
  "Paper Bag",
  "Carry Bag",
  "T-Shirt",
  "Mug",
  "Bottle",
  "Cap",
  "Keychain",
  "Trophy Plate",
  "ID Card",
  "Certificate",
  "Corporate Branding",
  "Vehicle Branding",
  "Shop Board",
  "LED Board",
  "ACP Board",
  "Hoarding",
  "Banner",
] as const;

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() || "";
}

/** Read PNG dimensions from buffer */
function readPngSize(buf: Buffer): { w: number; h: number } | null {
  if (buf.length < 24) return null;
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** Read JPEG dimensions (SOF) */
function readJpegSize(buf: Buffer): { w: number; h: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return { w, h };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspect(w: number, h: number) {
  const g = gcd(w, h) || 1;
  return `${Math.round(w / g)}:${Math.round(h / g)}`;
}

function gradeFromScore(score: number): PrintGrade {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 55) return "Average";
  if (score >= 35) return "Needs Improvement";
  return "Not Printable";
}

function detectCategory(fileName: string, mime: string, hint = "") {
  const hay = `${fileName} ${hint}`.toLowerCase();
  if (/logo/.test(hay)) return "Logo";
  if (/banner|flex|hoarding/.test(hay)) return "Banner / Flex";
  if (/visiting|business.?card/.test(hay)) return "Business Card";
  if (/wedding|invitation/.test(hay)) return "Wedding Card";
  if (/poster|flyer/.test(hay)) return "Poster / Flyer";
  if (/brochure|catalogue/.test(hay)) return "Brochure";
  if (/sticker|label/.test(hay)) return "Sticker";
  if (/packag|box|bag/.test(hay)) return "Packaging";
  if (/t[- ]?shirt|mug|cap|bottle/.test(hay)) return "Apparel / Gift";
  if (/id.?card|pvc|certificate/.test(hay)) return "ID / Certificate";
  if (/vehicle|board|acp|led|shop/.test(hay)) return "Signage";
  if (mime.startsWith("image/")) return "Artwork";
  if (mime === "application/pdf" || /\.pdf$/i.test(fileName)) return "PDF Artwork";
  if (/\.(ai|eps|svg|cdr)$/i.test(fileName)) return "Vector Source";
  if (/\.(psd|tiff|tif)$/i.test(fileName)) return "Design Source";
  return "Print File";
}

export type InspectInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Optional raw bytes for dimension sniffing (images) */
  buffer?: Buffer | null;
  userHint?: string;
  productHint?: string;
};

export function inspectArtwork(input: InspectInput): PrintReadinessReport {
  const ext = extOf(input.fileName);
  const mime = input.mimeType || "application/octet-stream";
  const category = detectCategory(input.fileName, mime, `${input.userHint || ""} ${input.productHint || ""}`);
  const checks: InspectionCheck[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const visualHints: PrintReadinessReport["visualHints"] = [];
  const oneClickFixes: PrintReadinessReport["oneClickFixes"] = [];

  const isRaster =
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "bmp", "tif", "tiff", "heic"].includes(ext);
  const isVector = ["svg", "ai", "eps", "cdr"].includes(ext);
  const isPdf = mime === "application/pdf" || ext === "pdf";
  const isPsd = ext === "psd";
  const isDoc = ["doc", "docx"].includes(ext);
  const isZip = ["zip", "rar"].includes(ext);

  // Dimensions from buffer
  let pixelW: number | null = null;
  let pixelH: number | null = null;
  if (input.buffer && input.buffer.length > 24) {
    const png = readPngSize(input.buffer);
    const jpg = readJpegSize(input.buffer);
    if (png) {
      pixelW = png.w;
      pixelH = png.h;
    } else if (jpg) {
      pixelW = jpg.w;
      pixelH = jpg.h;
    }
  }

  // Score base
  let score = 72;

  // File size checks
  checks.push({
    id: "file_size",
    label: "File size",
    status: input.sizeBytes < 25_000 ? "warn" : input.sizeBytes > 25 * 1024 * 1024 ? "warn" : "pass",
    value: `${(input.sizeBytes / 1024).toFixed(0)} KB`,
    detail:
      input.sizeBytes < 25_000
        ? "File bahut chhoti hai — large print me pixelation ho sakta hai."
        : "Size receive range me hai.",
  });
  if (input.sizeBytes < 25_000 && isRaster) {
    score -= 18;
    warnings.push("File size low — large flex/banner ke liye resolution short pad sakti hai.");
    visualHints.push({ zone: "full-frame", severity: "warn", note: "Possible low-detail / compressed source" });
  }
  if (input.sizeBytes > 20 * 1024 * 1024) {
    score -= 3;
    suggestions.push("Bahut badi file — print ke liye PDF/X ya optimised export better rehta hai (original safe rahega).");
  }

  // Format
  let formatType: PrintReadinessReport["format"]["type"] = "Unknown";
  if (isVector) formatType = "Vector";
  else if (isRaster) formatType = "Raster";
  else if (isPdf || isDoc) formatType = "Document";
  else if (isZip) formatType = "Archive";

  if (isVector) {
    score += 12;
    checks.push({
      id: "format",
      label: "Format",
      status: "pass",
      value: "Vector / design source",
      detail: "Scale-friendly — flex, ACP, vehicle branding ke liye strong choice.",
    });
  } else if (isPdf) {
    score += 8;
    checks.push({
      id: "format",
      label: "Format",
      status: "pass",
      value: "PDF",
      detail: "PDF print industry standard. Fonts embed + PDF/X preferred.",
    });
    suggestions.push("Export PDF/X-1a ya PDF/X-4 with fonts embedded.");
    oneClickFixes.push({
      id: "pdfx",
      label: "Request PDF/X export guide",
      description: "Team ko PDF/X export checklist bhej sakte hain (original file nahi badlegi).",
      optional: true,
    });
  } else if (isRaster) {
    checks.push({
      id: "format",
      label: "Format",
      status: "info",
      value: "Raster image",
      detail: "Pixel-based. Large boards ke liye high DPI / large pixel dimensions zaroori.",
    });
  } else if (isPsd) {
    score += 5;
    checks.push({
      id: "format",
      label: "Format",
      status: "info",
      value: "PSD",
      detail: "Layered source. Production me flattened PDF/TIFF bhi attach karein.",
    });
    suggestions.push("Print ke saath flattened high-res PDF/TIFF bhi bhejein.");
  }

  // Transparency
  let transparency = "Unknown / check at proof";
  if (ext === "png" || ext === "svg" || ext === "webp") {
    transparency = "Likely supports transparency";
    score += 3;
    checks.push({
      id: "transparency",
      label: "Transparency",
      status: "pass",
      value: "Supported format",
      detail: "Logo cut-outs / stickers ke liye helpful. Final proof pe background check hoga.",
    });
  } else if (["jpg", "jpeg", "bmp"].includes(ext)) {
    transparency = "No alpha (JPEG/BMP)";
    checks.push({
      id: "transparency",
      label: "Transparency",
      status: "info",
      value: "No transparency channel",
      detail: "White/coloured background fixed rahega — sticker die-cut ke liye PNG/SVG better.",
    });
  }

  // Resolution estimate
  let resLevel: "Low" | "Medium" | "High" | "Unknown" = "Unknown";
  let estimatedDpi: number | null = null;
  let maxPrint = "Team size confirm karke batayegi";

  if (pixelW && pixelH) {
    const megapix = (pixelW * pixelH) / 1_000_000;
    // Assume common viewing: 150 dpi outdoor, 300 dpi cards
    const inchesAt150 = Math.min(pixelW, pixelH) / 150;
    const inchesAt300 = Math.min(pixelW, pixelH) / 300;
    const feetW = pixelW / 150 / 12;
    const feetH = pixelH / 150 / 12;
    maxPrint = `~${feetW.toFixed(1)} ft × ${feetH.toFixed(1)} ft @ 150 DPI (outdoor) · ~${(pixelW / 300).toFixed(1)}" × ${(pixelH / 300).toFixed(1)}" @ 300 DPI (cards)`;
    estimatedDpi = megapix > 8 ? 300 : megapix > 2 ? 200 : 120;

    if (pixelW >= 3000 || pixelH >= 3000 || megapix >= 6) {
      resLevel = "High";
      score += 10;
    } else if (pixelW >= 1200 || pixelH >= 1200 || megapix >= 1.5) {
      resLevel = "Medium";
      score += 2;
    } else {
      resLevel = "Low";
      score -= 20;
      warnings.push("Resolution low lag rahi hai — bade print pe blur/pixel dikh sakte hain.");
      visualHints.push({ zone: "edges-and-detail", severity: "fail", note: "Low pixel density — enlarge carefully" });
      oneClickFixes.push({
        id: "upscale",
        label: "Request AI upscale (optional)",
        description: "Original safe rahega; enhanced copy alag version me banegi (admin approve).",
        optional: true,
      });
    }

    checks.push({
      id: "dimensions",
      label: "Pixel dimensions",
      status: resLevel === "Low" ? "fail" : resLevel === "Medium" ? "warn" : "pass",
      value: `${pixelW} × ${pixelH} px`,
      detail: `Aspect ${aspect(pixelW, pixelH)}. Min side @300dpi ≈ ${inchesAt300.toFixed(1)}", @150dpi ≈ ${inchesAt150.toFixed(1)}".`,
    });
    checks.push({
      id: "resolution_level",
      label: "Resolution",
      status: resLevel === "High" ? "pass" : resLevel === "Medium" ? "warn" : "fail",
      value: resLevel,
      detail: maxPrint,
    });
  } else if (isRaster) {
    // Heuristic from file size
    if (input.sizeBytes > 2_000_000) {
      resLevel = "High";
      score += 4;
      maxPrint = "Large outdoor possible (exact size pixel metadata nahi mila — team measure karegi)";
    } else if (input.sizeBytes > 400_000) {
      resLevel = "Medium";
      maxPrint = "Medium boards / posters likely; large hoarding verify needed";
    } else {
      resLevel = "Low";
      score -= 12;
      maxPrint = "Small prints / digital preview only until higher-res file aaye";
      warnings.push("Pixel size detect nahi hui aur file chhoti hai — higher quality export bhejein.");
    }
    checks.push({
      id: "resolution_level",
      label: "Resolution",
      status: resLevel === "Low" ? "warn" : "info",
      value: resLevel,
      detail: "Estimated from file weight (open metadata unavailable for this format).",
    });
  } else if (isVector || isPdf) {
    resLevel = "High";
    maxPrint = "Vector/PDF — scale theoretically unlimited (raster effects inside PDF alag check)";
    score += 8;
    checks.push({
      id: "resolution_level",
      label: "Resolution",
      status: "pass",
      value: "Scale-friendly",
      detail: maxPrint,
    });
  }

  // Colour
  let colourMode = "Assumed RGB (web export)";
  let colourRec = "Print se pehle CMYK conversion + soft-proof recommended.";
  if (isPdf || isPsd || isVector) {
    colourMode = "Check embedded profile (RGB or CMYK)";
    colourRec = "Agar RGB hai to CMYK convert karein; brand colours ke liye proof lo.";
  }
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
    colourMode = "RGB (typical)";
    score -= 4;
    suggestions.push("RGB → CMYK conversion se ink accuracy better hoti hai (flex/offset).");
    oneClickFixes.push({
      id: "cmyk",
      label: "Flag for CMYK conversion",
      description: "Admin/pre-press CMYK copy banayega — original untouched.",
      optional: true,
    });
  }
  checks.push({
    id: "colour",
    label: "Colour mode",
    status: "warn",
    value: colourMode,
    detail: colourRec,
  });
  visualHints.push({ zone: "colour-profile", severity: "info", note: "RGB/CMYK verification at proof" });

  // Bleed / margins
  const isCardLike = /card|visiting|wedding|id|certificate|flyer|poster|brochure/i.test(category + input.fileName);
  const isLargeFormat = /banner|flex|hoarding|board|vehicle|acp|led/i.test(category + input.fileName + (input.productHint || ""));
  let bleedStatus = "Not detected in file metadata";
  let bleedSuggestion = "Print layout me 3 mm bleed + safe margin rakhein (cards) ya 10–20 mm (large format).";
  if (isCardLike) {
    score -= 3;
    bleedSuggestion = "Cards/flyers: 3 mm bleed, 3–5 mm safe text margin, crop marks on PDF.";
    suggestions.push("3 mm bleed add karein aur text edges se door rakhein.");
    oneClickFixes.push({
      id: "bleed",
      label: "Request auto-bleed guide",
      description: "Team layout me bleed template suggest karegi (original safe).",
      optional: true,
    });
    visualHints.push({ zone: "edges", severity: "warn", note: "Safe area / bleed check" });
  }
  if (isLargeFormat) {
    bleedSuggestion = "Large format: keep critical logos 2–3% inside trim; eyelets zone clear.";
    visualHints.push({ zone: "perimeter", severity: "info", note: "Eyelet / frame safe zone" });
  }
  checks.push({
    id: "bleed",
    label: "Bleed / safe area",
    status: "warn",
    value: bleedStatus,
    detail: bleedSuggestion,
  });

  // Typography
  const typeNotes: string[] = [];
  if (isPdf || isVector || isPsd) {
    typeNotes.push("Fonts embed karein — missing fonts se reflow ho sakta hai.");
    typeNotes.push("6 pt se chhote body text outdoor pe unreadable ho sakte hain.");
    suggestions.push("Fonts outline/curve ya embed karein.");
    oneClickFixes.push({
      id: "fonts",
      label: "Remind: embed / outline fonts",
      description: "Customer-friendly checklist message chat me add.",
      optional: false,
    });
  } else if (isRaster) {
    typeNotes.push("Text raster me hai — enlarge pe soft dikhega. Critical text vector better.");
  }
  checks.push({
    id: "typography",
    label: "Typography",
    status: "info",
    value: isPdf ? "Verify embedding" : "Raster/unknown",
    detail: typeNotes.join(" "),
  });

  // Image quality heuristics
  let blurRisk = "Unknown";
  let noiseRisk = "Unknown";
  let screenshotRisk = "Low";
  let contrastNote = "Proof pe contrast check hoga.";
  if (isRaster && input.sizeBytes < 80_000 && resLevel === "Low") {
    blurRisk = "Elevated (small/soft file)";
    score -= 8;
    warnings.push("Screenshot ya heavily compressed image ho sakti hai.");
    screenshotRisk = "Possible";
    visualHints.push({ zone: "detail", severity: "warn", note: "Compression / screenshot artifacts possible" });
  } else if (isRaster) {
    blurRisk = "Low–medium (manual proof)";
    noiseRisk = "Check on zoom";
  }
  if (/screenshot|screen.?shot|whatsapp|img_/i.test(input.fileName)) {
    screenshotRisk = "High (filename pattern)";
    score -= 10;
    warnings.push("Filename se screenshot lag raha hai — original export better hota hai.");
  }
  checks.push({
    id: "image_quality",
    label: "Image quality signals",
    status: screenshotRisk === "High" || blurRisk.startsWith("Elevated") ? "warn" : "info",
    value: `Blur: ${blurRisk}`,
    detail: `Noise: ${noiseRisk}. Screenshot risk: ${screenshotRisk}. ${contrastNote}`,
  });

  // Logo specific
  const isLogo = /logo/i.test(input.fileName + category + (input.userHint || ""));
  const logoSuitable: string[] = [];
  if (isLogo || category === "Logo") {
    if (isVector) {
      logoSuitable.push("Flex / Banner — scalable");
      logoSuitable.push("Business Card — crisp");
      logoSuitable.push("LED / ACP — clean edges");
      logoSuitable.push("Vehicle branding — enlarge safe");
      logoSuitable.push("Packaging — sharp");
      score += 6;
    } else {
      logoSuitable.push("Business Card — if ≥1000 px wide");
      logoSuitable.push("Flex — only if very high-res");
      logoSuitable.push("LED/ACP — prefer vector redo");
      suggestions.push("Logo ka vector (AI/SVG/PDF) version best rehta hai large boards ke liye.");
      oneClickFixes.push({
        id: "vectorize",
        label: "Request vector logo",
        description: "Customer se AI/SVG/PDF logo maangne ka soft message.",
        optional: false,
      });
    }
    if (ext === "png" || ext === "svg") logoSuitable.push("Transparent background — good for stickers");
  }

  // Suitable products matrix
  const suitableFor = PRINT_PRODUCTS.map((product) => {
    let ok = true;
    let reason = "Generally compatible after proof.";
    const p = product.toLowerCase();

    if (isLargeFormatProduct(p)) {
      if (resLevel === "Low" && isRaster) {
        ok = false;
        reason = "Resolution low for large format — higher-res or vector needed.";
      } else if (resLevel === "Medium" && isRaster) {
        ok = true;
        reason = "Medium res — medium boards OK; huge hoarding risky.";
      } else if (isVector || isPdf) {
        reason = "Vector/PDF scales well for large format.";
      } else {
        reason = "High-res raster can work for flex/banner.";
      }
    }
    if (/business card|visiting|wedding|id card|certificate/.test(p)) {
      if (resLevel === "Low" && isRaster) {
        ok = false;
        reason = "Too soft for close-view cards.";
      } else {
        reason = "Add 3 mm bleed + embed fonts for best cards.";
      }
    }
    if (/mug|t-shirt|cap|bottle|keychain/.test(p)) {
      reason = "Product mockup proof recommended; avoid ultra-fine lines.";
      if (resLevel === "Low" && isRaster) {
        ok = false;
        reason = "Low res will look soft on product print.";
      }
    }
    if (/sticker/.test(p) && ["jpg", "jpeg"].includes(ext)) {
      reason = "JPEG has no transparency — white edge possible; PNG better for die-cut.";
    }
    return { product, ok, reason };
  });

  // Compatibility score tweak
  const okCount = suitableFor.filter((s) => s.ok).length;
  if (okCount < 8) score -= 8;
  if (okCount > 20) score += 3;

  // Compression
  const compressionNote =
    ["jpg", "jpeg", "webp"].includes(ext)
      ? "Lossy compression possible — watch artifacts on flat colours."
      : ext === "png"
        ? "PNG often cleaner for graphics/logos."
        : "N/A";

  score = Math.max(5, Math.min(99, Math.round(score)));
  const grade = gradeFromScore(score);

  const headline =
    grade === "Excellent"
      ? "Artwork analysis complete — looking print-strong!"
      : grade === "Good"
        ? "Artwork analysis complete — small polish recommended"
        : grade === "Average"
          ? "Artwork analysis complete — improvements will help"
          : grade === "Needs Improvement"
            ? "Artwork analysis complete — let's strengthen this file"
            : "Artwork analysis complete — new export recommended before print";

  const friendlySummary =
    grade === "Not Printable" || grade === "Needs Improvement"
      ? "Tension mat lo — file receive ho gayi hai. Neeche simple steps se print quality improve kar sakte hain. Original file safe rahegi."
      : "File mil gayi. Neeche Print Readiness Report hai — jo points improve karne se result aur clean aayega.";

  // Ensure suggestions unique
  if (!suggestions.some((s) => /CMYK/i.test(s))) {
    suggestions.push("Final print se pehle CMYK + paper/media proof.");
  }
  if (isCardLike) {
    suggestions.push("Crop marks + bleed wala PDF export.");
  }

  return {
    version: 1,
    analyzedAt: new Date().toISOString(),
    fileName: input.fileName,
    mimeType: mime,
    sizeBytes: input.sizeBytes,
    category,
    score,
    grade,
    headline,
    friendlySummary,
    resolution: {
      level: resLevel,
      estimatedDpi,
      pixelWidth: pixelW,
      pixelHeight: pixelH,
      aspectRatio: pixelW && pixelH ? aspect(pixelW, pixelH) : null,
      maxPrintSize: maxPrint,
    },
    colour: { mode: colourMode, recommendation: colourRec },
    format: {
      type: formatType,
      hasTransparency: transparency,
      compressionNote,
    },
    logo: {
      isLogoLikely: isLogo || category === "Logo",
      scalable: isVector || isPdf ? "Yes (vector/PDF)" : "Limited (raster)",
      suitableNotes: logoSuitable,
    },
    bleed: { status: bleedStatus, suggestion: bleedSuggestion },
    typography: {
      status: isPdf || isVector ? "Verify embedding" : "Raster text risk",
      notes: typeNotes,
    },
    imageQuality: {
      blurRisk,
      noiseRisk,
      screenshotRisk,
      contrastNote,
    },
    checks,
    warnings: [...new Set(warnings)],
    suggestions: [...new Set(suggestions)].slice(0, 8),
    oneClickFixes,
    suitableFor,
    maxPrintSize: maxPrint,
    visualHints,
    originalPreserved: true,
  };
}

function isLargeFormatProduct(p: string) {
  return /flex|banner|hoarding|vehicle|shop board|led|acp|vinyl|corporate branding/.test(p);
}

export function formatInspectionChatText(r: PrintReadinessReport, lang: "hi" | "en" | "hinglish" = "hinglish") {
  const lines = [
    r.headline,
    "",
    `Print Ready Score: ${r.score}% (${r.grade})`,
    `Resolution: ${r.resolution.level}`,
    `Colour mode: ${r.colour.mode}`,
    `Recommendation: ${r.colour.recommendation}`,
    `Transparency: ${r.format.hasTransparency}`,
    `Maximum print size: ${r.maxPrintSize}`,
    "",
    "Suitable for (top matches):",
    ...r.suitableFor
      .filter((s) => s.ok)
      .slice(0, 6)
      .map((s) => `✔ ${s.product}`),
    "",
    "Suggestions:",
    ...r.suggestions.slice(0, 5).map((s) => `• ${s}`),
    "",
    r.friendlySummary,
    "Original file safe hai — koi permanent change nahi hota.",
  ];
  if (lang === "en") {
    return lines.join("\n");
  }
  return lines.join("\n");
}

export function serializeInspection(r: PrintReadinessReport) {
  return JSON.stringify({ type: "print_readiness_report", report: r });
}
