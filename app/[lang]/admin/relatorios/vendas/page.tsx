import { Building2, Download, TrendingUp, Users, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { normalizarVenda } from "@/lib/venda";
import {
  comissoesPorPessoa,
  entradasParaCsv,
  entradasPorConta,
  resumirVendas,
  totaisRelatorio,
  vendasParaCsv,
} from "@/lib/relatorio";
import { BotaoCsv } from "@/components/admin/relatorio/botao-csv";
import { RelatorioFiltros } from "@/components/admin/relatorio/relatorio-filtros";
import type { Cliente, Conta, Entrada, Venda } from "@/lib/types";

export const dynamic = "force-dynamic";

const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function primeiroDiaDoMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function RelatorioVendas({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  const sp = await searchParams;

  const primeiro = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
  const campo = primeiro(sp.campo) === "viagem" ? "viagem" : "venda";
  const status = primeiro(sp.status);
  const de = primeiro(sp.de) || primeiroDiaDoMes();
  const ate = primeiro(sp.ate);

  const supabase = await createClient();

  let consulta = supabase.from("vendas").select("*");
  const coluna = campo === "viagem" ? "data_viagem" : "data_venda";
  consulta = consulta.gte(coluna, de);
  if (ate) consulta = consulta.lte(coluna, ate);
  if (status) consulta = consulta.eq("status", status);

  const { data: vendasData } = await consulta.order("data_venda", { ascending: false });
  const vendas = (vendasData ?? []).map((v) => normalizarVenda(v as Partial<Venda>));
  const ids = vendas.map((v) => v.id);

  // Duas recortes diferentes, de propósito:
  // - entradasDaVenda: todas as entradas dessas vendas, para o saldo ser verdadeiro
  //   (uma venda de setembro com parcela em novembro continua devendo).
  // - entradasDoPeriodo: só o que caiu no período, para o fluxo de caixa por conta.
  const [contasRes, clientesRes, entradasVendaRes, entradasPeriodoRes] = await Promise.all([
    supabase.from("contas").select("*").order("nome", { ascending: true }),
    supabase.from("clientes").select("id, nome"),
    ids.length
      ? supabase.from("entradas").select("*").in("venda_id", ids)
      : Promise.resolve({ data: [] as unknown[], error: null }),
    supabase
      .from("entradas")
      .select("*")
      .gte("data", de)
      .lte("data", ate || "2999-12-31")
      .order("data", { ascending: false }),
  ]);

  const contas = (contasRes.data ?? []) as Conta[];
  const nomes = new Map(
    (clientesRes.data ?? []).map((c) => [c.id as string, (c as Cliente).nome ?? ""]),
  );
  const nomesContas = new Map(contas.map((c) => [c.id, c.nome]));

  const entradasDaVenda = (entradasVendaRes.data ?? []) as Entrada[];
  const entradasDoPeriodo = (entradasPeriodoRes.data ?? []) as Entrada[];

  const resumos = resumirVendas(vendas, entradasDaVenda);
  const totais = totaisRelatorio(resumos, true);
  const porPessoa = comissoesPorPessoa(resumos);
  const porConta = entradasPorConta(entradasDoPeriodo, contas);
  const totalContas = porConta.reduce((s, l) => s + l.valor, 0);

  const csvVendas = vendasParaCsv(resumos, nomes);
  const csvEntradas = entradasParaCsv(entradasDoPeriodo, nomesContas);

  const periodo = `${de} a ${ate || "hoje"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-primary-dark">
            <TrendingUp size={24} /> Relatório de vendas
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Faturamento, comissões por responsável e entradas por conta bancária.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <RelatorioFiltros lang={lang} campo={campo} status={status} de={de} ate={ate} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-ink/50">Vendido</p>
          <p className="mt-1 text-2xl font-black text-primary-dark">R$ {brl(totais.vendido)}</p>
          <p className="mt-1 text-xs text-ink/40">
            {totais.vendas} vendas · {totais.passages} passageiros
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-ink/50">Recebido nessas vendas</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">R$ {brl(totais.recebido)}</p>
          <p className="mt-1 text-xs text-ink/40">Ticket médio R$ {brl(totais.ticketMedio)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-ink/50">A receber</p>
          <p className="mt-1 text-2xl font-black text-accent">R$ {brl(totais.saldo)}</p>
          <p className="mt-1 text-xs text-ink/40">Vendas canceladas fora do total</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-ink/50">Comissões</p>
          <p className="mt-1 text-2xl font-black text-primary-dark">
            R$ {brl(totais.comissaoTotal)}
          </p>
          <p className="mt-1 text-xs text-ink/40">Sobre o total líquido das vendas</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <BotaoCsv rotulo="Exportar vendas" nome="relatorio-vendas.csv" csv={csvVendas} />
        <BotaoCsv rotulo="Exportar entradas" nome="entradas-vendas.csv" csv={csvEntradas} />
        <span className="flex items-center gap-1.5 text-xs text-ink/40">
          <Download size={14} />
          CSV separado por &quot;;&quot;, abre direto no Excel.
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 font-bold text-primary-dark">
            <Users size={18} /> Comissões por responsável
          </h2>
          {porPessoa.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink/50">
              Nenhuma comissão lançada no período.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-5 py-3">Responsável</th>
                  <th className="px-5 py-3">Papel</th>
                  <th className="px-5 py-3 text-right">Vendas</th>
                  <th className="px-5 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {porPessoa.map((linha, i) => (
                  <tr key={`${linha.pessoa}-${linha.papel}-${i}`} className="border-t border-line">
                    <td className="px-5 py-3 font-medium text-primary-dark">{linha.pessoa}</td>
                    <td className="px-5 py-3 text-ink/60">{linha.papel}</td>
                    <td className="px-5 py-3 text-right text-ink/60">{linha.vendas}</td>
                    <td className="px-5 py-3 text-right font-bold text-primary-dark">
                      R$ {brl(linha.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-line">
                <tr>
                  <td className="px-5 py-3 font-bold text-primary-dark" colSpan={3}>
                    Total
                  </td>
                  <td className="px-5 py-3 text-right font-black text-primary-dark">
                    R$ {brl(totais.comissaoTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 font-bold text-primary-dark">
            <Building2 size={18} /> Entradas por conta
          </h2>
          <p className="border-b border-line bg-surface/30 px-5 py-2 text-xs text-ink/50">
            Dinheiro que caiu entre {de} e {ate || "hoje"}, independente da data
            da venda.
          </p>
          {porConta.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink/50">
              Nenhuma entrada no período.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-5 py-3">Conta</th>
                  <th className="px-5 py-3 text-right">Entradas</th>
                  <th className="px-5 py-3 text-right">Recebido</th>
                  <th className="px-5 py-3 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {porConta.map((linha, i) => (
                  <tr key={`${linha.contaId}-${i}`} className="border-t border-line">
                    <td className="px-5 py-3 font-medium text-primary-dark">{linha.nome}</td>
                    <td className="px-5 py-3 text-right text-ink/60">{linha.entradas}</td>
                    <td className="px-5 py-3 text-right font-bold text-primary-dark">
                      R$ {brl(linha.valor)}
                    </td>
                    <td className="px-5 py-3 text-right text-ink/60">
                      {totalContas > 0
                        ? `${((linha.valor / totalContas) * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white shadow-sm">
        <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 font-bold text-primary-dark">
          <Wallet size={18} /> Vendas do período ({periodo})
        </h2>
        {resumos.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/50">
            Nenhuma venda no período selecionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-5 py-3">Venda</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Pacote</th>
                  <th className="px-5 py-3">Viagem</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Recebido</th>
                  <th className="px-5 py-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {resumos.map(({ venda, total, recebido, saldo }) => (
                  <tr key={venda.id} className="border-t border-line">
                    <td className="px-5 py-3 font-medium text-primary-dark">{venda.numero}</td>
                    <td className="px-5 py-3 text-ink/70">
                      {venda.cliente_id ? nomes.get(venda.cliente_id) ?? "—" : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink/70">{venda.pacote_nome ?? "—"}</td>
                    <td className="px-5 py-3 text-ink/60">{venda.data_viagem ?? "—"}</td>
                    <td className="px-5 py-3 text-right">R$ {brl(total)}</td>
                    <td className="px-5 py-3 text-right text-emerald-700">
                      R$ {brl(recebido)}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-medium ${
                        saldo > 0 ? "text-accent" : "text-ink/40"
                      }`}
                    >
                      R$ {brl(saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}