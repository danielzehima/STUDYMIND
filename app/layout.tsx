import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Police unique variable (voir .claude/skills — recommandation "SaaS,
// productivité, professionnel, accessible" pour ce type de produit).
// Remplace Geist Sans/Mono : Geist Mono n'était utilisé nulle part dans le
// code, et Geist Sans était de toute façon écrasé par un
// `font-family: Arial` codé en dur dans globals.css (jamais appliqué).
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Mind",
  description: "Plateforme de révision assistée par IA pour étudiants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
