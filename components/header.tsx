"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Globe, Mail, Menu, Phone, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { ConfigRecord } from "@/lib/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
  config: ConfigRecord;
};

export default function Header({ lang, dict, config }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${lang}`, label: dict.nav.inicio, active: pathname === `/${lang}` },
    { href: `/${lang}/pacotes`, label: dict.nav.pacotes, active: pathname.startsWith(`/${lang}/pacotes`) },
    { href: `/${lang}/cruzeiros`, label: dict.nav.cruzeiros, active: pathname.startsWith(`/${lang}/cruzeiros`) },
    { href: `/${lang}/seguros`, label: dict.nav.seguros, active: pathname.startsWith(`/${lang}/seguros`) },
    { href: `/${lang}/sobre`, label: dict.nav.sobre, active: pathname.startsWith(`/${lang}/sobre`) },
    { href: `/${lang}/contato`, label: dict.nav.contato, active: pathname.startsWith(`/${lang}/contato`) },
  ];

  const switchLocale = (next: Locale): string => {
    const rest = pathname.replace(/^\/(pt|en)(\/|$)/, "/");
    return `/${next}${rest === "/" ? "" : rest}`;
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-primary-dark text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {config.telefone && (
              <span className="flex items-center gap-1.5">
                <Phone size={12} />
                {config.telefone}
              </span>
            )}
            {config.email && (
              <span className="hidden sm:flex items-center gap-1.5">
                <Mail size={12} />
                {config.email}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Globe size={12} />
            <Link
              href={switchLocale("pt")}
              className={`px-2 py-0.5 rounded hover:bg-white/10 ${lang === "pt" ? "font-bold bg-white/10" : ""}`}
            >
              PT
            </Link>
            <span className="opacity-40">|</span>
            <Link
              href={switchLocale("en")}
              className={`px-2 py-0.5 rounded hover:bg-white/10 ${lang === "en" ? "font-bold bg-white/10" : ""}`}
            >
              EN
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary text-white font-black text-lg group-hover:bg-primary-dark transition-colors">
              T
            </span>
            <span className="text-xl font-black tracking-tight text-primary-dark">
              {config.site_nome || "TehivaTour"}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  link.active
                    ? "text-primary bg-primary/10"
                    : "text-ink/80 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`/${lang}/contato`}
              className="hidden lg:inline-flex items-center gap-2 rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              {dict.nav.contato}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-line text-primary-dark"
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-line bg-white px-4 py-3 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  link.active
                    ? "text-primary bg-primary/10"
                    : "text-ink/80 hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${lang}/contato`}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold"
            >
              {dict.nav.contato}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
