/** RENU PRESS Digital Support Desk — policy & catalogue */

export const SUPPORT_IDENTITY = "RENU PRESS Support Team";

export const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_STORAGE_BYTES = 2.5 * 1024 * 1024; // store up to ~2.5MB data URL

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/postscript",
  "application/illustrator",
  "image/vnd.adobe.photoshop",
  "application/x-photoshop",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
]);

export const ALLOWED_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "gif",
  "svg",
  "pdf",
  "psd",
  "ai",
  "cdr",
  "doc",
  "docx",
  "zip",
  "rar",
  "mp4",
  "webm",
  "mov",
  "mp3",
  "ogg",
  "wav",
  "m4a",
]);

export const PRODUCT_CATALOGUE = [
  "Banner Printing",
  "Flex Printing",
  "Vinyl Printing",
  "Visiting Cards",
  "Wedding Cards",
  "Business Cards",
  "Bill Books",
  "Letterheads",
  "Brochures",
  "Flyers",
  "Packaging",
  "T-Shirts",
  "Hoodies",
  "Caps",
  "Mugs",
  "Corporate Gifts",
  "Customized Gifts",
  "Trophies",
  "Medals",
  "ID Cards",
  "PVC Cards",
  "Photo Printing",
  "Frames",
  "Sign Boards",
  "ACP Boards",
  "Glow Sign Boards",
  "LED Boards",
  "Vehicle Branding",
  "Office Branding",
  "Wall Graphics",
  "Sticker Printing",
  "Labels",
  "Any Custom Printing",
] as const;

/** Collection order — one question at a time */
export const COLLECT_ORDER = [
  "product",
  "size",
  "material",
  "quantity",
  "deadline",
  "customerName",
  "phone",
  "email",
  "businessName",
  "city",
  "deliveryAddress",
  "remarks",
] as const;

export type CollectField = (typeof COLLECT_ORDER)[number];

export const FIELD_QUESTIONS: Record<CollectField, { hi: string; en: string }> = {
  product: {
    hi: "Aapko kaunsa printing / product chahiye? (jaise Banner, Visiting Card, Flex, T-Shirt…)",
    en: "Which printing service or product do you need? (e.g. Banner, Visiting Cards, Flex, T-Shirt…)",
  },
  size: {
    hi: "Size / dimensions kya chahiye? (jaise 3x2 ft, A4, 18x12 inch)",
    en: "What size or dimensions do you need? (e.g. 3x2 ft, A4, 18x12 inch)",
  },
  material: {
    hi: "Material / finish prefer karenge? (jaise Star Flex, Vinyl, 300 GSM, Matt, Glossy — optional detail bhi theek hai)",
    en: "Any preferred material or finish? (e.g. Star Flex, Vinyl, 300 GSM, Matt, Glossy — optional details are fine)",
  },
  quantity: {
    hi: "Quantity kitni chahiye?",
    en: "What quantity do you need?",
  },
  deadline: {
    hi: "Kab tak delivery chahiye? (exact date promise nahi — bas aapka preferred timeline)",
    en: "When do you need this by? (we note your preferred timeline — final schedule is confirmed by our team)",
  },
  customerName: {
    hi: "Aapka poora naam bata dijiye.",
    en: "May I have your full name, please?",
  },
  phone: {
    hi: "WhatsApp / mobile number share kijiye (10 digit).",
    en: "Please share your WhatsApp / mobile number (10 digits).",
  },
  email: {
    hi: "Email ID? (optional — skip likh sakte hain)",
    en: "Email ID? (optional — you can type skip)",
  },
  businessName: {
    hi: "Business / company name? (optional — skip likh sakte hain)",
    en: "Business / company name? (optional — type skip if none)",
  },
  city: {
    hi: "City / delivery location?",
    en: "City or delivery location?",
  },
  deliveryAddress: {
    hi: "Delivery address briefly bata dijiye (optional — skip allowed).",
    en: "Brief delivery address? (optional — type skip if later)",
  },
  remarks: {
    hi: "Koi special instruction / colour preference / reference note? (optional — skip bhi theek)",
    en: "Any special instructions or notes? (optional — type skip if none)",
  },
};

export const LEAD_STATUSES = [
  "NEW_INQUIRY",
  "REQUIREMENT_COLLECTED",
  "QUALIFIED",
  "WAITING_REVIEW",
  "QUOTE_PENDING",
  "QUOTE_SENT",
  "NEGOTIATION",
  "CONFIRMED",
  "PRODUCTION",
  "COMPLETED",
  "LOST",
] as const;

export const HANDOVER_MESSAGE = {
  hi: `Dhanyavaad 🙏

Aapki saari requirements successfully receive ho gayi hain.

Hamari support team aapke request ko review kar rahi hai.
Best quotation aur delivery details jald share kiye jayenge.

Final price, discount, ya delivery date sirf team approve karke batayegi — yahan se koi final rate nahi diya jata.`,
  en: `Thank you 🙏

Your requirements have been received successfully.

Our support team is reviewing your request.
The best quotation and delivery details will be shared shortly.

Final price, discounts, and delivery dates are always confirmed by our team — we do not quote final rates here.`,
};

export const WELCOME_SERVICES = PRODUCT_CATALOGUE.join("\n");

export function welcomeMessage(lang: "hi" | "en" | "hinglish" = "hinglish") {
  if (lang === "en") {
    return `Welcome to RENU PRESS 👋

Thank you for contacting us.

I can help you with

${WELCOME_SERVICES}

Please tell us what you need.`;
  }
  return `Welcome to RENU PRESS 👋

Thank you for contacting us.

Main aapki madad kar sakta/sakti hoon:

${WELCOME_SERVICES}

Please bataiye aapko kya chahiye.`;
}
