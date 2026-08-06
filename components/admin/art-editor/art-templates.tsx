"use client";

import { X } from "lucide-react";
import type { ConfigRecord } from "@/lib/config";

type Props = {
  config: ConfigRecord;
  onFechar: () => void;
  onAplicar: (nome: "promocao" | "novo_pacote" | "dica" | "sobre") => void;
};

const MODELOS: {
  id: "promocao" | "novo_pacote" | "dica" | "sobre";
  nome: string;
  desc: string;
}[] = [
  { id: "promocao", nome: "Promoção", desc: "Desconto em destaque com CTA" },
  { id: "novo_pacote", nome: "Novo pacote", desc: "Lançamento de destino" },
  { id: "dica", nome: "Dica de viagem", desc: "Conteúdo com cara de feed" },
  { id: "sobre", nome: "Sobre a agência", desc: "Apresentação da marca" },
];

export function ArtTemplates({ config, onFechar, onAplicar }: Props) {
  const primaria = config.cor_primaria || "#1e6fd9";
  const escura = config.cor_primaria_escura || "#0b2447";
  const destaque = config.cor_destaque || "#ff6b35";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-primary-dark">Modelos prontos</h2>
            <p className="text-sm text-ink/50">
              Escolha um modelo e personalize com suas cores e textos.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full bg-surface p-2 text-ink/60 hover:bg-line"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MODELOS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onAplicar(m.id)}
              className="group overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className="relative flex h-44 items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${escura}, ${primaria})`,
                }}
              >
                <span
                  className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white"
                  style={{ background: destaque }}
                >
                  {m.nome}
                </span>
              </div>
              <div className="p-4">
                <p className="font-bold text-primary-dark">{m.nome}</p>
                <p className="text-xs text-ink/50">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
