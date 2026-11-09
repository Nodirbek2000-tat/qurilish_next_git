import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { THEME_SCRIPT } from "@/components/ThemeToggle";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3002"),
  title: { default: "Arxan — Samarqanddagi turar-joy majmualari", template: "%s · Arxan" },
  description: "Arxan — Samarqandda zamonaviy turar-joy majmualarini quruvchi kompaniya. Loyihalar, qurilish jarayoni va yangiliklar.",
  openGraph: { siteName: "Arxan", locale: "uz_UZ", type: "website" },
};

export const viewport: Viewport = { themeColor: "#f1ede6" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme bo'yashdan oldin skript bilan qo'yiladi — shuning uchun suppressHydrationWarning
    <html lang="uz" className={`${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
