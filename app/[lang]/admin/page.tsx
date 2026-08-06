import Link from "next/link";
import { Eye, MessageSquare, Package, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cardClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();

  const [promocoes, pacotes, servicos, contatos, contador] = await Promise.all([
    supabase.from("promocoes").select("*", { count: "exact", head: true }),
    supabase.from("pacotes").select("*", { count: "exact", head: true }),
    supabase.from("servicos").select("*", { count: "exact", head: true }),
    supabase.from("contatos").select("*"),
    supabase.from("contadores").select("*").eq("chave", "visitas").maybeSingle(),
  ]);

  const novas = (contatos.data ?? []).filter((c) => c.status === "nova").length;
  const visitas = contador.data?.valor ?? 0;

  const cards = [
    { label: "Promoções", valor: promocoes.count ?? 0, icon: Tag, href: `/${lang}/admin/promocoes` },
    { label: "Pacotes", valor: pacotes.count ?? 0, icon: Package, href: `/${lang}/admin/pacotes` },
    { label: "Mensagens novas", valor: novas, icon: MessageSquare, href: `/${lang}/admin/mensagens` },
    { label: "Visitas", valor: visitas, icon: Eye, href: null },
  ];

  const recentes = (contatos.data ?? []).slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/50">
        Visão geral do seu conteúdo no site.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const conteudo = (
            <>
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <card.icon size={22} />
              </span>
              <p className="mt-4 text-3xl font-black text-primary-dark">
                {card.valor.toLocaleString("pt-BR")}
              </p>
              <p className="mt-1 text-sm font-medium text-ink/60">{card.label}</p>
            </>
          );
          return card.href ? (
            <Link key={card.href} href={card.href} className={cardClass}>
              {conteudo}
            </Link>
          ) : (
            <div key={card.label} className={cardClass}>
              {conteudo}
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-dark">
            Mensagens recentes
          </h2>
          <Link
            href={`/${lang}/admin/mensagens`}
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Ver todas →
          </Link>
        </div>
        {recentes.length === 0 ? (
          <p className={`${cardClass} mt-4 text-ink/50`}>
            Nenhuma mensagem recebida ainda.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentes.map((c) => (
              <div key={c.id} className={`${cardClass} flex items-start justify-between gap-4`}>
                <div className="min-w-0">
                  <p className="font-semibold text-primary-dark truncate">
                    {c.nome}
                  </p>
                  <p className="text-sm text-ink/60 truncate">{c.mensagem}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    c.status === "nova" ? "bg-accent/15 text-accent" : "bg-line text-ink/50"
                  }`}
                >
                  {c.status === "nova" ? "Nova" : c.status === "lida" ? "Lida" : "Arquivada"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
