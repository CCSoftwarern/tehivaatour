import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Ship, ShieldCheck, Plane } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import {
  getHeroImagens,
  getPacotes,
  getPromocoes,
  getServicos,
  getSiteConfig,
} from "@/lib/queries";
import { SectionTitle } from "@/components/section-title";
import { HeroCarousel } from "@/components/hero-carousel";
import { PromoCard } from "@/components/promo-card";
import { PacoteGrid } from "@/components/pacote-grid";
import { ServicoIcon } from "@/components/servico-icon";
import { ContatoForm } from "@/components/contato-form";
import { WhatsAppLink } from "@/components/whatsapp-button";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, config, promocoes, servicos, pacotes, heroImagens] =
    await Promise.all([
      getDictionary(lang),
      getSiteConfig(),
      getPromocoes(),
      getServicos(),
      getPacotes("pacote", 3),
      getHeroImagens(),
    ]);

  const heroTitulo =
    config[`hero_titulo_${lang}`] || config.site_nome || "TehivaTour";
  const heroSubtitulo =
    config[`hero_subtitulo_${lang}`] || "";

  const categorias = [
    {
      href: `/${lang}/pacotes`,
      icon: Plane,
      titulo: dict.categorias.pacotes,
      desc: dict.categorias.pacotes_desc,
    },
    {
      href: `/${lang}/cruzeiros`,
      icon: Ship,
      titulo: dict.categorias.cruzeiros,
      desc: dict.categorias.cruzeiros_desc,
    },
    {
      href: `/${lang}/seguros`,
      icon: ShieldCheck,
      titulo: dict.categorias.seguros,
      desc: dict.categorias.seguros_desc,
    },
  ];

  return (
    <>
      {/* Hero */}
      {heroImagens.length > 0 ? (
        <HeroCarousel imagens={heroImagens.map((h) => h.url)}>
          <p className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wide backdrop-blur">
            {config.site_nome || "TehivaTour"}
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl sm:text-6xl font-black tracking-tight drop-shadow-lg">
            {heroTitulo}
          </h1>
          {heroSubtitulo && (
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
              {heroSubtitulo}
            </p>
          )}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#promocoes"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white hover:bg-white hover:text-primary-dark transition-colors"
            >
              {dict.hero.cta}
              <ArrowRight size={18} />
            </a>
            <Link
              href={`/${lang}/contato`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-primary-dark transition-colors"
            >
              {dict.hero.cta_contato}
            </Link>
          </div>
        </HeroCarousel>
      ) : (
        <section
          className="relative overflow-hidden text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--cor-primaria-escura) 0%, var(--cor-primaria) 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 py-24 sm:py-32 text-center">
            <p className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wide backdrop-blur">
              {config.site_nome || "TehivaTour"}
            </p>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl sm:text-6xl font-black tracking-tight">
              {heroTitulo}
            </h1>
            {heroSubtitulo && (
              <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
                {heroSubtitulo}
              </p>
            )}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#promocoes"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white hover:bg-white hover:text-primary-dark transition-colors"
              >
                {dict.hero.cta}
                <ArrowRight size={18} />
              </a>
              <Link
                href={`/${lang}/contato`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-primary-dark transition-colors"
              >
                {dict.hero.cta_contato}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 -mt-10 relative z-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {categorias.map((categoria) => (
            <Link
              key={categoria.href}
              href={categoria.href}
              className="group rounded-2xl bg-white border border-line shadow-lg p-6 hover:-translate-y-1 transition-transform"
            >
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <categoria.icon size={24} />
              </span>
              <h3 className="mt-4 font-bold text-primary-dark">{categoria.titulo}</h3>
              <p className="mt-1 text-sm text-ink/60">{categoria.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {dict.categorias.ver_mais}
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promoções */}
      <section id="promocoes" className="mx-auto max-w-7xl px-4 pt-24">
        <SectionTitle
          title={dict.promocoes.titulo}
          subtitle={dict.promocoes.subtitulo}
        />
        {promocoes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {promocoes.map((promocao) => (
              <PromoCard
                key={promocao.id}
                promocao={promocao}
                lang={lang}
                dict={dict}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-ink/60">{dict.promocoes.sem_promocoes}</p>
        )}
      </section>

      {/* Serviços */}
      <section className="mt-24 bg-primary-dark py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle
            light
            title={dict.servicos.titulo}
            subtitle={dict.servicos.subtitulo}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white">
                  <ServicoIcon icon={servico.icone ?? ""} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-bold">
                  {lang === "pt" ? servico.titulo_pt : servico.titulo_en}
                </h3>
                <p className="mt-1.5 text-sm text-white/70">
                  {lang === "pt" ? servico.descricao_pt : servico.descricao_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pacotes em destaque */}
      {pacotes.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-24">
          <SectionTitle
            title={dict.pacotes.titulo}
            subtitle={dict.pacotes.subtitulo}
          />
          <PacoteGrid pacotes={pacotes} lang={lang} dict={dict} />
          <div className="mt-10 text-center">
            <Link
              href={`/${lang}/pacotes`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-7 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
            >
              {dict.categorias.ver_mais}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Contato */}
      <section className="mx-auto max-w-7xl px-4 pt-24" id="contato">
        <SectionTitle
          title={dict.contato.titulo}
          subtitle={dict.contato.subtitulo}
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-bold text-primary-dark">
              {dict.contato.form_titulo}
            </h3>
            <div className="mt-6">
              <ContatoForm dict={dict} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-dark">
              {dict.contato.info_titulo}
            </h3>
            <div className="mt-6 space-y-4 rounded-2xl bg-white border border-line p-6">
              {config.telefone && (
                <p className="flex items-center gap-3 text-sm">
                  <span className="text-primary font-semibold">
                    {dict.contato.telefone_label}:
                  </span>
                  {config.telefone}
                </p>
              )}
              {config.email && (
                <p className="flex items-center gap-3 text-sm">
                  <span className="text-primary font-semibold">
                    {dict.contato.email_label}:
                  </span>
                  {config.email}
                </p>
              )}
              {config.endereco && (
                <p className="flex items-center gap-3 text-sm">
                  <span className="text-primary font-semibold">
                    {dict.contato.endereco_label}:
                  </span>
                  {config.endereco}
                </p>
              )}
              <div className="pt-2 border-t border-line">
                <h4 className="text-sm font-semibold text-primary">
                  {dict.contato.horario_titulo}
                </h4>
                <p
                  className="mt-1.5 text-sm text-ink/60"
                  dangerouslySetInnerHTML={{ __html: dict.contato.horario }}
                />
              </div>
              <div className="pt-2">
                <WhatsAppLink
                  whatsapp={config.whatsapp}
                  label={dict.contato.whatsapp}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
