"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  tabela: "promocoes" | "pacotes" | "servicos" | "contatos" | "hero_imagens";
  id: string;
  redirectTo?: string;
};

export function DeleteButton({ tabela, id, redirectTo }: Props) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.from(tabela).delete().eq("id", id);
    if (!error) {
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } else {
      setPending(false);
      alert("Erro ao excluir: " + error.message);
    }
  }

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : "Confirmar"}
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
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
    >
      <Trash2 size={14} />
      Excluir
    </button>
  );
}
