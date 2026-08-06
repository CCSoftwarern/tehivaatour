"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Brush,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Palette,
  Settings,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  lang: string;
};

export function AdminNav({ lang }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: `/${lang}/admin`, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `/${lang}/admin/promocoes`, label: "Promoções", icon: Tag },
    { href: `/${lang}/admin/pacotes`, label: "Pacotes", icon: Package },
    { href: `/${lang}/admin/servicos`, label: "Serviços", icon: Settings },
    { href: `/${lang}/admin/hero`, label: "Banner", icon: Images },
    { href: `/${lang}/admin/artes`, label: "Editor de arte", icon: Brush },
    { href: `/${lang}/admin/orcamentos`, label: "Orçamentos", icon: FileText },
    { href: `/${lang}/admin/logos`, label: "Logos do rodapé", icon: Award },
    { href: `/${lang}/admin/mensagens`, label: "Mensagens", icon: MessageSquare },
    { href: `/${lang}/admin/configuracoes`, label: "Configurações", icon: Palette },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${lang}/admin/login`);
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-primary-dark text-white min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <p className="text-xl font-black">
          {lang === "pt" ? "Painel Adm" : "Admin"}
        </p>
        <p className="text-xs text-white/60 mt-1">
          {lang === "pt" ? "Gestão do site" : "Site management"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 space-y-1">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
        >
          <span className="text-lg leading-none">↗</span>
          {lang === "pt" ? "Ver site" : "View site"}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={18} />
          {lang === "pt" ? "Sair" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
