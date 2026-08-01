import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSiteConfig } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { ContatoForm } from "@/components/contato-form";
import { WhatsAppLink } from "@/components/whatsapp-button";

export const dynamic = "force-dynamic";

export default async function ContatoPage({
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

  return (
    <>
      <PageHeader title={dict.contato.titulo} subtitle={dict.contato.subtitulo} />
      <div className="mx-auto max-w-7xl px-4 pt-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              {dict.contato.form_titulo}
            </h2>
            <div className="mt-6">
              <ContatoForm dict={dict} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              {dict.contato.info_titulo}
            </h2>
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
      </div>
    </>
  );
}
