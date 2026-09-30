"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Conta, TipoConta } from "@/lib/types";
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from "./ui";

type Props = {
  lang: string;
  conta?: Conta | null;
};

const TIPOS: { valor: TipoConta; rotulo: string }[] = [
  { valor: "corrente", rotulo: "Conta corrente" },
  { valor: "poupanca", rotulo: "Poupança" },
];

export function ContaForm({ lang, conta }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const f = new FormData(event.currentTarget);
    const dados = {
      nome: String(f.get("nome") ?? "").trim(),
      banco: String(f.get("banco") ?? "").trim() || null,
      agencia: String(f.get("agencia") ?? "").trim() || null,
      numero: String(f.get("numero") ?? "").trim() || null,
      tipo: (String(f.get("tipo") ?? "corrente") || "corrente") as TipoConta,
      titular: String(f.get("titular") ?? "").trim() || null,
      ativa: f.get("ativa") === "on",
      observacoes: String(f.get("observacoes") ?? "").trim() || null,
    };

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = conta
        ? await supabase.from("contas").update(dados).eq("id", conta.id)
        : await supabase.from("contas").insert(dados);
      if (error) {
        setErro(error.message);
        setPending(false);
        return;
      }
      setPending(false);
      router.push(`/${lang}/admin/contas`);
      router.refresh();
    } catch {
      setErro("Erro inesperado ao salvar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Conta</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome da conta *</label>
            <input
              name="nome"
              required
              defaultValue={conta?.nome ?? ""}
              className={inputClass}
              placeholder="Ex: Itaú — Conta Corrente da Agência"
            />
          </div>
          <div>
            <label className={labelClass}>Banco</label>
            <input
              name="banco"
              defaultValue={conta?.banco ?? ""}
              className={inputClass}
              placeholder="Ex: Itaú, Bradesco, Nubank"
            />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select name="tipo" defaultValue={conta?.tipo ?? "corrente"} className={inputClass}>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Agência</label>
            <input name="agencia" defaultValue={conta?.agencia ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Número da conta</label>
            <input name="numero" defaultValue={conta?.numero ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Titular</label>
            <input
              name="titular"
              defaultValue={conta?.titular ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Observações</h2>
        <textarea
          name="observacoes"
          rows={3}
          defaultValue={conta?.observacoes ?? ""}
          className={`${inputClass} resize-none`}
          placeholder="Chave pix, finalidade, observações internas..."
        />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="ativa"
            defaultChecked={conta?.ativa ?? true}
            className="h-4 w-4 accent-[var(--cor-primaria)]"
          />
          Ativa (aparece nas entradas)
        </label>
      </div>

      {erro && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={btnPrimary}>
          <Save size={16} />
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <a href={`/${lang}/admin/contas`} className={btnSecondary}>
          Cancelar
        </a>
      </div>
    </form>
  );
}
