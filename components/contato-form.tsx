"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  dict: Dictionary;
};

export function ContatoForm({ dict }: Props) {
  const [status, setStatus] = useState<"idle" | "enviando" | "sucesso" | "erro">(
    "idle",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("enviando");
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("contatos").insert({
        nome: String(formData.get("nome") ?? ""),
        email: String(formData.get("email") ?? ""),
        telefone: String(formData.get("telefone") ?? "") || null,
        mensagem: String(formData.get("mensagem") ?? ""),
      });
      if (error) {
        setStatus("erro");
        return;
      }
      form.reset();
      setStatus("sucesso");
    } catch {
      setStatus("erro");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-ink/40";

  return (
    <div>
      {status === "sucesso" ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 font-semibold text-green-700">{dict.contato.sucesso}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-medium">
              {dict.contato.nome} *
            </label>
            <input
              id="nome"
              name="nome"
              required
              placeholder={dict.contato.nome_placeholder}
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                {dict.contato.email} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={dict.contato.email_placeholder}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="telefone" className="mb-1.5 block text-sm font-medium">
                {dict.contato.telefone}
              </label>
              <input
                id="telefone"
                name="telefone"
                placeholder={dict.contato.telefone_placeholder}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="mensagem" className="mb-1.5 block text-sm font-medium">
              {dict.contato.mensagem} *
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              required
              rows={5}
              placeholder={dict.contato.mensagem_placeholder}
              className={`${inputClass} resize-none`}
            />
          </div>
          <button
            type="submit"
            disabled={status === "enviando"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors"
          >
            <Send size={16} />
            {status === "enviando" ? dict.contato.enviando : dict.contato.enviar}
          </button>
          {status === "erro" && (
            <p className="text-sm text-red-600">{dict.contato.erro}</p>
          )}
        </form>
      )}
    </div>
  );
}
