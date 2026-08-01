import { getDictionary, isLocale } from "@/lib/i18n";
import { getSiteConfig } from "@/lib/queries";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { FloatingWhatsApp } from "@/components/whatsapp-button";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, config] = await Promise.all([getDictionary(lang), getSiteConfig()]);

  return (
    <>
      <Header lang={lang} dict={dict} config={config} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} dict={dict} config={config} />
      <FloatingWhatsApp whatsapp={config.whatsapp} />
    </>
  );
}
