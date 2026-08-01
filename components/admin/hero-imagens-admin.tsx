"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { HeroImagem } from "@/lib/types";
import { btnPrimary, btnSecondary, cardClass, statusBadgeClass } from "./ui";
import { DeleteButton } from "./delete-button";

type Props = {
  imagens: HeroImagem[];
};

export function HeroImagensAdmin({ imagens }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const total = imagens.length;

  async function mover(id: string, direcao: -1 | 1) {
    const atual = imagens.find((i) => i.id === id);
    const vizinho = imagens[imagens.indexOf(atual!) + direcao];
    if (!atual || !vizinho) return;
    const a = atual.ordem;
    const b = vizinho.ordem;
    await supabase.from("hero_imagens").update({ ordem: b }).eq("id", atual.id);
    await supabase.from("hero_imagens").update({ ordem: a }).eq("id", vizinho.id);
    router.refresh();
  }

  async function toggle(id: string, ativo: boolean) {
    await supabase.from("hero_imagens").update({ ativo }).eq("id", id);
    router.refresh();
  }

  return (
    <div>
      <div className={`${cardClass} mb-6 flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <h2 className="font-bold text-primary-dark">Enviar nova imagem</h2>
          <p className="mt-1 text-sm text-ink/50">
            A imagem entra no carrossel do topo do site. Recomendado: 1920×900
            ou proporção parecida.
          </p>
        </div>
        <label className={`${btnPrimary} cursor-pointer`}>
          <ImagePlus size={16} />
          Selecionar arquivo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const caminho = `hero/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
              const { error } = await supabase.storage
                .from("imagens")
                .upload(caminho, file, { upsert: true });
              if (error) {
                alert(
                  `Falha no upload (${error.statusCode ?? ""}): ${error.message}`,
                );
                return;
              }
              const { data } = supabase.storage
                .from("imagens")
                .getPublicUrl(caminho);
              await supabase.from("hero_imagens").insert({
                url: data.publicUrl,
                ordem: total,
                ativo: true,
              });
              router.refresh();
            }}
          />
        </label>
      </div>

      {imagens.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
          Nenhuma imagem cadastrada. O site usa o fundo padrão com as cores do
          tema.
        </div>
      ) : (
        <div className="space-y-3">
          {imagens.map((img, i) => (
            <div
              key={img.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-line">
                  <Image
                    src={img.url}
                    alt="Banner"
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink/70">
                    {i + 1}º banner
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(img.ativo ? "lida" : "arquivada")}`}
                  >
                    {img.ativo ? "Ativo" : "Oculto"}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => mover(img.id, -1)}
                  disabled={i === 0}
                  className="rounded-full border border-line p-2 text-ink/60 hover:text-primary disabled:opacity-30"
                  aria-label="Subir"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => mover(img.id, 1)}
                  disabled={i === total - 1}
                  className="rounded-full border border-line p-2 text-ink/60 hover:text-primary disabled:opacity-30"
                  aria-label="Descer"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(img.id, !img.ativo)}
                  className={btnSecondary}
                >
                  {img.ativo ? "Ocultar" : "Mostrar"}
                </button>
                <DeleteButton tabela="hero_imagens" id={img.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
