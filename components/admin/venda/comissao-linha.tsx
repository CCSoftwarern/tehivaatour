"use client";

import { Trash2 } from "lucide-react";
import { novoId } from "@/lib/arte/constantes";
import { PAPEIS_COMISSAO, valorComissao } from "@/lib/venda";
import type { Comissao, PapelComissao } from "@/lib/types";
import { inputClass, labelClass } from "../ui";

type Props = {
  comissao: Comissao;
  totalVenda: number;
  totalPercentuais: number;
  onMudar: (comissao: Comissao) => void;
  onRemover: () => void;
};

export function ComissaoLinha({
  comissao,
  totalVenda,
  totalPercentuais,
  onMudar,
  onRemover,
}: Props) {
  const excedeu = totalPercentuais > 100;

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_180px_120px_140px_auto] sm:items-end">
      <div>
        <label className={labelClass}>Responsável *</label>
        <input
          value={comissao.pessoa}
          onChange={(e) => onMudar({ ...comissao, pessoa: e.target.value })}
          className={inputClass}
          placeholder="Nome de quem recebe"
        />
      </div>
      <div>
        <label className={labelClass}>Função</label>
        <select
          value={comissao.papel}
          onChange={(e) => onMudar({ ...comissao, papel: e.target.value as PapelComissao })}
          className={inputClass}
        >
          {PAPEIS_COMISSAO.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.rotulo}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Percentual (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={Number.isFinite(comissao.percentual) ? comissao.percentual : ""}
          onChange={(e) =>
            onMudar({
              ...comissao,
              percentual: e.target.value === "" ? 0 : Number(e.target.value) || 0,
            })
          }
          className={inputClass}
        />
      </div>
      <p className="pb-2.5 text-right text-sm font-bold text-primary-dark">
        R$ {valorComissao(comissao, totalVenda).toFixed(2)}
      </p>
      <div className="pb-1.5">
        <button
          type="button"
          onClick={onRemover}
          title="Remover comissão"
          className="rounded-lg border border-line p-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {excedeu && (
        <p className="text-xs text-red-600 sm:col-span-full">
          A soma das comissões passou de 100% ({totalPercentuais.toFixed(2)}%).
        </p>
      )}
    </div>
  );
}

export function novaComissao(): Comissao {
  return { id: novoId(), pessoa: "", papel: "vendedor", percentual: 0 };
}
