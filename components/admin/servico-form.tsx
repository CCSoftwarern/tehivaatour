"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Servico } from "@/lib/types";
import { ImageUpload } from "./imagem-upload";
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from "./ui";

type Props = {
  lang: string;
  servico?: Servico | null;
};

export function ServicoForm({ lang, servico }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState("");
  const [imagem, setImagem] = useState<string | null>(servico?.imagem ?? null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErro("");
    const f = new FormData(event.currentTarget);

    const dados = {
      icone: String(f.get("icone") ?? "").trim() || null,
      titulo_pt: String(f.get("titulo_pt") ?? ""),
      titulo_en: String(f.get("titulo_en") ?? ""),
      descricao_pt: String(f.get("descricao_pt") ?? "") || null,
      descricao_en: String(f.get("descricao_en") ?? "") || null,
      imagem,
      ordem: parseIntOrNull(f.get("ordem")),
      ativo: f.get("ativo") === "on",
    };

    try {
      const supabase = createClient();
      const { error } = servico
        ? await supabase.from("servicos").update(dados).eq("id", servico.id)
        : await supabase.from("servicos").insert(dados);
      if (error) {
        setErro(error.message);
        setPending(false);
        return;
      }
      router.push(`/${lang}/admin/servicos`);
      router.refresh();
    } catch {
      setErro("Erro inesperado ao salvar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Identificação</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Nome do ícone (lucide) — opcional
            </label>
            <input
              name="icone"
              placeholder="ex: Plane, Compass"
              defaultValue={servico?.icone ?? ""}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-ink/50">
              Se vazio, usa um ícone automático. Você também pode enviar uma
              imagem própria.
            </p>
          </div>
          <div>
            <label className={labelClass}>Ordem</label>
            <input
              name="ordem"
              type="number"
              defaultValue={servico?.ordem ?? 0}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Título (PT) *</label>
          <input
            name="titulo_pt"
            required
            defaultValue={servico?.titulo_pt ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Título (EN) *</label>
          <input
            name="titulo_en"
            required
            defaultValue={servico?.titulo_en ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Descrição</h2>
        <div>
          <label className={labelClass}>Descrição (PT)</label>
          <textarea
            name="descricao_pt"
            rows={3}
            defaultValue={servico?.descricao_pt ?? ""}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className={labelClass}>Descrição (EN)</label>
          <textarea
            name="descricao_en"
            rows={3}
            defaultValue={servico?.descricao_en ?? ""}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Imagem</h2>
        <ImageUpload value={imagem} onChange={setImagem} pasta="servicos" />
      </div>

      <div className={`${cardClass} flex flex-wrap gap-6`}>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={servico?.ativo ?? true}
            className="h-4 w-4 accent-[var(--cor-primaria)]"
          />
          Ativo (visível no site)
        </label>
      </div>

      {erro && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={btnPrimary}>
          <Save size={16} />
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <a href={`/${lang}/admin/servicos`} className={btnSecondary}>
          Cancelar
        </a>
      </div>
    </form>
  );
}

function parseIntOrNull(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}
