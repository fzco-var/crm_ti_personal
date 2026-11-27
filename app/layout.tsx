import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { APPEARANCE_SCRIPT } from "@/features/settings/appearance";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "CRM TI", template: "%s — CRM TI" },
  description: "CRM para un negocio de servicios de TI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
      // El script de `<head>` fija `data-theme-mode`, `data-theme` y `data-accent` antes de hidratar.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
