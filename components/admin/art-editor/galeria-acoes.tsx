"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Arte } from "@/lib/types";

export function GaleriaAcoes({ arte }: { arte: Arte }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function duplicar() {
    setPending(true);
    const supabase = createClient();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
    const { error } = await supabase.from("artes").upsert({
      id,
      nome: `${arte.nome} (cópia)`,
      dados: arte.dados,
      thumb_url: arte.thumb_url,
    });
    setPending(false);
    if (error) {
      alert("Erro ao duplicar: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={duplicar}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-line disabled:opacity-50"
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
      Duplicar
    </button>
  );
}
