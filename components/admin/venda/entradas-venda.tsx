"use client";

import { Plus, Trash2 } from "lucide-react";
import { FORMAS_PAGAMENTO, normalizarEntrada, totalRecebido } from "@/lib/venda";
import type { Conta, Entrada } from "@/lib/types";
import { btnSecondary, inputClass, labelClass } from "../ui";

type Props = {
  entradas: Entrada[];
  contas: Conta[];
  saldo: number;
  onMudar: (entradas: Entrada[]) => void;
  onStatusSugerido: (pago: number) => void;
};

export function novaEntrada(): Entrada {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return normalizarEntrada({
    id: crypto.randomUUID(),
    valor: 0,
    data: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  });
}

export function EntradasVenda({ entradas, contas, saldo, onMudar, onStatusSugerido }: Props) {
  const recebidas = totalRecebido(entradas);
  const ativas = contas.filter((c) => c.ativa);

  function aplicar(id: string, mutacao: (entrada: Entrada) => Entrada) {
    const lista = entradas.map((e) => (e.id === id ? mutacao(e) : e));
    onMudar(lista);
    onStatusSugerido(totalRecebido(lista));
  }

  function adicionar() {
    onMudar([...entradas, novaEntrada()]);
  }

  function remover(id: string) {
    const lista = entradas.filter((e) => e.id !== id);
    onMudar(lista);
    onStatusSugerido(totalRecebido(lista));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-primary-dark">Entradas recebidas</h2>
        <button type="button" onClick={adicionar} className={btnSecondary}>
          <Plus size={16} />
          Adicionar entrada
        </button>
      </div>
      <p className="text-xs text-ink/50">
        Registre cada pagamento parcial e a conta que recebeu. A soma das entradas é
        o valor pago da venda.
      </p>

      {entradas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink/50">
          Nenhuma entrada lançada. Use &quot;Marcar como paga&quot; para registrar o
          total de uma vez.
        </p>
      ) : (
        <div className="space-y-4">
          {entradas.map((entrada) => (
            <div
              key={entrada.id}
              className="rounded-xl border border-line bg-surface/40 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className={labelClass}>Valor (R$) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={Number.isFinite(entrada.valor) ? entrada.valor : ""}
                    onChange={(e) =>
                      aplicar(entrada.id, (eAtual) => ({
                        ...eAtual,
                        valor: e.target.value === "" ? 0 : Number(e.target.value) || 0,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Data</label>
                  <input
                    type="date"
                    value={entrada.data ?? ""}
                    onChange={(e) =>
                      aplicar(entrada.id, (eAtual) => ({ ...eAtual, data: e.target.value || null }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Onde foi paga</label>
                  <select
                    value={entrada.conta_id ?? ""}
                    onChange={(e) =>
                      aplicar(entrada.id, (eAtual) => ({
                        ...eAtual,
                        conta_id: e.target.value || null,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">— Selecione —</option>
                    {ativas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Forma</label>
                  <select
                    value={entrada.forma_pagamento ?? ""}
                    onChange={(e) =>
                      aplicar(entrada.id, (eAtual) => ({
                        ...eAtual,
                        forma_pagamento: e.target.value || null,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">— Selecione —</option>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Observações</label>
                  <input
                    value={entrada.observacoes ?? ""}
                    onChange={(e) =>
                      aplicar(entrada.id, (eAtual) => ({
                        ...eAtual,
                        observacoes: e.target.value || null,
                      }))
                    }
                    className={inputClass}
                    placeholder="Ex: parcela 1/3, Pix recebido na agência"
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => remover(entrada.id)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ml-auto flex flex-col items-end gap-1 rounded-xl bg-emerald-50 px-5 py-3">
        <span className="text-sm text-ink/60">
          Recebido: <b className="text-emerald-700">R$ {recebidas.toFixed(2)}</b>
        </span>
        <span className="text-lg font-black text-primary-dark">
          Saldo: R$ {saldo.toFixed(2)}
        </span>
      </div>
    </div>
  );
}