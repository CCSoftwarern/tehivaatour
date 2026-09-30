import { ChevronDown } from "lucide-react";
import type { GrupoEmbarque } from "@/lib/embarque";
import { diasAte, rotuloEmbarque } from "@/lib/embarque";
import { rotuloStatus } from "@/lib/venda";

const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function EmbarqueCard({ grupo }: { grupo: GrupoEmbarque }) {
  const dias = diasAte(grupo.data);

  const faixa =
    dias === 0
      ? "bg-red-50 text-red-700 border-red-200"
      : dias <= 7
        ? "bg-accent/15 text-accent border-accent/30"
        : "bg-surface text-ink/60 border-line";

  return (
    <details className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-surface/50">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`rounded-xl border px-3 py-1.5 text-center ${faixa}`}>
            <span className="block text-xs leading-tight">
              {paraDia(grupo.data)}/{paraMes(grupo.data)}
            </span>
            <span className="block text-sm font-black leading-tight">{paraAno(grupo.data)}</span>
          </span>
          <div className="min-w-0">
            <p className="font-bold capitalize text-primary-dark">{rotuloEmbarque(grupo.data)}</p>
            <p className="mt-0.5 text-sm text-ink/50">
              {grupo.vendas} {grupo.vendas === 1 ? "grupo" : "grupos"} · {grupo.pax} passageiros
              {dias === 0 ? " · embarca hoje" : dias > 0 ? ` · em ${dias} dias` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-xs text-ink/50">Vendido</p>
            <p className="font-bold text-primary-dark">R$ {brl(grupo.total)}</p>
          </div>
          {grupo.saldo > 0 && (
            <div className="text-right">
              <p className="text-xs text-ink/50">A receber</p>
              <p className="font-bold text-accent">R$ {brl(grupo.saldo)}</p>
            </div>
          )}
          <ChevronDown
            size={18}
            className="shrink-0 text-ink/40 transition-transform group-open:rotate-180"
          />
        </div>
      </summary>

      <div className="overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="px-5 py-3">Passageiro</th>
              <th className="px-5 py-3">Pacote / destino</th>
              <th className="px-5 py-3 text-right">Pax</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {grupo.passageiros.map((p) => (
              <tr key={p.venda.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <p className="font-medium text-primary-dark">{p.cliente}</p>
                  {p.telefone && <p className="text-xs text-ink/50">{p.telefone}</p>}
                </td>
                <td className="px-5 py-3 text-ink/70">
                  {p.venda.pacote_nome ?? "—"}
                  {p.venda.destino && (
                    <p className="text-xs text-ink/50">{p.venda.destino}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-ink/70">{p.venda.quantidade_pax}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      p.venda.status === "paga"
                        ? "bg-emerald-50 text-emerald-700"
                        : p.venda.status === "parcial"
                          ? "bg-accent/15 text-accent"
                          : "bg-line text-ink/60"
                    }`}
                  >
                    {rotuloStatus(p.venda.status)}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">R$ {brl(p.total)}</td>
                <td
                  className={`px-5 py-3 text-right font-medium ${
                    p.saldo > 0 ? "text-accent" : "text-ink/40"
                  }`}
                >
                  R$ {brl(p.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function paraDia(iso: string) {
  return iso.slice(8, 10);
}
function paraMes(iso: string) {
  const mes = Number(iso.slice(5, 7));
  return ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][
    mes - 1
  ];
}
function paraAno(iso: string) {
  return iso.slice(0, 4);
}