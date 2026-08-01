"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ConfigRecord } from "@/lib/config";
import { btnPrimary, cardClass, inputClass, labelClass } from "./ui";

type Props = {
  config: ConfigRecord;
};

export function ConfiguracaoForm({ config }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErro("");
    setSalvo(false);
    const f = new FormData(event.currentTarget);

    const supabase = createClient();
    const linhas: { chave: string; valor: string }[] = [];
    for (const chave of Object.keys(config)) {
      linhas.push({ chave, valor: String(f.get(chave) ?? "") });
    }

    const { error } = await supabase.from("configuracoes").upsert(linhas);
    setPending(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setSalvo(true);
    router.refresh();
  }

  function campo(chave: string, rotulo: string, extra?: React.ReactNode) {
    return (
      <div>
        <label className={labelClass}>{rotulo}</label>
        <input name={chave} defaultValue={config[chave] ?? ""} className={inputClass} />
        {extra}
      </div>
    );
  }

  function cor(chave: string, rotulo: string) {
    return (
      <div>
        <label className={labelClass}>{rotulo}</label>
        <input
          name={chave}
          type="color"
          defaultValue={config[chave] ?? "#1e6fd9"}
          className="h-11 w-24 cursor-pointer rounded-xl border border-line bg-white p-1"
        />
      </div>
    );
  }

  function texto(chave: string, rotulo: string, rows = 3) {
    return (
      <div>
        <label className={labelClass}>{rotulo}</label>
        <textarea
          name={chave}
          rows={rows}
          defaultValue={config[chave] ?? ""}
          className={`${inputClass} resize-none`}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Identidade e contato</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("site_nome", "Nome do site")}
          {campo("whatsapp", "WhatsApp (DDI + número, ex: 5511999998888)")}
          {campo("email", "E-mail")}
          {campo("telefone", "Telefone")}
          {campo("endereco", "Endereço")}
          {campo("instagram", "Instagram (URL)")}
          {campo("facebook", "Facebook (URL)")}
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Cores do tema</h2>
        <div className="flex flex-wrap items-end gap-6">
          {cor("cor_primaria", "Primária")}
          {cor("cor_primaria_escura", "Primária escura")}
          {cor("cor_destaque", "Destaque")}
          {cor("cor_fundo", "Fundo")}
          {cor("cor_texto", "Texto")}
        </div>
        <p className="text-xs text-ink/50">
          As cores mudam no site inteiro assim que você salvar.
        </p>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Banner principal (Hero)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("hero_titulo_pt", "Título (PT)")}
          {campo("hero_titulo_en", "Título (EN)")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {texto("hero_subtitulo_pt", "Subtítulo (PT)")}
          {texto("hero_subtitulo_en", "Subtítulo (EN)")}
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Seção Sobre</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("sobre_titulo_pt", "Título (PT)")}
          {campo("sobre_titulo_en", "Título (EN)")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {texto("sobre_texto_pt", "Texto (PT)", 4)}
          {texto("sobre_texto_en", "Texto (EN)", 4)}
        </div>
      </div>

      {erro && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={btnPrimary}>
          <Save size={16} />
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
        {salvo && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Check size={16} />
            Salvo com sucesso!
          </span>
        )}
      </div>
    </form>
  );
}
