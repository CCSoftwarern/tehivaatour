"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Logo, TipoLogo } from "@/lib/types";
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass, statusBadgeClass } from "./ui";
import { DeleteButton } from "./delete-button";

type Props = {
  logos: Logo[];
};

const tipos: { value: TipoLogo; label: string }[] = [
  { value: "operadora", label: "Operadora" },
  { value: "certificado", label: "Certificado" },
];

export function LogosAdmin({ logos }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [novoTipo, setNovoTipo] = useState<TipoLogo>("operadora");
  const total = logos.length;

  async function mover(id: string, direcao: -1 | 1) {
    const atual = logos.find((i) => i.id === id);
    const vizinho = logos[logos.indexOf(atual!) + direcao];
    if (!atual || !vizinho) return;
    const a = atual.ordem;
    const b = vizinho.ordem;
    await supabase.from("logos").update({ ordem: b }).eq("id", atual.id);
    await supabase.from("logos").update({ ordem: a }).eq("id", vizinho.id);
    router.refresh();
  }

  async function toggle(id: string, ativo: boolean) {
    await supabase.from("logos").update({ ativo }).eq("id", id);
    router.refresh();
  }

  async function uploadNova(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const caminho = `logos/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "png"}`;
    const { error } = await supabase.storage
      .from("imagens")
      .upload(caminho, file, { upsert: true });
    if (error) {
      alert(`Falha no upload (${error.statusCode ?? ""}): ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("imagens").getPublicUrl(caminho);
    await supabase.from("logos").insert({
      url: data.publicUrl,
      tipo: novoTipo,
      ordem: total,
      ativo: true,
    });
    router.refresh();
  }

  return (
    <div>
      <div className={`${cardClass} mb-6`}>
        <h2 className="font-bold text-primary-dark">Adicionar logo</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className={labelClass}>Tipo</label>
            <select
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value as TipoLogo)}
              className={inputClass}
            >
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <label className={`${btnPrimary} cursor-pointer`}>
            <ImagePlus size={16} />
            Selecionar imagem
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadNova}
            />
          </label>
          <p className="text-xs text-ink/50 max-w-xs">
            Logo branco/transparente fica melhor no fundo escuro do rodapé.
          </p>
        </div>
      </div>

      {logos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
          Nenhuma logo cadastrada. As que você adicionar aparecem no rodapé do
          site.
        </div>
      ) : (
        <div className="space-y-3">
          {logos.map((logo, i) => (
            <div
              key={logo.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="grid h-16 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white px-2">
                  <Image
                    src={logo.url}
                    alt={logo.titulo ?? ""}
                    width={120}
                    height={40}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink/70">
                    {i + 1}º ·{" "}
                    {logo.tipo === "operadora" ? "Operadora" : "Certificado"}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(logo.ativo ? "lida" : "arquivada")}`}
                  >
                    {logo.ativo ? "Ativo" : "Oculto"}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => mover(logo.id, -1)}
                  disabled={i === 0}
                  className="rounded-full border border-line p-2 text-ink/60 hover:text-primary disabled:opacity-30"
                  aria-label="Subir"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => mover(logo.id, 1)}
                  disabled={i === total - 1}
                  className="rounded-full border border-line p-2 text-ink/60 hover:text-primary disabled:opacity-30"
                  aria-label="Descer"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toggle(logo.id, !logo.ativo)
                  }
                  className={btnSecondary}
                >
                  {logo.ativo ? "Ocultar" : "Mostrar"}
                </button>
                <DeleteButton tabela="logos" id={logo.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
