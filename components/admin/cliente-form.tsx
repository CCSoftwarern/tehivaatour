"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cpfValido, mascararCep, mascararCpf, mascararTelefone, somenteDigitos } from "@/lib/cliente";
import type { Cliente } from "@/lib/types";
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from "./ui";

type Props = {
  lang: string;
  cliente?: Cliente | null;
};

const ESTADOS_CIVIS = [
  "Solteiro(a)",
  "Casado(a)",
  "União estável",
  "Divorciado(a)",
  "Viúvo(a)",
  "Outro",
];

export function ClienteForm({ lang, cliente }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const f = new FormData(event.currentTarget);
    const cpf = somenteDigitos(String(f.get("cpf") ?? ""));
    if (cpf && !cpfValido(cpf)) {
      setErro("CPF inválido. Confira os 11 dígitos.");
      return;
    }

    const dados = {
      nome: String(f.get("nome") ?? "").trim(),
      cpf: cpf || null,
      rg: String(f.get("rg") ?? "").trim() || null,
      passaporte: String(f.get("passaporte") ?? "").trim() || null,
      email: String(f.get("email") ?? "").trim() || null,
      telefone: somenteDigitos(String(f.get("telefone") ?? "")) || null,
      data_nascimento: String(f.get("data_nascimento") ?? "") || null,
      nacionalidade: String(f.get("nacionalidade") ?? "").trim() || null,
      estado_civil: String(f.get("estado_civil") ?? "") || null,
      profissao: String(f.get("profissao") ?? "").trim() || null,
      endereco: String(f.get("endereco") ?? "").trim() || null,
      numero: String(f.get("numero") ?? "").trim() || null,
      complemento: String(f.get("complemento") ?? "").trim() || null,
      bairro: String(f.get("bairro") ?? "").trim() || null,
      cidade: String(f.get("cidade") ?? "").trim() || null,
      uf: String(f.get("uf") ?? "").trim().toUpperCase() || null,
      cep: somenteDigitos(String(f.get("cep") ?? "")) || null,
      observacoes: String(f.get("observacoes") ?? "").trim() || null,
      ativo: f.get("ativo") === "on",
    };

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = cliente
        ? await supabase.from("clientes").update(dados).eq("id", cliente.id)
        : await supabase.from("clientes").insert(dados);
      if (error) {
        setErro(error.message);
        setPending(false);
        return;
      }
      setPending(false);
      router.push(`/${lang}/admin/clientes`);
      router.refresh();
    } catch {
      setErro("Erro inesperado ao salvar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Dados pessoais</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome completo *</label>
            <input
              name="nome"
              required
              defaultValue={cliente?.nome ?? ""}
              className={inputClass}
              placeholder="Ex: Maria Silva"
            />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input
              name="cpf"
              inputMode="numeric"
              defaultValue={mascararCpf(cliente?.cpf)}
              onChange={(e) => {
                e.currentTarget.value = mascararCpf(e.currentTarget.value);
              }}
              className={inputClass}
              placeholder="000.000.000-00"
            />
          </div>
          <div>
            <label className={labelClass}>Data de nascimento</label>
            <input
              name="data_nascimento"
              type="date"
              defaultValue={cliente?.data_nascimento ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>RG</label>
            <input
              name="rg"
              defaultValue={cliente?.rg ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Passaporte</label>
            <input
              name="passaporte"
              defaultValue={cliente?.passaporte ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nacionalidade</label>
            <input
              name="nacionalidade"
              defaultValue={cliente?.nacionalidade ?? "Brasileira"}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estado civil</label>
            <select
              name="estado_civil"
              defaultValue={cliente?.estado_civil ?? ""}
              className={inputClass}
            >
              <option value="">— Selecione —</option>
              {ESTADOS_CIVIS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Profissão</label>
            <input
              name="profissao"
              defaultValue={cliente?.profissao ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Contato</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              name="email"
              type="email"
              defaultValue={cliente?.email ?? ""}
              className={inputClass}
              placeholder="cliente@email.com"
            />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input
              name="telefone"
              inputMode="numeric"
              defaultValue={mascararTelefone(cliente?.telefone)}
              onChange={(e) => {
                e.currentTarget.value = mascararTelefone(e.currentTarget.value);
              }}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Endereço</h2>
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label className={labelClass}>Logradouro</label>
            <input
              name="endereco"
              defaultValue={cliente?.endereco ?? ""}
              className={inputClass}
              placeholder="Rua, avenida..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Número</label>
            <input name="numero" defaultValue={cliente?.numero ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Complemento</label>
            <input
              name="complemento"
              defaultValue={cliente?.complemento ?? ""}
              className={inputClass}
              placeholder="Apto, bloco..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Bairro</label>
            <input name="bairro" defaultValue={cliente?.bairro ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-1">
            <label className={labelClass}>UF</label>
            <input
              name="uf"
              maxLength={2}
              defaultValue={cliente?.uf ?? ""}
              onChange={(e) => {
                e.currentTarget.value = e.currentTarget.value.toUpperCase();
              }}
              className={inputClass}
              placeholder="SP"
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelClass}>CEP</label>
            <input
              name="cep"
              inputMode="numeric"
              defaultValue={mascararCep(cliente?.cep)}
              onChange={(e) => {
                e.currentTarget.value = mascararCep(e.currentTarget.value);
              }}
              className={inputClass}
              placeholder="00000-000"
            />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>Cidade</label>
            <input name="cidade" defaultValue={cliente?.cidade ?? ""} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Observações</h2>
        <textarea
          name="observacoes"
          rows={4}
          defaultValue={cliente?.observacoes ?? ""}
          className={`${inputClass} resize-none`}
          placeholder="Preferências, documento vencido, contatos de emergência..."
        />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={cliente?.ativo ?? true}
            className="h-4 w-4 accent-[var(--cor-primaria)]"
          />
          Ativo (disponível para novas vendas)
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
        <a href={`/${lang}/admin/clientes`} className={btnSecondary}>
          Cancelar
        </a>
      </div>
    </form>
  );
}
