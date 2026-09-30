"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import type { Cliente } from "@/lib/types";
import { STATUS_VENDA } from "@/lib/venda";
import { btnSecondary, inputClass, labelClass } from "../ui";

type Props = {
  lang: string;
  clientes: Cliente[];
};

type Estado = {
  q: string;
  status: string;
  cliente: string;
  campo: string;
  de: string;
  ate: string;
};

const CAMPOS_DATA = [
  { valor: "viagem", rotulo: "Data da viagem" },
  { valor: "venda", rotulo: "Data da venda" },
];

export function VendaFiltros({ lang, clientes }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(() => params.get("q") ?? "");
  const [status, setStatus] = useState(() => params.get("status") ?? "");
  const [cliente, setCliente] = useState(() => params.get("cliente") ?? "");
  const [campo, setCampo] = useState(() => params.get("campo") ?? "viagem");
  const [de, setDe] = useState(() => params.get("de") ?? "");
  const [ate, setAte] = useState(() => params.get("ate") ?? "");

  const temFiltro = Boolean(
    params.get("q") ||
      params.get("status") ||
      params.get("cliente") ||
      params.get("de") ||
      params.get("ate"),
  );

  function navegar(query: URLSearchParams) {
    const busca = query.toString();
    router.push(busca ? `/${lang}/admin/vendas?${busca}` : `/${lang}/admin/vendas`);
    router.refresh();
  }

  function montar(overrides: Partial<Estado> = {}): URLSearchParams {
    const atual: Estado = { q, status, cliente, campo, de, ate, ...overrides };
    const novo = new URLSearchParams();
    if (atual.q.trim()) novo.set("q", atual.q.trim());
    if (atual.status) novo.set("status", atual.status);
    if (atual.cliente) novo.set("cliente", atual.cliente);
    if (atual.de) novo.set("de", atual.de);
    if (atual.ate) novo.set("ate", atual.ate);
    if (atual.campo !== "viagem") novo.set("campo", atual.campo);
    return novo;
  }

  function aplicar(overrides: Partial<Estado> = {}) {
    navegar(montar(overrides));
  }

  function limpar() {
    setQ("");
    setStatus("");
    setCliente("");
    setDe("");
    setAte("");
    navegar(new URLSearchParams());
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className={labelClass}>Buscar</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                aplicar();
              }
            }}
            className={inputClass}
            placeholder="Nº da venda, cliente, pacote, destino..."
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => {
              const valor = e.target.value;
              setStatus(valor);
              aplicar({ status: valor });
            }}
            className={inputClass}
          >
            <option value="">Todos</option>
            {STATUS_VENDA.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Cliente</label>
          <select
            value={cliente}
            onChange={(e) => {
              const valor = e.target.value;
              setCliente(valor);
              aplicar({ cliente: valor });
            }}
            className={inputClass}
          >
            <option value="">Todos</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Período</label>
          <select value={campo} onChange={(e) => setCampo(e.target.value)} className={inputClass}>
            {CAMPOS_DATA.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>De</label>
            <input
              type="date"
              value={de}
              onChange={(e) => {
                const valor = e.target.value;
                setDe(valor);
                aplicar({ de: valor });
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Até</label>
            <input
              type="date"
              value={ate}
              onChange={(e) => {
                const valor = e.target.value;
                setAte(valor);
                aplicar({ ate: valor });
              }}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => aplicar()} className={btnSecondary}>
          <Filter size={16} />
          Filtrar
        </button>
        {temFiltro && (
          <button
            type="button"
            onClick={limpar}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink/70 hover:bg-surface"
          >
            <X size={16} />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
