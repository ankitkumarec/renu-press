/** RENU PRESS public contact numbers (click → WhatsApp chat) */
export type WaContact = {
  label: string;
  /** 10-digit Indian mobile */
  number: string;
  /** Primary chat button */
  primary?: boolean;
};

export const WA_CONTACTS: WaContact[] = [
  { label: "Chat 1", number: "6200978643" },
  { label: "Chat 2 · Main", number: "7631425111", primary: true },
  { label: "Chat 3", number: "7545025322" },
];

/** Display phone for header/call — main line */
export const DISPLAY_PHONE = "+91 76314 25111";

/** Primary WhatsApp for DB / footer single-link (with country code) */
export const PRIMARY_WHATSAPP = "917631425111";

export function waDigits(number: string) {
  const d = number.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  if (d.startsWith("91") && d.length === 12) return d;
  return d;
}

export function waChatUrl(number: string, text = "Namaste RENU PRESS, I need a printing quote.") {
  return `https://wa.me/${waDigits(number)}?text=${encodeURIComponent(text)}`;
}

export function formatInPhone(number: string) {
  const d = number.replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return number;
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}
