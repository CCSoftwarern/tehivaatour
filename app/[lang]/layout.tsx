import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSiteConfig } from "@/lib/queries";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

function themeVars(config: Record<string, string>): CSSProperties {
  return {
    "--cor-primaria": config.cor_primaria,
    "--cor-primaria-escura": config.cor_primaria_escura,
    "--cor-destaque": config.cor_destaque,
    "--cor-fundo": config.cor_fundo,
    "--cor-texto": config.cor_texto,
  } as CSSProperties;
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const config = await getSiteConfig();

  return (
    <html
      lang={lang}
      style={themeVars(config)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
