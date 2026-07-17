/**
 * Product Knowledge Base — AI receives ONLY a slim slice, never full ERP/DB dump.
 */

export type KbProduct = {
  name: string;
  category: string;
  materials: string[];
  notes: string;
};

const PRODUCTS: KbProduct[] = [
  { name: "Flex Banner", category: "Outdoor", materials: ["Star Flex", "Frontlit", "Backlit"], notes: "Outdoor promo, eyelets optional" },
  { name: "Vinyl Banner", category: "Outdoor", materials: ["Vinyl", "One-way vision"], notes: "Windows, vehicles" },
  { name: "ACP Board", category: "Signage", materials: ["ACP", "Vinyl face"], notes: "Long-term shop identity" },
  { name: "LED Sign Board", category: "Signage", materials: ["LED", "Acrylic"], notes: "Night visibility" },
  { name: "Glow Sign Board", category: "Signage", materials: ["Acrylic", "LED tube"], notes: "Shop front glow" },
  { name: "Visiting Cards", category: "Stationery", materials: ["300-350 GSM", "Matt", "UV"], notes: "500/1000 packs" },
  { name: "Business Cards", category: "Stationery", materials: ["Texture", "Foil"], notes: "Premium finishes" },
  { name: "Wedding Cards", category: "Wedding", materials: ["Premium paper"], notes: "Invites + envelopes" },
  { name: "Sticker Printing", category: "Labels", materials: ["Vinyl", "Paper"], notes: "Die-cut options" },
  { name: "Packaging", category: "Packaging", materials: ["Duplex", "Corrugated"], notes: "Boxes, bags" },
  { name: "T-Shirt Printing", category: "Apparel", materials: ["Cotton", "DTF", "Screen"], notes: "Staff / campaign" },
  { name: "Mugs", category: "Gifts", materials: ["Ceramic sublimation"], notes: "Corporate gifts" },
  { name: "Corporate Gifts", category: "Gifts", materials: ["Mixed"], notes: "Kits" },
  { name: "ID Cards", category: "ID", materials: ["PVC"], notes: "Photo + lanyard" },
  { name: "Vehicle Branding", category: "Branding", materials: ["Cast vinyl"], notes: "Fleet wraps" },
  { name: "Bill Books", category: "Stationery", materials: ["NCR"], notes: "GST layouts" },
  { name: "Brochure", category: "Marketing", materials: ["Art paper"], notes: "Folded marketing" },
  { name: "Poster", category: "Marketing", materials: ["Maplitho", "Art"], notes: "Events / campaigns" },
];

const FAQ = [
  { q: "Do you deliver outside Saharsa?", a: "Yes across Bihar and nearby regions — timeline confirmed after review." },
  { q: "Can I upload logo for boards?", a: "Yes — PNG/PDF/AI preferred. Our team checks print readiness." },
  { q: "How do I get a quote?", a: "Share product, size, qty and files — support team sends best quotation after review." },
];

const POLICIES = [
  "Final prices only after admin/support review of specs and artwork.",
  "No discounts promised in chat without admin approval.",
  "Delivery dates are estimates until production load is checked.",
];

/** Keyword retrieval — replaceable by pgvector later */
export function retrieveCompanySlice(query: string, limit = 8): string {
  const q = (query || "").toLowerCase();
  const scored = PRODUCTS.map((p) => {
    let s = 0;
    if (q.includes(p.name.toLowerCase().split(" ")[0])) s += 5;
    if (q.includes(p.category.toLowerCase())) s += 2;
    p.materials.forEach((m) => {
      if (q.includes(m.toLowerCase())) s += 1;
    });
    const token = p.name.split(" ")[0].toLowerCase();
    if (token.length > 2 && q.includes(token)) s += 3;
    return { p, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);

  const products = (scored.length ? scored.map((x) => x.p) : PRODUCTS.slice(0, 6))
    .map((p) => `- ${p.name} [${p.category}] materials: ${p.materials.join(", ")} · ${p.notes}`)
    .join("\n");

  return [
    "PRODUCTS (subset):",
    products,
    "",
    "FAQ:",
    ...FAQ.map((f) => `Q: ${f.q}\nA: ${f.a}`),
    "",
    "POLICIES:",
    ...POLICIES.map((p) => `- ${p}`),
  ].join("\n");
}
