import { CATALOG, type CatalogProduct } from "./catalog";

export type CustomerIntent = {
  businessType: string | null;
  purpose: string | null;
  budgetTier: "economy" | "premium" | "mixed" | null;
  placement: "indoor" | "outdoor" | "both" | null;
  duration: "short-term" | "long-term" | null;
  raw: string;
};

export type ProductRecommendation = {
  id: string;
  name: string;
  category: string;
  description: string;
  useCase: string;
  material: string;
  advantages: string[];
  suggestedQty: string;
  image: string;
  why: string;
  related: string[];
};

export type PortfolioMatch = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
};

export type RecommendationResult = {
  intent: CustomerIntent;
  interestedCategory: string;
  suggestedBundle: string | null;
  products: ProductRecommendation[];
  intro: string;
  outro: string;
  designTips: string[];
};

/** Intent packages — experienced branding consultant playbooks */
const PACKAGES: {
  id: string;
  label: string;
  bundle: string;
  category: string;
  match: RegExp;
  productIds: string[];
  why: Record<string, string>;
}[] = [
  {
    id: "clothing_shop",
    label: "Clothing / retail shop branding",
    bundle: "Retail Shop Branding Package",
    category: "Retail Branding",
    match:
      /cloth|garment|boutique|fashion|apparel|showroom|retail\s*shop|dukan|kapde|shopping|kirana|general\s*store|branding\s*for\s*my\s*(shop|store)/i,
    productIds: [
      "acp-sign",
      "glow-sign",
      "flex-banner",
      "vinyl-banner",
      "paper-bag",
      "visiting-card",
      "price-tag",
      "sticker",
      "label",
      "qr-stand",
    ],
    why: {
      "acp-sign": "Main shop identity — long-term outdoor name board customers remember.",
      "glow-sign": "Night visibility so the store stays discoverable after dark.",
      "flex-banner": "Sale / offer announcements without permanent commitment.",
      "vinyl-banner": "Window branding turns glass into a silent salesperson.",
      "paper-bag": "Every takeaway becomes walking advertisement.",
      "visiting-card": "Staff & owner networking for wholesale/referral.",
      "price-tag": "Brand on every garment — shelf-ready retail look.",
      sticker: "Packaging seals & promo stickers for offers.",
      label: "Product / size labels keep inventory professional.",
      "qr-stand": "Google reviews & WhatsApp catalogue at the counter.",
    },
  },
  {
    id: "restaurant",
    label: "Restaurant / cafe / food business",
    bundle: "Restaurant Launch Package",
    category: "F&B Branding",
    match: /restaurant|cafe|hotel|dhaba|cloud\s*kitchen|food|menu|tiffin|bakery|sweets?/i,
    productIds: [
      "menu-card",
      "led-sign",
      "glow-sign",
      "table-tent",
      "packaging-box",
      "paper-bag",
      "delivery-bag",
      "tshirt",
      "cap",
      "sticker",
      "visiting-card",
      "bill-book",
      "qr-stand",
    ],
    why: {
      "menu-card": "Clear dishes & photos drive higher average ticket.",
      "led-sign": "Street-facing impact for new food outlets.",
      "glow-sign": "Night dining traffic depends on lit identity.",
      "table-tent": "Upsells combos / QR menu while guests wait.",
      "packaging-box": "Takeaway unboxing builds repeat orders.",
      "paper-bag": "Branded carry for parcels.",
      "delivery-bag": "Every delivery is a mobile billboard.",
      tshirt: "Staff uniforms build trust & hygiene perception.",
      cap: "Kitchen/service team identity.",
      sticker: "Seal packs & promo stickers.",
      "visiting-card": "Catering & B2B orders.",
      "bill-book": "GST-ready billing at counter.",
      "qr-stand": "Digital menu + Google reviews.",
    },
  },
  {
    id: "election",
    label: "Election / political campaign",
    bundle: "Election Campaign Kit",
    category: "Political Campaign",
    match: /election|political|campaign|rally|vote|neta|chunav|manifesto|party\s*symbol/i,
    productIds: [
      "hoarding",
      "flex-banner",
      "star-flex",
      "flag",
      "cap",
      "tshirt",
      "vehicle-branding",
      "stage-backdrop",
      "sticker",
      "pamphlet",
      "poster",
      "badge",
    ],
    why: {
      hoarding: "Mass outdoor recall on main roads.",
      "flex-banner": "Flexible sizes for lanes & meetings.",
      "star-flex": "High-opacity boards for long-distance read.",
      flag: "Rally energy & crowd visuals.",
      cap: "Volunteer identity & giveaways.",
      tshirt: "Booth / cadre uniform visibility.",
      "vehicle-branding": "Route coverage on campaign vehicles.",
      "stage-backdrop": "Photo-ready stage for media & public.",
      sticker: "Two-wheelers & walls micro-reach.",
      pamphlet: "Door-to-door detailed message.",
      poster: "Local area saturation.",
      badge: "Volunteer & supporter wearable brand.",
    },
  },
  {
    id: "office",
    label: "Office / corporate branding",
    bundle: "Office Identity Package",
    category: "Corporate",
    match: /office|corporate|company|startup|clinic|hospital|co-?working|reception/i,
    productIds: [
      "acrylic-sign",
      "office-branding",
      "glass-branding",
      "wall-graphics",
      "visiting-card",
      "letterhead",
      "id-card",
      "brochure",
      "corporate-gifts",
    ],
    why: {
      "acrylic-sign": "Reception first impression.",
      "office-branding": "Full cabin & lobby consistency.",
      "glass-branding": "Privacy + brand on partitions.",
      "wall-graphics": "Culture & values on walls.",
      "visiting-card": "Client meetings essentials.",
      letterhead: "Official correspondence authority.",
      "id-card": "Staff security & professionalism.",
      brochure: "Service pitch leave-behind.",
      "corporate-gifts": "Client relationship kits.",
    },
  },
  {
    id: "wedding",
    label: "Wedding / invitation",
    bundle: "Wedding Print Suite",
    category: "Wedding",
    match: /wedding|shaadi|invitation|mehndi|sangeet|reception\s*card/i,
    productIds: ["wedding-card", "invitation-card", "photo-print", "photo-frame", "stage-backdrop", "flex-banner"],
    why: {
      "wedding-card": "Core guest invitation experience.",
      "invitation-card": "Function-wise inserts / e-vite companion print.",
      "photo-print": "Guest favours & albums.",
      "photo-frame": "Premium gifts for family.",
      "stage-backdrop": "Stage & photo booth branding.",
      "flex-banner": "Venue direction & welcome boards.",
    },
  },
  {
    id: "school",
    label: "School / education",
    bundle: "School Essentials Kit",
    category: "Education",
    match: /school|college|university|coaching|tuition|student/i,
    productIds: ["id-card", "certificate", "flex-banner", "brochure", "letterhead", "tshirt", "medals", "trophies"],
    why: {
      "id-card": "Student & staff identification.",
      certificate: "Annual day & course completion.",
      "flex-banner": "Admission campaigns.",
      brochure: "Course prospectus.",
      letterhead: "Official notices.",
      tshirt: "House / event uniforms.",
      medals: "Sports meet recognition.",
      trophies: "Prize distribution.",
    },
  },
  {
    id: "vehicle",
    label: "Vehicle branding",
    bundle: "Fleet Branding",
    category: "Vehicle",
    match: /vehicle|car\s*brand|auto\s*brand|fleet|tempo|bolero|wrap/i,
    productIds: ["vehicle-branding", "sticker", "visiting-card", "flex-banner"],
    why: {
      "vehicle-branding": "Primary mobile advertising surface.",
      sticker: "Number plate / mirror accents.",
      "visiting-card": "Driver handouts for enquiries.",
      "flex-banner": "Launch / parking promotions.",
    },
  },
  {
    id: "new_shop",
    label: "New shop opening",
    bundle: "New Shop Complete Package",
    category: "Retail Launch",
    match: /new\s*shop|shop\s*opening|inauguration|grand\s*opening|nayi\s*dukan|opening\s*soon/i,
    productIds: [
      "acp-sign",
      "led-sign",
      "visiting-card",
      "bill-book",
      "carry-bag",
      "sticker",
      "packaging-box",
      "tshirt",
      "qr-stand",
      "flex-banner",
    ],
    why: {
      "acp-sign": "Permanent store identity from day one.",
      "led-sign": "Opening buzz & night discovery.",
      "visiting-card": "Network invitations to opening.",
      "bill-book": "Billing ready on day one.",
      "carry-bag": "Opening giveaways & sales.",
      sticker: "Launch promos.",
      "packaging-box": "Product packaging if you sell packed goods.",
      tshirt: "Staff uniform for opening day photos.",
      "qr-stand": "Reviews from first customers.",
      "flex-banner": "Opening soon / inauguration creatives.",
    },
  },
];

export function detectIntent(text: string): CustomerIntent {
  const t = text.toLowerCase();
  let businessType: string | null = null;
  for (const p of PACKAGES) {
    if (p.match.test(text)) {
      businessType = p.label;
      break;
    }
  }
  let budgetTier: CustomerIntent["budgetTier"] = null;
  if (/premium|luxury|high\s*end|best\s*quality|mehnga/i.test(t)) budgetTier = "premium";
  else if (/cheap|sasta|economy|budget|low\s*cost/i.test(t)) budgetTier = "economy";
  else if (/budget/i.test(t)) budgetTier = "mixed";

  let placement: CustomerIntent["placement"] = null;
  if (/outdoor|bahar|road|highway|weather/i.test(t)) placement = "outdoor";
  else if (/indoor|andar|reception|cabin/i.test(t)) placement = "indoor";
  if (/outdoor/.test(t) && /indoor/.test(t)) placement = "both";

  let duration: CustomerIntent["duration"] = null;
  if (/long[\s-]*term|permanent|saal|years?/i.test(t)) duration = "long-term";
  else if (/short|temporary|few\s*days|event\s*only|1\s*week/i.test(t)) duration = "short-term";

  let purpose: string | null = null;
  if (/branding/i.test(t)) purpose = "branding";
  else if (/promotion|offer|sale|marketing/i.test(t)) purpose = "promotion";
  else if (/identity|name\s*board|signage/i.test(t)) purpose = "signage";
  else if (/gift/i.test(t)) purpose = "gifting";
  else if (/campaign|election/i.test(t)) purpose = "campaign";

  return { businessType, purpose, budgetTier, placement, duration, raw: text };
}

function filterByIntent(products: CatalogProduct[], intent: CustomerIntent): CatalogProduct[] {
  let list = [...products];
  if (intent.budgetTier === "premium") {
    list = list.filter((p) => p.premium || !p.economy);
  } else if (intent.budgetTier === "economy") {
    list = list.filter((p) => p.economy || !p.premium);
  }
  if (intent.placement === "outdoor") {
    list = list.filter((p) => p.outdoor || p.weatherResistant);
  } else if (intent.placement === "indoor") {
    list = list.filter((p) => p.indoor !== false || p.outdoor !== true || p.indoor);
  }
  if (intent.duration === "long-term") {
    list = list.filter((p) => p.weatherResistant || p.premium || /sign|acp|led|glow|acrylic/i.test(p.name));
  }
  return list.length ? list : products;
}

function toRec(p: CatalogProduct, why: string, related: string[]): ProductRecommendation {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    useCase: p.useCase,
    material: p.material,
    advantages: p.advantages,
    suggestedQty: p.suggestedQty,
    image: p.image,
    why,
    related,
  };
}

/** Keyword fallback when no package matches */
function keywordRecommend(text: string, intent: CustomerIntent): CatalogProduct[] {
  const t = text.toLowerCase();
  const scored = CATALOG.map((p) => {
    let s = 0;
    for (const tag of p.tags) {
      if (t.includes(tag)) s += 3;
    }
    if (p.name.toLowerCase().split(/\s+/).some((w) => w.length > 3 && t.includes(w))) s += 4;
    return { p, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);

  return filterByIntent(scored.length ? scored.slice(0, 8) : [], intent);
}

export function shouldRunRecommendation(text: string): boolean {
  if (!text || text.trim().length < 8) return false;
  // pure phone / skip / short product name only — skip full package unless intentful
  if (/^[6-9]\d{9}$/.test(text.trim())) return false;
  if (/^(skip|ok|okay|haan|yes|no|na)$/i.test(text.trim())) return false;

  if (PACKAGES.some((p) => p.match.test(text))) return true;
  if (
    /branding|package|recommend|suggest|kya\s*chahiye|kya\s*lagega|complete\s*set|full\s*branding|open(ing)?\s*(a|my)?\s*(shop|restaurant|store)/i.test(
      text,
    )
  )
    return true;
  if (/i want|mujhe|chahiye|need|looking for|help me|consult/i.test(text) && text.length > 15) return true;
  return false;
}

export function buildRecommendations(
  text: string,
  lang: "hi" | "en" | "hinglish" = "hinglish",
): RecommendationResult | null {
  if (!shouldRunRecommendation(text) && !PACKAGES.some((p) => p.match.test(text))) {
    // still try keyword for product-ish sentences
    const intent = detectIntent(text);
    const kw = keywordRecommend(text, intent);
    if (kw.length < 2) return null;
    return formatResult(intent, null, null, "Suggested products", kw, {}, lang);
  }

  const intent = detectIntent(text);
  const pkg = PACKAGES.find((p) => p.match.test(text));

  if (pkg) {
    const products = pkg.productIds
      .map((id) => CATALOG.find((c) => c.id === id))
      .filter(Boolean) as CatalogProduct[];
    const filtered = filterByIntent(products, intent);
    return formatResult(intent, pkg.bundle, pkg.category, pkg.label, filtered, pkg.why, lang);
  }

  const kw = keywordRecommend(text, intent);
  if (!kw.length) return null;
  return formatResult(intent, null, kw[0]?.category || "Custom", "Matched products", kw.slice(0, 6), {}, lang);
}

function formatResult(
  intent: CustomerIntent,
  bundle: string | null,
  category: string | null,
  label: string,
  products: CatalogProduct[],
  whyMap: Record<string, string>,
  lang: "hi" | "en" | "hinglish",
): RecommendationResult {
  const recs = products.slice(0, 10).map((p) => {
    const related = CATALOG.filter(
      (o) => o.id !== p.id && o.category === p.category,
    )
      .slice(0, 3)
      .map((o) => o.name);
    const why =
      whyMap[p.id] ||
      (lang === "en"
        ? `Fits your need for ${intent.purpose || "printing"} — ${p.useCase}.`
        : `Aapki zaroorat (${intent.purpose || "printing"}) ke hisaab se suitable — ${p.useCase}.`);
    return toRec(p, why, related);
  });

  const intro =
    lang === "en"
      ? `Based on what you shared${intent.businessType ? ` (${intent.businessType})` : ""}, here is a practical set of print products — not a hard sell, only what usually works.`
      : `Aapki baat samajh kar ye practical suggestions hain${intent.businessType ? ` (${intent.businessType})` : ""}. Force nahi — sirf jo usually best result deta hai.`;

  const outro =
    lang === "en"
      ? "Pick the items you want quoted (or say “full package”). Final rates only after our team reviews size, material & artwork — no prices here."
      : "Jo items chahiye unke naam likhein (ya “full package”). Final rate size, material & artwork review ke baad team degi — yahan price nahi.";

  const designTips: string[] = [];
  if (intent.placement === "outdoor" || /outdoor|flex|banner|hoarding/i.test(intent.raw)) {
    designTips.push(
      lang === "en"
        ? "Outdoor art: high contrast, large fonts, avoid thin lines."
        : "Outdoor design: high contrast, bade fonts, thin lines avoid karein.",
    );
  }
  if (intent.budgetTier === "premium") {
    designTips.push(
      lang === "en"
        ? "Premium path: ACP/LED/acrylic + consistent colour system across cards & bags."
        : "Premium route: ACP/LED/acrylic + cards & bags pe same colour system.",
    );
  }

  return {
    intent,
    interestedCategory: category || label,
    suggestedBundle: bundle,
    products: recs,
    intro,
    outro,
    designTips,
  };
}

/** Image / filename scene → product recommendations */
export function recommendFromImageScene(
  category: string,
  fileName: string,
  lang: "hi" | "en" | "hinglish" = "hinglish",
): RecommendationResult {
  const hay = `${category} ${fileName}`;
  let text = "custom printing branding";
  if (/shop|store|retail|market/i.test(hay)) text = "clothing shop branding storefront";
  else if (/restaurant|cafe|food|kitchen/i.test(hay)) text = "restaurant menu and signage";
  else if (/office|building|reception/i.test(hay)) text = "office corporate branding";
  else if (/wedding|hall|invitation/i.test(hay)) text = "wedding card and stage";
  else if (/political|stage|rally|election/i.test(hay)) text = "election campaign material";
  else if (/vehicle|car|auto/i.test(hay)) text = "vehicle branding fleet";
  else if (/logo/i.test(hay)) text = "visiting card letterhead flex banner logo branding";
  else if (/gift|mug|packaging/i.test(hay)) text = "corporate gifts mug packaging";
  else if (/school|id/i.test(hay)) text = "school id card certificate";
  else if (/banner|flex|hoarding/i.test(hay)) text = "flex banner outdoor star flex";
  else if (/card|visiting|business/i.test(hay)) text = "visiting card business card";

  const result = buildRecommendations(text, lang);
  if (result) {
    result.intro =
      lang === "en"
        ? `From your upload (${category}), these print options usually pair well. Team will still verify artwork quality.`
        : `Aapki file (${category}) dekh kar ye print options generally suit karte hain. Artwork quality team verify karegi.`;
    result.designTips = [
      ...(result.designTips || []),
      lang === "en"
        ? "If this is a logo: vector (AI/SVG/PDF) is best for large boards; keep transparent PNG for cards."
        : "Logo hai to large board ke liye vector (AI/SVG/PDF) best; cards ke liye transparent PNG rakhein.",
    ];
    return result;
  }
  // fallback custom
  const intent = detectIntent(text);
  const products = CATALOG.filter((p) => p.id === "custom-printing" || p.id === "flex-banner" || p.id === "visiting-card");
  return formatResult(intent, null, category, category, products, {}, lang);
}

export function matchPortfolio(
  products: ProductRecommendation[],
  portfolio: { id: string; title: string; category: string; description: string; imageUrl: string }[],
): PortfolioMatch[] {
  const cats = new Set(products.map((p) => p.category.toLowerCase()));
  const names = products.map((p) => p.name.toLowerCase()).join(" ");
  const scored = portfolio.map((item) => {
    let s = 0;
    if (cats.has(item.category.toLowerCase())) s += 5;
    for (const p of products) {
      if (item.title.toLowerCase().includes(p.name.split(" ")[0].toLowerCase())) s += 2;
      if (item.description.toLowerCase().includes(p.category.toLowerCase())) s += 1;
    }
    if (/signage|outdoor|wedding|id|stationery|event/i.test(item.category) && names.length) s += 1;
    return { item, s };
  });
  return scored
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => ({
      id: x.item.id,
      title: x.item.title,
      category: x.item.category,
      description: x.item.description,
      imageUrl: x.item.imageUrl,
    }));
}

export function formatRecommendationText(r: RecommendationResult, lang: "hi" | "en" | "hinglish") {
  const lines = [r.intro, ""];
  if (r.suggestedBundle) {
    lines.push(lang === "en" ? `Suggested package: ${r.suggestedBundle}` : `Suggested package: ${r.suggestedBundle}`);
    lines.push("");
  }
  lines.push(lang === "en" ? "Recommended:" : "Recommended:");
  for (const p of r.products) {
    lines.push(`✔ ${p.name}`);
    lines.push(`   → ${p.why}`);
  }
  if (r.designTips.length) {
    lines.push("");
    lines.push(lang === "en" ? "Design notes:" : "Design notes:");
    r.designTips.forEach((t) => lines.push(`• ${t}`));
  }
  lines.push("");
  lines.push(r.outro);
  return lines.join("\n");
}

export function serializeRecommendation(r: RecommendationResult, portfolio: PortfolioMatch[] = []) {
  return JSON.stringify({
    type: "product_recommendations",
    intent: r.intent,
    interestedCategory: r.interestedCategory,
    suggestedBundle: r.suggestedBundle,
    products: r.products,
    portfolio,
    designTips: r.designTips,
  });
}
