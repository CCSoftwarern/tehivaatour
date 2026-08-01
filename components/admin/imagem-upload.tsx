"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  pasta?: string;
};

export function ImageUpload({ value, onChange, pasta = "imagens" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleFile(file: File) {
    setErro("");
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const caminho = `${pasta}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("imagens")
        .upload(caminho, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("imagens").getPublicUrl(caminho);
      onChange(data.publicUrl);
    } catch (e) {
      setErro(
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : "Falha no upload. Verifique se o bucket 'imagens' existe.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-line">
            <Image
              src={value}
              alt="Imagem"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="grid h-28 w-40 shrink-0 place-items-center rounded-xl border-2 border-dashed border-line bg-surface text-ink/40 hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus size={22} />
          </button>
        )}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/70 hover:border-primary hover:text-primary disabled:opacity-60 transition-colors"
          >
            {uploading && <Loader2 size={14} className="animate-spin" />}
            {uploading ? "Enviando..." : "Enviar imagem"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
              Remover
            </button>
          )}
        </div>
      </div>
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
