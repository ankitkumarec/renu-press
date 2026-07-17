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
  "image/tiff",
  "image/bmp",
  "image/x-bmp",
  "application/pdf",
  "application/postscript",
  "application/eps",
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
  "eps",
  "cdr",
  "tif",
  "tiff",
  "bmp",
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
  "Business Cards",
  "Visiting Cards",
  "Wedding Cards",
  "Invitation Cards",
  "Letterheads",
  "Bill Books",
  "Receipt Books",
  "Certificates",
  "School Printing",
  "ID Cards",
  "PVC Cards",
  "Photo Printing",
  "Frames",
  "Packaging",
  "Sticker Printing",
  "Labels",
  "T-Shirts",
  "Hoodies",
  "Caps",
  "Mugs",
  "Corporate Gifts",
  "Customized Gifts",
  "Awards",
  "Trophies",
  "Medals",
  "LED Sign Boards",
  "ACP Boards",
  "Glow Sign Boards",
  "Vehicle Branding",
  "Office Branding",
  "Wall Graphics",
  "Glass Branding",
  "Custom Printing",
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
  "CANCELLED",
  "LOST",
] as const;

export const HANDOVER_MESSAGE = {
  hi: `Thank you.

We've received your complete requirement.

Our support team is reviewing your request.

We'll share the best quotation with you shortly.`,
  en: `Thank you.

We've received your complete requirement.

Our support team is reviewing your request.

We'll share the best quotation with you shortly.`,
};

/** Official welcome — human support team voice (never AI/bot wording) */
export function welcomeMessage(_lang: "hi" | "en" | "hinglish" = "hinglish") {
  return `👋 Welcome to RENU PRESS.

Thank you for contacting us.

We're here to help with all your printing and branding requirements.

You can send us

📷 Images
🎨 Logo
📄 PDF
🖼 Banner Design
💳 Visiting Card
📁 Artwork
📦 Packaging Design
🏢 Shop Photo

Tell us what you'd like to print.`;
}

export const SUPPORT_DISPLAY_NAME = "❤️ RENU PRESS Support Team";
export const SUPPORT_STATUS_LINE = "🟢 Online Now · Usually replies within 5 minutes";
export const SUPPORT_VERIFIED = "✓ Verified Business";
export const CHAT_PLACEHOLDER = "👋 Hi! Tell us what you'd like to print...";
export const CHAT_ATTACH_HINT = "📎 Attach Logo • Image • PDF • Artwork";
