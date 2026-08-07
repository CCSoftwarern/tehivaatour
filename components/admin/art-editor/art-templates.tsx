"use client";

import { X } from "lucide-react";
import type { ConfigRecord } from "@/lib/config";

type TemplateId =
  | "promocao"
  | "novo_pacote"
  | "dica"
  | "sobre"
  | "natal"
  | "ano_novo"
  | "dia_das_maes"
  | "pascoa"
  | "black_friday"
  | "dia_dos_pais"
  | "dia_dos_namorados"
  | "carnaval"
  | "verao"
  | "inverno";

type Props = {
  config: ConfigRecord;
  onFechar: () => void;
  onAplicar: (nome: TemplateId) => void;
};

const MODELOS_BASE: { id: TemplateId; nome: string; desc: string }[] = [
  { id: "promocao", nome: "Promoção", desc: "Desconto em destaque com CTA" },
  { id: "novo_pacote", nome: "Novo pacote", desc: "Lançamento de destino" },
  { id: "dica", nome: "Dica de viagem", desc: "Conteúdo com cara de feed" },
  { id: "sobre", nome: "Sobre a agência", desc: "Apresentação da marca" },
];

const MODELOS_SAZONAIS: { id: TemplateId; nome: string; desc: string }[] = [
  { id: "natal", nome: "Natal", desc: "Pacotes mágicos de fim de ano" },
  { id: "ano_novo", nome: "Ano Novo", desc: "Réveillon e planejamento 2025" },
  { id: "dia_das_maes", nome: "Dia das Mães", desc: "Viagem presente especial" },
  { id: "pascoa", nome: "Páscoa", desc: "Feriado prolongado em família" },
  { id: "black_friday", nome: "Black Friday", desc: "Até 50% off em pacotes" },
  { id: "dia_dos_pais", nome: "Dia dos Pais", desc: "Aventura e descanso" },
  { id: "dia_dos_namorados", nome: "Dia dos Namorados", desc: "Romance package a dois" },
  { id: "carnaval", nome: "Carnaval", desc: "Folia, praia ou descanso" },
  { id: "verao", nome: "Verão", desc: "Sol, mar e melhores tarifas" },
  { id: "inverno", nome: "Inverno", desc: "Serra, lareira e fondue" },
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
        className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
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

        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary-dark">
              Básicos
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MODELOS_BASE.map((m) => (
                <TemplateCard key={m.id} modelo={m} primaria={primaria} escura={escura} destaque={destaque} onClick={onAplicar} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary-dark">
              Datas comemorativas
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MODELOS_SAZONAIS.map((m) => (
                <TemplateCard key={m.id} modelo={m} primaria={primaria} escura={escura} destaque={destaque} onClick={onAplicar} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  modelo,
  primaria,
  escura,
  destaque,
  onClick,
}: {
  modelo: { id: TemplateId; nome: string; desc: string };
  primaria: string;
  escura: string;
  destaque: string;
  onClick: (id: TemplateId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(modelo.id)}
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
          {modelo.nome}
        </span>
      </div>
      <div className="p-4">
        <p className="font-bold text-primary-dark">{modelo.nome}</p>
        <p className="text-xs text-ink/50">{modelo.desc}</p>
      </div>
    </button>
  );
}
