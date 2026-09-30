"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { novoId } from "@/lib/arte/constantes";
import { TIPOS_PRODUTO, valorDoItem, valorPercentual } from "@/lib/venda";
import type { TipoProdutoOrcamento, VendaItem } from "@/lib/types";
import { inputClass, labelClass } from "../ui";

type Props = {
  item: VendaItem;
  indice: number;
  totalItens: number;
  onMudar: (item: VendaItem) => void;
  onRemover: () => void;
  onSubir: () => void;
  onDescer: () => void;
};

function numeroOuVazio(valor: string): number {
  return valor === "" ? 0 : Number(valor) || 0;
}

export function VendaItemLinha({
  item,
  indice,
  totalItens,
  onMudar,
  onRemover,
  onSubir,
  onDescer,
}: Props) {
  const acrescimoPercentual = valorPercentual(item.tarifa, item.percentual);

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-ink/40">
          Item {indice + 1} de {totalItens}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSubir}
            disabled={indice === 0}
            title="Mover para cima"
            className="rounded-lg border border-line p-1.5 text-ink/60 hover:text-primary disabled:opacity-30"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onDescer}
            disabled={indice === totalItens - 1}
            title="Mover para baixo"
            className="rounded-lg border border-line p-1.5 text-ink/60 hover:text-primary disabled:opacity-30"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={onRemover}
            title="Remover item"
            className="rounded-lg border border-line p-1.5 text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Tipo de produto</label>
          <select
            value={item.tipoProduto ?? ""}
            onChange={(e) =>
              onMudar({
                ...item,
                tipoProduto: (e.target.value || undefined) as TipoProdutoOrcamento | undefined,
              })
            }
            className={inputClass}
          >
            <option value="">— Selecione —</option>
            {TIPOS_PRODUTO.map((op) => (
              <option key={op.valor} value={op.valor}>
                {op.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Descrição</label>
          <input
            value={item.descricao}
            onChange={(e) => onMudar({ ...item, descricao: e.target.value })}
            className={inputClass}
            placeholder="Ex: Pacote Roma + Paris, 7 dias, hospedagem e traslados"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <label className={labelClass}>Tarifa (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={Number.isFinite(item.tarifa) ? item.tarifa : ""}
            onChange={(e) => onMudar({ ...item, tarifa: numeroOuVazio(e.target.value) })}
            className={inputClass}
            placeholder="0,00"
          />
        </div>
        <div>
          <label className={labelClass}>Percentual (%)</label>
          <input
            type="number"
            step="0.01"
            value={Number.isFinite(item.percentual) ? item.percentual : ""}
            onChange={(e) => onMudar({ ...item, percentual: numeroOuVazio(e.target.value) })}
            className={inputClass}
            placeholder="0,00"
          />
          {acrescimoPercentual !== 0 && (
            <p className="mt-1 text-xs text-ink/50">
              + R$ {acrescimoPercentual.toFixed(2)} sobre a tarifa
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Desconto (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={Number.isFinite(item.desconto) ? item.desconto : ""}
            onChange={(e) => onMudar({ ...item, desconto: numeroOuVazio(e.target.value) })}
            className={inputClass}
            placeholder="0,00"
          />
        </div>
        <div>
          <label className={labelClass}>Abatimento (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={Number.isFinite(item.abatimento) ? item.abatimento : ""}
            onChange={(e) => onMudar({ ...item, abatimento: numeroOuVazio(e.target.value) })}
            className={inputClass}
            placeholder="0,00"
          />
        </div>
        <div>
          <label className={labelClass}>Taxas (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={Number.isFinite(item.taxas) ? item.taxas : ""}
            onChange={(e) => onMudar({ ...item, taxas: numeroOuVazio(e.target.value) })}
            className={inputClass}
            placeholder="0,00"
          />
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-primary/5 px-4 py-2 text-right text-sm text-ink/60">
        Tarifa + {item.percentual.toFixed(2)}% − {item.desconto.toFixed(2)} −{" "}
        {item.abatimento.toFixed(2)} + {item.taxas.toFixed(2)} ={" "}
        <span className="font-bold text-primary-dark">
          R$ {valorDoItem(item).toFixed(2)}
        </span>
      </p>
    </div>
  );
}

export function novaVendaItem(): VendaItem {
  return {
    id: novoId(),
    tipo: "padrao",
    descricao: "",
    tarifa: 0,
    taxas: 0,
    desconto: 0,
    abatimento: 0,
    percentual: 0,
    imagem: null,
  };
}
