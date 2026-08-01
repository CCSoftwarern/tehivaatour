import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSiteConfig } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function SobrePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, config] = await Promise.all([
    getDictionary(lang),
    getSiteConfig(),
  ]);

  const titulo = config[`sobre_titulo_${lang}`] || dict.sobre.titulo;
  const texto = config[`sobre_texto_${lang}`] || "";

  return (
    <>
      <PageHeader title={titulo} />
      <div className="mx-auto max-w-3xl px-4 pt-14">
        <div className="rounded-2xl bg-white border border-line p-8">
          {texto ? (
            <p className="leading-relaxed text-ink/75 whitespace-pre-line">
              {texto}
            </p>
          ) : (
            <p className="leading-relaxed text-ink/75">
              {lang === "pt"
                ? "A TehivaTour é uma agência de viagens especializada em experiências únicas, com atendimento próximo e personalizado para cada viajante."
                : "TehivaTour is a travel agency specialized in unique experiences, with close and personalized service for every traveler."}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
