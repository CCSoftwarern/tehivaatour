"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Categoria, Pacote } from "@/lib/types";
import { slugify, toInputValue, toIso } from "@/lib/datetime";
import { ImageUpload } from "./imagem-upload";
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from "./ui";

type Props = {
  lang: string;
  pacote?: Pacote | null;
};

const categorias: { value: Categoria; label: string }[] = [
  { value: "pacote", label: "Pacote de Viagem" },
  { value: "cruzeiro", label: "Cruzeiro / Navio" },
  { value: "seguro", label: "Seguro Viagem" },
];

export function PacoteForm({ lang, pacote }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState("");
  const [imagem, setImagem] = useState<string | null>(pacote?.imagem ?? null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErro("");
    const f = new FormData(event.currentTarget);

    const tituloPt = String(f.get("titulo_pt") ?? "");
    const slug =
      String(f.get("slug") ?? "").trim() || slugify(tituloPt);

    const dados = {
      categoria: String(f.get("categoria") ?? "pacote") as Categoria,
      titulo_pt: tituloPt,
      titulo_en: String(f.get("titulo_en") ?? ""),
      descricao_pt: String(f.get("descricao_pt") ?? "") || null,
      descricao_en: String(f.get("descricao_en") ?? "") || null,
      destino_pt: String(f.get("destino_pt") ?? "") || null,
      destino_en: String(f.get("destino_en") ?? "") || null,
      duracao_pt: String(f.get("duracao_pt") ?? "") || null,
      duracao_en: String(f.get("duracao_en") ?? "") || null,
      preco: parseFloatOrNull(f.get("preco")),
      slug,
      imagem,
      ativo: f.get("ativo") === "on",
      vencimento: toIso(String(f.get("vencimento") ?? "")),
    };

    try {
      const supabase = createClient();
      const { error } = pacote
        ? await supabase.from("pacotes").update(dados).eq("id", pacote.id)
        : await supabase.from("pacotes").insert(dados);
      if (error) {
        setErro(error.message);
        setPending(false);
        return;
      }
      router.push(`/${lang}/admin/pacotes`);
      router.refresh();
    } catch {
      setErro("Erro inesperado ao salvar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Dados gerais</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Categoria</label>
            <select
              name="categoria"
              defaultValue={pacote?.categoria ?? "pacote"}
              className={inputClass}
            >
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Slug (URL)</label>
            <input
              name="slug"
              placeholder="gerado do título se vazio"
              defaultValue={pacote?.slug ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Título (PT) *</label>
          <input
            name="titulo_pt"
            required
            defaultValue={pacote?.titulo_pt ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Título (EN) *</label>
          <input
            name="titulo_en"
            required
            defaultValue={pacote?.titulo_en ?? ""}
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
            rows={4}
            defaultValue={pacote?.descricao_pt ?? ""}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className={labelClass}>Descrição (EN)</label>
          <textarea
            name="descricao_en"
            rows={4}
            defaultValue={pacote?.descricao_en ?? ""}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Destino, duração e preço</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Destino (PT)</label>
            <input
              name="destino_pt"
              defaultValue={pacote?.destino_pt ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Destino (EN)</label>
            <input
              name="destino_en"
              defaultValue={pacote?.destino_en ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Duração (PT)</label>
            <input
              name="duracao_pt"
              placeholder="ex: 7 noites"
              defaultValue={pacote?.duracao_pt ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Duração (EN)</label>
            <input
              name="duracao_en"
              placeholder="ex: 7 nights"
              defaultValue={pacote?.duracao_en ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Preço (R$)</label>
            <input
              name="preco"
              type="number"
              step="0.01"
              min="0"
              defaultValue={pacote?.preco ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Vencimento</label>
            <input
              name="vencimento"
              type="datetime-local"
              defaultValue={toInputValue(pacote?.vencimento)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-ink/50">
              Vazio = sempre disponível.
            </p>
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Imagem</h2>
        <ImageUpload value={imagem} onChange={setImagem} pasta="pacotes" />
      </div>

      <div className={`${cardClass} flex flex-wrap gap-6`}>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={pacote?.ativo ?? true}
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
        <a href={`/${lang}/admin/pacotes`} className={btnSecondary}>
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
