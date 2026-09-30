import Link from "next/link";
import { Plus, ShoppingCart, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";
import { VendaFiltros } from "@/components/admin/venda/venda-filtros";
import { normalizarVenda, rotuloStatus, saldoVenda, totalVenda } from "@/lib/venda";
import type { Cliente, Venda } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_CLASS: Record<string, string> = {
  aberta: "bg-line text-ink/60",
  parcial: "bg-accent/15 text-accent",
  paga: "bg-emerald-50 text-emerald-600",
  cancelada: "bg-red-50 text-red-600",
};

type Busca = Record<string, string | string[] | undefined>;

function primeiro(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0] ?? "";
  return valor ?? "";
}

export default async function AdminVendas({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Busca>;
}) {
  const { lang } = await params;
  const busca = await searchParams;

  const q = primeiro(busca.q).trim().toLowerCase();
  const status = primeiro(busca.status);
  const clienteId = primeiro(busca.cliente);
  const campo = primeiro(busca.campo) === "venda" ? "data_venda" : "data_viagem";
  const de = primeiro(busca.de);
  const ate = primeiro(busca.ate);

  const supabase = await createClient();

  let consulta = supabase
    .from("vendas")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) consulta = consulta.eq("status", status);
  if (clienteId) consulta = consulta.eq("cliente_id", clienteId);
  if (de) consulta = consulta.gte(campo, de);
  if (ate) consulta = consulta.lte(campo, ate);

  const [{ data }, { data: clientesData }] = await Promise.all([
    consulta,
    supabase.from("clientes").select("*").order("nome", { ascending: true }),
  ]);

  const clientes = (clientesData ?? []) as Cliente[];
  const nomes = new Map(clientes.map((c) => [c.id, c.nome]));

  let vendas = ((data ?? []) as Venda[]).map(normalizarVenda);

  if (q) {
    vendas = vendas.filter((v) => {
      const nome = v.cliente_id ? nomes.get(v.cliente_id) ?? "" : "";
      return [v.numero, nome, v.pacote_nome, v.destino, v.observacoes]
        .filter(Boolean)
        .some((texto) => String(texto).toLowerCase().includes(q));
    });
  }

  const filtroAtivo = Boolean(q || status || clienteId || de || ate);

  const emAberto = vendas
    .filter((v) => v.status === "aberta" || v.status === "parcial")
    .reduce((soma, v) => soma + saldoVenda(v.itens, v.valor_pago), 0);
  const comissaoTotal = vendas
    .filter((v) => v.status !== "cancelada")
    .reduce((soma, v) => soma + v.comissoes.reduce((s, c) => s + (totalVenda(v.itens) * c.percentual) / 100, 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-primary-dark">
            <ShoppingCart size={24} /> Vendas
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Vendas de pacotes e turísticos com tarifas, taxas, descontos,
            abatimentos, percentuais e comissões.
          </p>
        </div>
        <Link href={`/${lang}/admin/vendas/novo`} className={btnPrimary}>
          <Plus size={16} />
          Nova venda
        </Link>
      </div>

      {vendas.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-ink/50">
              {filtroAtivo ? "Vendas no filtro" : "Vendas registradas"}
            </p>
            <p className="mt-1 text-2xl font-black text-primary-dark">{vendas.length}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-ink/50">A receber</p>
            <p className="mt-1 text-2xl font-black text-accent">
              R$ {emAberto.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-ink/50">Comissões geradas</p>
            <p className="mt-1 text-2xl font-black text-primary-dark">
              R$ {comissaoTotal.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <VendaFiltros
        key={`${q}|${status}|${clienteId}|${de}|${ate}|${campo}`}
        lang={lang}
        clientes={clientes}
      />

      {vendas.length === 0 ? (
        filtroAtivo ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-ink/30" />
            <p className="font-bold text-primary-dark">Nenhuma venda encontrada</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink/50">
              Ajuste os filtros ou limpe a busca para ver todos os lançamentos.
            </p>
            <Link href={`/${lang}/admin/vendas`} className={`${btnSecondary} mt-5`}>
              Limpar filtros
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
            <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-ink/30" />
            <p className="font-bold text-primary-dark">Nenhuma venda registrada</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink/50">
              Lance a primeira venda: escolha o cliente, adicione os itens e defina
              as comissões.
            </p>
            <Link href={`/${lang}/admin/vendas/novo`} className={`${btnPrimary} mt-5`}>
              <Plus size={16} />
              Lançar primeira venda
            </Link>
          </div>
        )
      ) : (
        <div className="mt-6 space-y-3">
          {vendas.map((v) => {
            const total = totalVenda(v.itens);
            const saldo = saldoVenda(v.itens, v.valor_pago);
            const cliente = v.cliente_id ? nomes.get(v.cliente_id) : null;
            return (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {v.numero}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_CLASS[v.status] ?? STATUS_CLASS.aberta
                      }`}
                    >
                      {rotuloStatus(v.status)}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate font-bold text-primary-dark">
                    {cliente || "Cliente não informado"}
                  </h3>
                  <p className="text-sm text-ink/50">
                    {[
                      v.pacote_nome,
                      v.destino,
                      v.data_viagem,
                      `${v.quantidade_pax} pax`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-lg font-black text-primary-dark">
                    R$ {total.toFixed(2)}
                  </p>
                  {saldo > 0 && v.status !== "cancelada" && (
                    <p className="text-xs font-semibold text-accent">
                      Saldo R$ {saldo.toFixed(2)}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Link href={`/${lang}/admin/vendas/${v.id}`} className={btnSecondary}>
                      Editar
                    </Link>
                    <DeleteButton tabela="vendas" id={v.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
