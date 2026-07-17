import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: {
      default: s.seoTitle,
      template: `%s · ${s.businessName}`,
    },
    description: s.seoDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    openGraph: {
      title: s.seoTitle,
      description: s.seoDescription,
      locale: "en_IN",
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="min-h-dvh overflow-x-hidden antialiased">{children}</body>
    </html>
  );
}
