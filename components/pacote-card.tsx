import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Package } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { Pacote } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

type Props = {
  pacote: Pacote;
  lang: Locale;
  dict: Dictionary;
};

export function PacoteCard({ pacote, lang, dict }: Props) {
  const titulo = lang === "pt" ? pacote.titulo_pt : pacote.titulo_en;
  const destino = lang === "pt" ? pacote.destino_pt : pacote.destino_en;
  const duracao = lang === "pt" ? pacote.duracao_pt : pacote.duracao_en;
  const categoriaLabel: Record<string, string> = {
    pacote: dict.nav.pacotes,
    cruzeiro: dict.nav.cruzeiros,
    seguro: dict.nav.seguros,
  };

  return (
    <Link
      href={`/${lang}/pacotes/${pacote.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-white border border-line shadow-sm hover:shadow-xl transition-shadow"
    >
      <div className="relative h-52 w-full overflow-hidden bg-primary/10">
        {pacote.imagem ? (
          <Image
            src={pacote.imagem}
            alt={titulo}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Package className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-primary-dark/90 text-white text-xs font-medium px-3 py-1 backdrop-blur">
          {categoriaLabel[pacote.categoria]}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-primary-dark group-hover:text-primary transition-colors">
          {titulo}
        </h3>
        <div className="mt-2 space-y-1.5">
          {destino && (
            <p className="flex items-center gap-2 text-sm text-ink/60">
              <MapPin size={14} className="text-primary shrink-0" />
              {destino}
            </p>
          )}
          {duracao && (
            <p className="flex items-center gap-2 text-sm text-ink/60">
              <Clock size={14} className="text-primary shrink-0" />
              {duracao}
            </p>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            {pacote.preco !== null ? (
              <>
                <p className="text-[11px] uppercase tracking-wide text-ink/40">
                  {dict.pacotes.a_partir_de}
                </p>
                <p className="text-xl font-black text-primary">
                  {formatCurrency(pacote.preco, lang)}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-primary">
                {dict.pacotes.duracao_nao_informada}
              </p>
            )}
          </div>
          <span className="text-sm font-semibold text-primary whitespace-nowrap">
            {dict.pacotes.ver_detalhes} →
          </span>
        </div>
      </div>
    </Link>
  );
}
