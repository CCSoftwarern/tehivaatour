import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Package } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getPacotePorSlug, getSiteConfig } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { WhatsAppLink } from "@/components/whatsapp-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const pacote = await getPacotePorSlug(slug);
  if (!pacote) return {};
  return {
    title: lang === "pt" ? pacote.titulo_pt : pacote.titulo_en,
  };
}

export default async function PacoteDetalhePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, pacote, config] = await Promise.all([
    getDictionary(lang),
    getPacotePorSlug(slug),
    getSiteConfig(),
  ]);

  if (!pacote) notFound();

  const titulo = lang === "pt" ? pacote.titulo_pt : pacote.titulo_en;
  const descricao = lang === "pt" ? pacote.descricao_pt : pacote.descricao_en;
  const destino = lang === "pt" ? pacote.destino_pt : pacote.destino_en;
  const duracao = lang === "pt" ? pacote.duracao_pt : pacote.duracao_en;
  const categoriaLabel: Record<string, string> = {
    pacote: dict.nav.pacotes,
    cruzeiro: dict.nav.cruzeiros,
    seguro: dict.nav.seguros,
  };
  const whatsappMessage = `Olá! Tenho interesse no pacote: ${titulo}.`;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <Link
        href={`/${lang}/${pacote.categoria === "pacote" ? "pacotes" : pacote.categoria === "cruzeiro" ? "cruzeiros" : "seguros"}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
      >
        <ArrowLeft size={16} />
        {dict.pacotes.voltar}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-primary/10 border border-line">
          {pacote.imagem ? (
            <Image
              src={pacote.imagem}
              alt={titulo}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <Package className="h-16 w-16 text-primary/40" />
            </div>
          )}
        </div>

        <div>
          <span className="inline-block rounded-full bg-primary/10 text-primary text-xs font-bold px-3 py-1">
            {categoriaLabel[pacote.categoria]}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-primary-dark">
            {titulo}
          </h1>

          <div className="mt-5 space-y-2.5">
            {destino && (
              <p className="flex items-center gap-2.5 text-ink/70">
                <MapPin size={18} className="text-primary shrink-0" />
                {dict.pacotes.destino}: <strong>{destino}</strong>
              </p>
            )}
            {duracao && (
              <p className="flex items-center gap-2.5 text-ink/70">
                <Clock size={18} className="text-primary shrink-0" />
                {dict.pacotes.duracao}: <strong>{duracao}</strong>
              </p>
            )}
            {pacote.vencimento && (
              <p className="flex items-center gap-2.5 text-ink/70">
                <CalendarDays size={18} className="text-primary shrink-0" />
                {dict.pacotes.valido_ate}:{" "}
                <strong>{formatDate(pacote.vencimento, lang)}</strong>
              </p>
            )}
          </div>

          {descricao && (
            <p className="mt-6 leading-relaxed text-ink/75 whitespace-normal break-words">
              {descricao}
            </p>
          )}

          <div className="mt-8 rounded-2xl bg-white border border-line p-6 flex flex-col sm:flex-row flex-wrap sm:items-center sm:justify-between gap-5">
            <div>
              {pacote.preco !== null ? (
                <>
                  <p className="text-xs uppercase tracking-wide text-ink/40">
                    {dict.pacotes.a_partir_de}
                  </p>
                  <p className="text-3xl font-black text-primary">
                    {formatCurrency(pacote.preco, lang)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-primary">
                  {dict.pacotes.duracao_nao_informada}
                </p>
              )}
            </div>
            <WhatsAppLink
              whatsapp={config.whatsapp}
              message={whatsappMessage}
              label={dict.pacotes.solicitar_orcamento}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
