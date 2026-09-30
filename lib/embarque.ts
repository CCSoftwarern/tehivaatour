import { resumirVendas } from "./relatorio";
import type { Entrada, Venda } from "./types";

export interface PassageiroEmbarque {
  venda: Venda;
  total: number;
  recebido: number;
  saldo: number;
  cliente: string;
  telefone: string;
}

export interface GrupoEmbarque {
  data: string;
  pax: number;
  vendas: number;
  total: number;
  saldo: number;
  passageiros: PassageiroEmbarque[];
}

/** 'YYYY-MM-DD' como data local, sem a ambiguidade de fuso do new Date(string). */
export function paraData(valor: string): Date {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, (mes || 1) - 1, dia || 1);
}

export function hojeIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function diasAte(data: string, de = hojeIso()): number {
  const ms = paraData(data).getTime() - paraData(de).getTime();
  return Math.round(ms / 86400000);
}

export function rotuloEmbarque(data: string): string {
  const d = paraData(data);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

export function formatarTelefone(valor: string | null | undefined): string {
  if (!valor) return "";
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return valor;
}

/**
 * Agrupa as vendas por data de viagem. Vendas canceladas e as que ainda não têm
 * data de viagem ficam de fora do agrupamento — as duas situações são devolvidas
 * à parte para a tela avisar o operador.
 */
export function agruparEmbarques(
  vendas: Venda[],
  entradas: Entrada[],
  clientes: Map<string, { nome: string; telefone: string | null }>,
): { grupos: GrupoEmbarque[]; canceladas: Venda[]; semData: Venda[] } {
  const porData = new Map<string, Venda[]>();

  for (const venda of vendas) {
    if (venda.status === "cancelada") continue;
    if (!venda.data_viagem) continue;
    const lista = porData.get(venda.data_viagem);
    if (lista) lista.push(venda);
    else porData.set(venda.data_viagem, [venda]);
  }

  const grupos: GrupoEmbarque[] = [...porData.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, lista]) => {
      const resumos = resumirVendas(lista, entradas);
      return {
        data,
        pax: lista.reduce((s, v) => s + (v.quantidade_pax || 0), 0),
        vendas: lista.length,
        total: resumos.reduce((s, r) => s + r.total, 0),
        saldo: resumos.reduce((s, r) => s + r.saldo, 0),
        passageiros: resumos
          .map(({ venda, total, recebido, saldo }) => {
            const cliente = venda.cliente_id ? clientes.get(venda.cliente_id) : undefined;
            return {
              venda,
              total,
              recebido,
              saldo,
              cliente: cliente?.nome ?? "Sem cliente",
              telefone: formatarTelefone(cliente?.telefone),
            };
          })
          .sort((a, b) => a.cliente.localeCompare(b.cliente, "pt-BR")),
      };
    });

  return {
    grupos,
    canceladas: vendas.filter((v) => v.status === "cancelada"),
    semData: vendas.filter((v) => v.status !== "cancelada" && !v.data_viagem),
  };
}

export function proximosEmbarques(
  vendas: Venda[],
  entradas: Entrada[],
  clientes: Map<string, { nome: string; telefone: string | null }>,
  limite = 5,
): GrupoEmbarque[] {
  return agruparEmbarques(vendas, entradas, clientes).grupos
    .filter((g) => diasAte(g.data) >= 0)
    .slice(0, limite);
}