"use client";

import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import { mascararCpf, mascararTelefone } from "@/lib/cliente";
import type { Cliente } from "@/lib/types";
import { inputClass, labelClass } from "../ui";

type Props = {
  lang: string;
  clientes: Cliente[];
  value: string;
  onChange: (id: string) => void;
};

export function ClienteVendaSelect({ lang, clientes, value, onChange }: Props) {
  const selecionado = clientes.find((c) => c.id === value);
  const contato = selecionado
    ? [selecionado.email, mascararTelefone(selecionado.telefone)].filter(Boolean).join(" · ")
    : "";

  return (
    <div>
      <label className={labelClass}>Cliente cadastrado</label>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} sm:max-w-md`}
        >
          <option value="">— Selecione um cliente —</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
              {c.cpf ? ` — ${mascararCpf(c.cpf)}` : ""}
            </option>
          ))}
        </select>
        {selecionado ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-ink/50">
            <Users size={15} />
            {contato || "Sem contato cadastrado"}
          </span>
        ) : (
          <Link
            href={`/${lang}/admin/clientes/novo`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <UserPlus size={15} />
            Cadastrar novo cliente
          </Link>
        )}
      </div>
    </div>
  );
}
