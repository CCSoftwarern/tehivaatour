"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Promocao } from "@/lib/types";
import { toInputValue, toIso } from "@/lib/datetime";
import { ImageUpload } from "./imagem-upload";
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from "./ui";

type Props = {
  lang: string;
  promocao?: Promocao | null;
};

export function PromocaoForm({ lang, promocao }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState("");
  const [imagem, setImagem] = useState<string | null>(promocao?.imagem ?? null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErro("");
    const f = new FormData(event.currentTarget);

    const dados = {
      titulo_pt: String(f.get("titulo_pt") ?? ""),
      titulo_en: String(f.get("titulo_en") ?? ""),
      descricao_pt: String(f.get("descricao_pt") ?? "") || null,
      descricao_en: String(f.get("descricao_en") ?? "") || null,
      preco: parseFloatOrNull(f.get("preco")),
      preco_promocional: parseFloatOrNull(f.get("preco_promocional")),
      slug: String(f.get("slug") ?? "").trim() || null,
      imagem,
      destaque: f.get("destaque") === "on",
      ativo: f.get("ativo") === "on",
      inicio: toIso(String(f.get("inicio") ?? "")),
      vencimento: toIso(String(f.get("vencimento") ?? "")),
    };

    try {
      const supabase = createClient();
      const { error } = promocao
        ? await supabase.from("promocoes").update(dados).eq("id", promocao.id)
        : await supabase.from("promocoes").insert(dados);
      if (error) {
        setErro(error.message);
        setPending(false);
        return;
      }
      router.push(`/${lang}/admin/promocoes`);
      router.refresh();
    } catch {
      setErro("Erro inesperado ao salvar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Texto (PT)</h2>
        <div>
          <label className={labelClass}>Título (PT) *</label>
          <input
            name="titulo_pt"
            required
            defaultValue={promocao?.titulo_pt ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Descrição (PT)</label>
          <textarea
            name="descricao_pt"
            rows={3}
            defaultValue={promocao?.descricao_pt ?? ""}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Texto (EN)</h2>
        <div>
          <label className={labelClass}>Título (EN) *</label>
          <input
            name="titulo_en"
            required
            defaultValue={promocao?.titulo_en ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Descrição (EN)</label>
          <textarea
            name="descricao_en"
            rows={3}
            defaultValue={promocao?.descricao_en ?? ""}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Valores e datas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Preço normal (R$)</label>
            <input
              name="preco"
              type="number"
              step="0.01"
              min="0"
              defaultValue={promocao?.preco ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Preço promocional (R$)</label>
            <input
              name="preco_promocional"
              type="number"
              step="0.01"
              min="0"
              defaultValue={promocao?.preco_promocional ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Início</label>
            <input
              name="inicio"
              type="datetime-local"
              defaultValue={toInputValue(promocao?.inicio)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Vencimento</label>
            <input
              name="vencimento"
              type="datetime-local"
              defaultValue={toInputValue(promocao?.vencimento)}
              className={inputClass}
            />
          </div>
        </div>
        <p className="text-xs text-ink/50">
          Deixe <strong>Vencimento</strong> vazio para nunca expirar. A promoção
          sai do site automaticamente após a data de vencimento.
        </p>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Imagem e link</h2>
        <div>
          <label className={labelClass}>Imagem</label>
          <ImageUpload value={imagem} onChange={setImagem} pasta="promocoes" />
        </div>
        <div>
          <label className={labelClass}>
            Link para pacote (slug) — opcional
          </label>
          <input
            name="slug"
            placeholder="ex: balneario-camboriu"
            defaultValue={promocao?.slug ?? ""}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink/50">
            Se preenchido com o slug de um pacote, o botão da promoção leva até
            ele.
          </p>
        </div>
      </div>

      <div className={`${cardClass} flex flex-wrap gap-6`}>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="destaque"
            defaultChecked={promocao?.destaque ?? false}
            className="h-4 w-4 accent-[var(--cor-primaria)]"
          />
          Destaque (aparece primeiro)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={promocao?.ativo ?? true}
            className="h-4 w-4 accent-[var(--cor-primaria)]"
          />
          Ativo
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
        <a href={`/${lang}/admin/promocoes`} className={btnSecondary}>
          Cancelar
        </a>
      </div>
    </form>
  );
}

function parseFloatOrNull(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = parseFloat(value.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}
