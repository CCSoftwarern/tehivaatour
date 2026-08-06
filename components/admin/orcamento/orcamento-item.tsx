"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { novoId } from "@/lib/arte/constantes";
import { brl, valorDoItem } from "@/lib/orcamento";
import type { OrcamentoItem } from "@/lib/types";
import { inputClass, labelClass } from "../ui";

type Props = {
  item: OrcamentoItem;
  onMudar: (item: OrcamentoItem) => void;
  onRemover: () => void;
  onSubir: () => void;
  onDescer: () => void;
  primeiro: boolean;
  ultimo: boolean;
};

export function OrcamentoItemLinha({
  item,
  onMudar,
  onRemover,
  onSubir,
  onDescer,
  primeiro,
  ultimo,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviarImagem(file: File | undefined | null) {
    setErro("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Cole ou selecione uma imagem.");
      return;
    }
    setEnviando(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const caminho = `orcamentos/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("imagens")
        .upload(caminho, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("imagens").getPublicUrl(caminho);
      onMudar({ ...item, imagem: data.publicUrl });
    } catch (e) {
      setErro(
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : "Falha ao enviar a imagem.",
      );
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const file = e.clipboardData?.files?.[0];
    if (file) {
      e.preventDefault();
      enviarImagem(file);
    }
  }

  return (
    <div
      onPaste={handlePaste}
      className="rounded-2xl border border-line bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-ink/40">
          Item {item.id.slice(0, 4).toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSubir}
            disabled={primeiro}
            title="Mover para cima"
            className="rounded-lg border border-line p-1.5 text-ink/60 hover:text-primary disabled:opacity-30"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onDescer}
            disabled={ultimo}
            title="Mover para baixo"
            className="rounded-lg border border-line p-1.5 text-ink/60 hover:text-primary disabled:opacity-30"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={onRemover}
            title="Remover item"
            className="rounded-lg border border-line p-1.5 text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-medium text-ink/50">Tipo:</span>
        {(
          [
            { valor: "padrao", rotulo: "Padrão" },
            { valor: "imagem", rotulo: "Somente imagem" },
          ] as const
        ).map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => onMudar({ ...item, tipo: op.valor })}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
              item.tipo === op.valor
                ? "border-primary bg-primary/10 text-primary"
                : "border-line text-ink/50 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {op.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row">
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => enviarImagem(e.target.files?.[0])}
          />
          {item.imagem ? (
            <div
              className={`relative overflow-hidden rounded-xl border border-line ${
                item.tipo === "imagem" ? "h-44 w-64" : "h-24 w-36"
              }`}
            >
              <Image
                src={item.imagem}
                alt="Imagem do item"
                fill
                sizes={item.tipo === "imagem" ? "256px" : "144px"}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onMudar({ ...item, imagem: null })}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 shadow hover:bg-white"
                title="Remover imagem"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={enviando}
              className={`grid place-items-center rounded-xl border-2 border-dashed border-line bg-surface text-ink/40 hover:border-primary hover:text-primary transition-colors ${
                item.tipo === "imagem" ? "h-44 w-64" : "h-24 w-36"
              }`}
            >
              {enviando ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ImagePlus size={20} />
              )}
            </button>
          )}
          <p className="mt-1 flex items-center gap-1 text-[11px] text-ink/40">
            <ClipboardPaste size={11} /> Clique ou cole (Ctrl+V)
          </p>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_120px_120px]">
          {item.tipo === "imagem" && (
            <div className="col-span-full rounded-lg border border-dashed border-line bg-surface px-3 py-2 text-xs text-ink/50">
              Item apenas com imagem (ex.: recorte de trecho aéreo) — os valores
              ficam ao lado e são somados ao orçamento.
            </div>
          )}
          {item.tipo !== "imagem" && (
            <div>
              <label className={labelClass}>Descrição</label>
              <textarea
                rows={3}
                value={item.descricao}
                onChange={(e) => onMudar({ ...item, descricao: e.target.value })}
                className={`${inputClass} resize-none`}
                placeholder="Ex: Pacote Roma + Paris com hospedagem e traslados"
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Tarifa (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={Number.isFinite(item.tarifa) ? item.tarifa : ""}
              onChange={(e) =>
                onMudar({ ...item, tarifa: Number(e.target.value) || 0 })
              }
              className={inputClass}
              placeholder="0,00"
            />
          </div>
          <div>
            <label className={labelClass}>Taxas (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={Number.isFinite(item.taxas) ? item.taxas : ""}
              onChange={(e) =>
                onMudar({ ...item, taxas: Number(e.target.value) || 0 })
              }
              className={inputClass}
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-right text-sm text-ink/60">
        Valor do item:{" "}
        <span className="font-bold text-primary-dark">{brl(valorDoItem(item))}</span>
      </p>

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  );
}

export function novoItem(): OrcamentoItem {
  return { id: novoId(), tipo: "padrao", descricao: "", tarifa: 0, taxas: 0, imagem: null };
}
