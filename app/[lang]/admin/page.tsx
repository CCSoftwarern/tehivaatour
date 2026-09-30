import Link from "next/link";
import {
  Eye,
  Landmark,
  MessageSquare,
  Package,
  Plane,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cardClass } from "@/components/admin/ui";
import { diasAte, hojeIso, proximosEmbarques, rotuloEmbarque } from "@/lib/embarque";
import { normalizarVenda } from "@/lib/venda";
import type { Cliente, Entrada, Venda } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();

  const [promocoes, pacotes, contatos, contador, clientes, vendas, contas] =
    await Promise.all([
      supabase.from("promocoes").select("*", { count: "exact", head: true }),
      supabase.from("pacotes").select("*", { count: "exact", head: true }),
      supabase.from("contatos").select("*"),
      supabase.from("contadores").select("*").eq("chave", "visitas").maybeSingle(),
      supabase.from("clientes").select("*", { count: "exact", head: true }),
      supabase.from("vendas").select("*", { count: "exact", head: true }),
      supabase.from("contas").select("*", { count: "exact", head: true }),
    ]);

  const novas = (contatos.data ?? []).filter((c) => c.status === "nova").length;
  const visitas = contador.data?.valor ?? 0;

  const cards = [
    { label: "Promoções", valor: promocoes.count ?? 0, icon: Tag, href: `/${lang}/admin/promocoes` },
    { label: "Pacotes", valor: pacotes.count ?? 0, icon: Package, href: `/${lang}/admin/pacotes` },
    { label: "Clientes", valor: clientes.count ?? 0, icon: Users, href: `/${lang}/admin/clientes` },
    { label: "Vendas", valor: vendas.count ?? 0, icon: ShoppingCart, href: `/${lang}/admin/vendas` },
    { label: "Embarques", valor: "", icon: Plane, href: `/${lang}/admin/embarques` },
    { label: "Contas", valor: contas.count ?? 0, icon: Landmark, href: `/${lang}/admin/contas` },
    { label: "Relatórios", valor: "", icon: TrendingUp, href: `/${lang}/admin/relatorios/vendas` },
    { label: "Mensagens novas", valor: novas, icon: MessageSquare, href: `/${lang}/admin/mensagens` },
    { label: "Visitas", valor: visitas, icon: Eye, href: null },
  ];

  const recentes = (contatos.data ?? []).slice(0, 5);

  const { data: vendasFuturas } = await supabase
    .from("vendas")
    .select("*")
    .not("data_viagem", "is", null)
    .gte("data_viagem", hojeIso())
    .neq("status", "cancelada")
    .order("data_viagem", { ascending: true });

  const vendasProximas = (vendasFuturas ?? []).map((v) => normalizarVenda(v as Partial<Venda>));
  const { data: proximasEntradas } = vendasProximas.length
    ? await supabase
        .from("entradas")
        .select("*")
        .in("venda_id", vendasProximas.map((v) => v.id))
    : { data: [] as unknown[] };

  const mapaClientes = new Map(
    ((await supabase.from("clientes").select("id, nome, telefone")).data ?? []).map((c) => [
      c.id as string,
      { nome: (c as Cliente).nome ?? "", telefone: (c as Cliente).telefone ?? null },
    ]),
  );

  const proximos = proximosEmbarques(
    vendasProximas,
    (proximasEntradas ?? []) as Entrada[],
    mapaClientes,
    5,
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/50">
        Visão geral do seu conteúdo no site.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          <h2 className="flex items-center gap-2 text-lg font-bold text-primary-dark">
            <Plane size={18} /> Próximos embarques
          </h2>
          <Link
            href={`/${lang}/admin/embarques`}
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Ver todos →
          </Link>
        </div>
        {proximos.length === 0 ? (
          <p className={`${cardClass} mt-4 text-ink/50`}>
            Nenhum embarque com data marcada para os próximos dias.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {proximos.map((grupo) => {
              const dias = diasAte(grupo.data);
              return (
                <Link
                  key={grupo.data}
                  href={`/${lang}/admin/embarques?de=${grupo.data}&ate=${grupo.data}`}
                  className={`${cardClass} flex flex-wrap items-center justify-between gap-4 hover:border-primary/40`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold capitalize text-primary-dark">
                      {rotuloEmbarque(grupo.data)}
                    </p>
                    <p className="mt-1 text-sm text-ink/60 truncate">
                      {grupo.passageiros.map((p) => p.cliente).join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-5">
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-dark">
                        {grupo.pax} pax
                      </p>
                      <p className="text-xs text-ink/50">
                        {grupo.vendas} {grupo.vendas === 1 ? "grupo" : "grupos"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        dias === 0
                          ? "bg-red-50 text-red-700"
                          : dias <= 7
                            ? "bg-accent/15 text-accent"
                            : "bg-line text-ink/60"
                      }`}
                    >
                      {dias === 0 ? "hoje" : dias === 1 ? "amanhã" : `em ${dias} dias`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
