"use client";

import {
  ArrowDown,
  ArrowUp,
  Plane,
  Ship,
  Shield,
  MapPin,
  Hotel,
  Briefcase,
  Trash2,
} from "lucide-react";
import { novoId } from "@/lib/arte/constantes";
import { brl, valorDoItem } from "@/lib/orcamento";
import type { OrcamentoItem, TipoProdutoOrcamento } from "@/lib/types";
import { inputClass, labelClass } from "../ui";

type Props = {
  item: OrcamentoItem;
  onMudar: (item: OrcamentoItem) => void;
  onRemover: () => void;
  onSubir: () => void;
  onDescer: () => void;
  primeiro: boolean;
  ultimo: boolean;
};

const TIPOS_PRODUTO: { valor: TipoProdutoOrcamento; rotulo: string; icone: React.ReactNode }[] = [
  { valor: "aereo", rotulo: "Aéreo", icone: <Plane size={20} /> },
  { valor: "aereo_hotel", rotulo: "Aéreo + Hotel", icone: <Hotel size={20} /> },
  { valor: "navio", rotulo: "Navio / Cruzeiro", icone: <Ship size={20} /> },
  { valor: "seguro_viagem", rotulo: "Seguro Viagem", icone: <Shield size={20} /> },
  { valor: "receptivo", rotulo: "Receptivo / Transfer", icone: <MapPin size={20} /> },
  { valor: "somente_aereo", rotulo: "Somente Aéreo", icone: <Briefcase size={20} /> },
];

function IconeProduto({ tipo }: { tipo?: TipoProdutoOrcamento }) {
  const t = TIPOS_PRODUTO.find((x) => x.valor === tipo);
  if (!t) return <div className="w-10 h-10" />;
  return (
    <div className="flex items-center justify-center w-full h-full text-primary">
      {t.icone}
    </div>
  );
}

export function OrcamentoItemLinha({
  item,
  onMudar,
  onRemover,
  onSubir,
  onDescer,
  primeiro,
  ultimo,
}: Props) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-ink/40">
          Item {item.id.slice(0, 4).toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSubir}
            disabled={primeiro}
            title="Mover para cima"
            className="rounded-lg border border-line p-1.5 text-ink/60 hover:text-primary disabled:opacity-30"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onDescer}
            disabled={ultimo}
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

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-medium text-ink/50">Tipo:</span>
        {(
          [
            { valor: "padrao", rotulo: "Padrão" },
            { valor: "imagem", rotulo: "Somente imagem" },
          ] as const
        ).map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => onMudar({ ...item, tipo: op.valor })}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
              item.tipo === op.valor
                ? "border-primary bg-primary/10 text-primary"
                : "border-line text-ink/50 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {op.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-medium text-ink/50">Tipo de produto:</span>
        <select
          value={item.tipoProduto ?? ""}
          onChange={(e) => onMudar({ ...item, tipoProduto: e.target.value as TipoProdutoOrcamento || undefined })}
          className={`${inputClass} w-48`}
        >
          <option value="">— Selecione —</option>
          {TIPOS_PRODUTO.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.rotulo}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row">
        <div className="shrink-0">
          <div className="relative overflow-hidden rounded-xl border border-line bg-white h-24 w-36">
            <IconeProduto tipo={item.tipoProduto} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-ink/40">
            {item.tipoProduto ? (
              <>
                <span>{TIPOS_PRODUTO.find((t) => t.valor === item.tipoProduto)?.rotulo}</span>
              </>
            ) : (
              <>Selecione o tipo de produto</>
            )}
          </p>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_120px_120px]">
          {item.tipo === "imagem" && (
            <div className="col-span-full rounded-lg border border-dashed border-line bg-surface px-3 py-2 text-xs text-ink/50">
              Item apenas com imagem (ex.: recorte de trecho aéreo) — os valores
              ficam ao lado e são somados ao orçamento.
            </div>
          )}
          {item.tipo !== "imagem" && (
            <div>
              <label className={labelClass}>Descrição</label>
              <textarea
                rows={3}
                value={item.descricao}
                onChange={(e) => onMudar({ ...item, descricao: e.target.value })}
                className={`${inputClass} resize-none`}
                placeholder="Ex: Pacote Roma + Paris com hospedagem e traslados"
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Tarifa (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={Number.isFinite(item.tarifa) ? item.tarifa : ""}
              onChange={(e) =>
                onMudar({ ...item, tarifa: Number(e.target.value) || 0 })
              }
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
              onChange={(e) =>
                onMudar({ ...item, taxas: Number(e.target.value) || 0 })
              }
              className={inputClass}
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-right text-sm text-ink/60">
        Valor do item:{" "}
        <span className="font-bold text-primary-dark">{brl(valorDoItem(item))}</span>
      </p>
    </div>
  );
}

export function novoItem(): OrcamentoItem {
  return { id: novoId(), tipo: "padrao", descricao: "", tarifa: 0, taxas: 0, imagem: null };
}
