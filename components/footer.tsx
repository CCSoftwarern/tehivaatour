import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { ConfigRecord } from "@/lib/config";
import { getLogos } from "@/lib/queries";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

type Props = {
  lang: Locale;
  dict: Dictionary;
  config: ConfigRecord;
};

export default async function Footer({ lang, dict, config }: Props) {
  const [operadoras, certificados] = await Promise.all([
    getLogos("operadora"),
    getLogos("certificado"),
  ]);

  const links = [
    { href: `/${lang}`, label: dict.nav.inicio },
    { href: `/${lang}/pacotes`, label: dict.nav.pacotes },
    { href: `/${lang}/cruzeiros`, label: dict.nav.cruzeiros },
    { href: `/${lang}/seguros`, label: dict.nav.seguros },
    { href: `/${lang}/sobre`, label: dict.nav.sobre },
    { href: `/${lang}/contato`, label: dict.nav.contato },
  ];

  return (
    <footer className="bg-primary-dark text-white mt-20">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary text-white font-black text-lg">
              T
            </span>
            <span className="text-xl font-black">{config.site_nome || "TehivaTour"}</span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed max-w-xs">
            {dict.footer.descricao}
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-4">{dict.footer.links_titulo}</h3>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">{dict.footer.contato_titulo}</h3>
          <ul className="space-y-3 text-sm text-white/70">
            {config.telefone && (
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0" />
                <a href={`tel:${config.telefone.replace(/\D/g, "")}`} className="hover:text-white">
                  {config.telefone}
                </a>
              </li>
            )}
            {config.email && (
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-white">
                  {config.email}
                </a>
              </li>
            )}
            {config.endereco && (
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{config.endereco}</span>
              </li>
            )}
          </ul>

          {(config.instagram || config.facebook) && (
            <div className="mt-6">
              <h4 className="font-bold mb-3">{dict.footer.redes_titulo}</h4>
              <div className="flex items-center gap-3">
                {config.instagram && (
                  <a
                    href={config.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={16} />
                  </a>
                )}
                {config.facebook && (
                  <a
                    href={config.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon size={16} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {(operadoras.length > 0 || certificados.length > 0) && (
        <div className="border-t border-white/10 bg-white/[0.03]">
          <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
            {operadoras.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
                  {dict.footer.operadoras_titulo}
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  {operadoras.map((logo) => (
                    <div
                      key={logo.id}
                      className="grid place-items-center h-14 w-32 rounded-xl bg-white/10 px-3 transition-colors hover:bg-white/20"
                    >
                      <Image
                        src={logo.url}
                        alt={logo.titulo ?? ""}
                        width={120}
                        height={40}
                        className="max-h-10 w-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {certificados.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
                  {dict.footer.certificados_titulo}
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  {certificados.map((logo) => (
                    <div
                      key={logo.id}
                      className="grid place-items-center h-14 w-32 rounded-xl bg-white/10 px-3 transition-colors hover:bg-white/20"
                    >
                      <Image
                        src={logo.url}
                        alt={logo.titulo ?? ""}
                        width={120}
                        height={40}
                        className="max-h-10 w-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {config.site_nome || "TehivaTour"}.{" "}
            {dict.footer.direitos}
          </span>
          {config.credito_dev === "1" && (
            <span>
              Desenvolvido por{" "}
              {config.credito_url ? (
                <a
                  href={config.credito_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white underline"
                >
                  {config.credito_nome || "CC Software"}
                </a>
              ) : (
                <span className="text-white/70">
                  {config.credito_nome || "CC Software"}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
