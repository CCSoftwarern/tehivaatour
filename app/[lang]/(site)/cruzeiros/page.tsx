import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getPacotes } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { PacoteGrid } from "@/components/pacote-grid";

export const dynamic = "force-dynamic";

export default async function CruzeirosPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, cruzeiros] = await Promise.all([
    getDictionary(lang),
    getPacotes("cruzeiro"),
  ]);

  return (
    <>
      <PageHeader title={dict.cruzeiros.titulo} subtitle={dict.cruzeiros.subtitulo} />
      <div className="mx-auto max-w-7xl px-4 pt-14">
        <PacoteGrid pacotes={cruzeiros} lang={lang} dict={dict} />
      </div>
    </>
  );
}
