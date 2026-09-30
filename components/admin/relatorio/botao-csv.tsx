"use client";

import { Download } from "lucide-react";

type Props = {
  rotulo: string;
  nome: string;
  csv: string;
};

function baixar(nome: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}

export function BotaoCsv({ rotulo, nome, csv }: Props) {
  return (
    <button
      type="button"
      onClick={() => baixar(nome, csv)}
      disabled={csv.length <= 1}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink/80 transition-colors hover:bg-surface disabled:opacity-50"
    >
      <Download size={16} />
      {rotulo}
    </button>
  );
}