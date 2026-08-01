import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Sparkles, Tag } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { Promocao } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

type Props = {
  promocao: Promocao;
  lang: Locale;
  dict: Dictionary;
};

export function PromoCard({ promocao, lang, dict }: Props) {
  const titulo = lang === "pt" ? promocao.titulo_pt : promocao.titulo_en;
  const descricao = lang === "pt" ? promocao.descricao_pt : promocao.descricao_en;
  const href = promocao.slug
    ? `/${lang}/pacotes/${promocao.slug}`
    : `/${lang}/pacotes`;

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-white border border-line shadow-sm hover:shadow-xl transition-shadow"
    >
      <div className="relative h-52 w-full overflow-hidden bg-primary/10">
        {promocao.imagem ? (
          <Image
            src={promocao.imagem}
            alt={titulo}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Tag className="h-12 w-12 text-primary/40" />
          </div>
        )}
        {promocao.destaque && (
          <span className="absolute top-3 left-3 rounded-full bg-accent text-white text-xs font-bold px-3 py-1 shadow flex items-center gap-1">
            <Sparkles size={12} />
            {lang === "pt" ? "Destaque" : "Featured"}
          </span>
        )}
        {promocao.vencimento && (
          <span className="absolute top-3 right-3 rounded-full bg-primary-dark/90 text-white text-xs font-medium px-3 py-1 flex items-center gap-1 backdrop-blur">
            <CalendarDays size={12} />
            {dict.promocoes.valido_ate} {formatDate(promocao.vencimento, lang)}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-primary-dark group-hover:text-primary transition-colors">
          {titulo}
        </h3>
        {descricao && (
          <p className="mt-2 text-sm text-ink/60 line-clamp-2">{descricao}</p>
        )}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            {promocao.preco_promocional !== null && (
              <>
                {promocao.preco !== null && (
                  <p className="text-xs text-ink/40 line-through">
                    {formatCurrency(promocao.preco, lang)}
                  </p>
                )}
                <p className="text-xl font-black text-accent">
                  {formatCurrency(promocao.preco_promocional, lang)}
                </p>
              </>
            )}
            {promocao.preco_promocional === null && promocao.preco !== null && (
              <p className="text-xl font-black text-primary">
                {formatCurrency(promocao.preco, lang)}
              </p>
            )}
            {promocao.preco_promocional === null && promocao.preco === null && (
              <p className="text-sm font-semibold text-primary">
                {dict.promocoes.a_partir_de}
              </p>
            )}
          </div>
          <span className="text-sm font-semibold text-primary whitespace-nowrap">
            {dict.promocoes.ver_pacote} →
          </span>
        </div>
      </div>
    </Link>
  );
}
