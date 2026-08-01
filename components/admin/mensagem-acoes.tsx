"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Contato } from "@/lib/types";

type Props = {
  contato: Contato;
};

export function MensagemAcoes({ contato }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function setStatus(status: string) {
    setPending(true);
    const supabase = createClient();
    await supabase.from("contatos").update({ status }).eq("id", contato.id);
    setPending(false);
    router.refresh();
  }

  async function excluir() {
    setPending(true);
    const supabase = createClient();
    await supabase.from("contatos").delete().eq("id", contato.id);
    setPending(false);
    router.refresh();
  }

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={excluir}
          disabled={pending}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-full bg-line px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-line/70"
        >
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {contato.status !== "lida" && (
        <button
          type="button"
          onClick={() => setStatus("lida")}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
        >
          <Check size={14} />
          Marcar lida
        </button>
      )}
      {contato.status !== "arquivada" && (
        <button
          type="button"
          onClick={() => setStatus("arquivada")}
          className="rounded-full bg-line px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-line/70"
        >
          Arquivar
        </button>
      )}
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
      >
        <Trash2 size={14} />
        Excluir
      </button>
    </span>
  );
}
