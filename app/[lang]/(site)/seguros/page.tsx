import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getPacotes } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { PacoteGrid } from "@/components/pacote-grid";

export const dynamic = "force-dynamic";

export default async function SegurosPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, seguros] = await Promise.all([
    getDictionary(lang),
    getPacotes("seguro"),
  ]);

  return (
    <>
      <PageHeader title={dict.seguros.titulo} subtitle={dict.seguros.subtitulo} />
      <div className="mx-auto max-w-7xl px-4 pt-14">
        <PacoteGrid pacotes={seguros} lang={lang} dict={dict} />
      </div>
    </>
  );
}
