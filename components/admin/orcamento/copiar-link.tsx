"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopiarLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link abaixo:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title="Copiar link do PDF"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 hover:border-primary hover:text-primary"
    >
      {copiado ? <Check size={14} /> : <Copy size={14} />}
      {copiado ? "Copiado!" : "Copiar link"}
    </button>
  );
}
