import { arredondar } from "./moeda";
import type {
  Comissao,
  Entrada,
  PapelComissao,
  StatusVenda,
  TipoProdutoOrcamento,
  Venda,
  VendaItem,
} from "./types";

export const FORMAS_PAGAMENTO = [
  "Dinheiro",
  "Pix",
  "Boleto",
  "Transferência",
  "Cartão de crédito",
  "Cartão de débito",
  "Cheque",
  "Parcelado",
  "Outro",
];

export const TIPOS_PRODUTO: { valor: TipoProdutoOrcamento; rotulo: string }[] = [
  { valor: "aereo", rotulo: "Aéreo" },
  { valor: "aereo_hotel", rotulo: "Aéreo + Hotel" },
  { valor: "navio", rotulo: "Navio / Cruzeiro" },
  { valor: "seguro_viagem", rotulo: "Seguro Viagem" },
  { valor: "receptivo", rotulo: "Receptivo / Transfer" },
  { valor: "somente_aereo", rotulo: "Somente Aéreo" },
];

export const PAPEIS_COMISSAO: { valor: PapelComissao; rotulo: string }[] = [
  { valor: "vendedor", rotulo: "Vendedor" },
  { valor: "supervisor", rotulo: "Supervisor" },
  { valor: "agencia", rotulo: "Agência" },
  { valor: "indicacao", rotulo: "Indicação" },
];

export const STATUS_VENDA: { valor: StatusVenda; rotulo: string }[] = [
  { valor: "aberta", rotulo: "Aberta" },
  { valor: "parcial", rotulo: "Parcial" },
  { valor: "paga", rotulo: "Paga" },
  { valor: "cancelada", rotulo: "Cancelada" },
];

export function rotuloStatus(status: StatusVenda): string {
  return STATUS_VENDA.find((s) => s.valor === status)?.rotulo ?? status;
}

export function novoNumeroVenda(): string {
  const ano = new Date().getFullYear();
  const suf = Math.floor(1000 + Math.random() * 9000);
  return `VEN-${ano}-${suf}`;
}

/** Percentual aplicado sobre a tarifa: percentual = 10 => +10% na base. */
export function valorPercentual(base: number, percentual: number): number {
  return arredondar((Number(base) || 0) * (Number(percentual) || 0) / 100);
}

/**
 * Ordem do cálculo: tarifa + percentual − desconto − abatimento + taxas.
 * O percentual entra como acréscimo sobre a tarifa; taxas entram por último.
 */
export function valorDoItem(item: VendaItem): number {
  const tarifa = Number(item.tarifa) || 0;
  const base = tarifa + valorPercentual(tarifa, item.percentual);
  return arredondar(base - (Number(item.desconto) || 0) - (Number(item.abatimento) || 0) + (Number(item.taxas) || 0));
}

export function totalTarifas(itens: VendaItem[]): number {
  return arredondar(itens.reduce((soma, item) => soma + (Number(item.tarifa) || 0), 0));
}

export function totalTaxas(itens: VendaItem[]): number {
  return arredondar(itens.reduce((soma, item) => soma + (Number(item.taxas) || 0), 0));
}

export function totalDescontos(itens: VendaItem[]): number {
  return arredondar(itens.reduce((soma, item) => soma + (Number(item.desconto) || 0), 0));
}

export function totalAbatimentos(itens: VendaItem[]): number {
  return arredondar(itens.reduce((soma, item) => soma + (Number(item.abatimento) || 0), 0));
}

export function totalPercentuais(itens: VendaItem[]): number {
  return arredondar(
    itens.reduce((soma, item) => soma + valorPercentual(item.tarifa, item.percentual), 0),
  );
}

/** Total líquido da venda (nunca negativo). */
export function totalVenda(itens: VendaItem[]): number {
  return arredondar(Math.max(0, itens.reduce((soma, item) => soma + valorDoItem(item), 0)));
}

export function totalComissoes(itens: VendaItem[], comissoes: Comissao[]): number {
  const total = totalVenda(itens);
  return arredondar(
    comissoes.reduce((soma, c) => soma + (total * (Number(c.percentual) || 0)) / 100, 0),
  );
}

export function valorComissao(comissao: Comissao, total: number): number {
  return arredondar((total * (Number(comissao.percentual) || 0)) / 100);
}

export function somaPercentuaisComissao(comissoes: Comissao[]): number {
  return arredondar(
    comissoes.reduce((soma, c) => soma + (Number(c.percentual) || 0), 0),
  );
}

export function saldoVenda(itens: VendaItem[], valorPago: number): number {
  return arredondar(totalVenda(itens) - (Number(valorPago) || 0));
}

/** Total recebido da venda: soma das entradas (fonte da verdade). */
export function totalRecebido(entradas: Entrada[]): number {
  return arredondar(entradas.reduce((soma, e) => soma + (Number(e.valor) || 0), 0));
}

export function statusSugerido(itens: VendaItem[], totalPago: number): StatusVenda {
  const total = totalVenda(itens);
  const pago = Number(totalPago) || 0;
  if (pago <= 0) return "aberta";
  if (pago + 0.009 >= total) return "paga";
  return "parcial";
}

export function normalizarVendaItens(dados: unknown): VendaItem[] {
  if (!Array.isArray(dados)) return [];
  const saida: VendaItem[] = [];
  for (const d of dados) {
    if (!d || typeof d !== "object") continue;
    const o = d as Record<string, unknown>;
    if (typeof o.descricao !== "string" && typeof o.tarifa !== "number") continue;
    saida.push({
      id: typeof o.id === "string" ? o.id : `item-${saida.length + 1}`,
      tipo: o.tipo === "imagem" ? "imagem" : "padrao",
      ...(TIPOS_PRODUTO.some((t) => t.valor === o.tipoProduto)
        ? { tipoProduto: o.tipoProduto as TipoProdutoOrcamento }
        : {}),
      descricao: typeof o.descricao === "string" ? o.descricao : "",
      tarifa: Number(o.tarifa) || 0,
      taxas: Number(o.taxas) || 0,
      desconto: Number(o.desconto) || 0,
      abatimento: Number(o.abatimento) || 0,
      percentual: Number(o.percentual) || 0,
      imagem: typeof o.imagem === "string" ? o.imagem : null,
    });
  }
  return saida;
}

export function normalizarComissoes(dados: unknown): Comissao[] {
  if (!Array.isArray(dados)) return [];
  const saida: Comissao[] = [];
  for (const d of dados) {
    if (!d || typeof d !== "object") continue;
    const o = d as Record<string, unknown>;
    if (typeof o.pessoa !== "string" && typeof o.percentual !== "number") continue;
    saida.push({
      id: typeof o.id === "string" ? o.id : `com-${saida.length + 1}`,
      pessoa: typeof o.pessoa === "string" ? o.pessoa : "",
      papel: PAPEIS_COMISSAO.some((p) => p.valor === o.papel)
        ? (o.papel as PapelComissao)
        : "vendedor",
      percentual: Number(o.percentual) || 0,
    });
  }
  return saida;
}

export function normalizarEntrada(registro: Partial<Entrada> | null | undefined): Entrada {
  return {
    id: registro?.id ?? "",
    venda_id: registro?.venda_id ?? "",
    valor: Number(registro?.valor) || 0,
    data: registro?.data ?? null,
    conta_id: registro?.conta_id ?? null,
    forma_pagamento: registro?.forma_pagamento ?? null,
    observacoes: registro?.observacoes ?? null,
    created_at: registro?.created_at ?? new Date().toISOString(),
  };
}

export function normalizarVenda(registro: Partial<Venda> | null | undefined): Venda {
  return {
    id: registro?.id ?? "",
    numero: registro?.numero ?? "",
    cliente_id: registro?.cliente_id ?? null,
    orcamento_id: registro?.orcamento_id ?? null,
    status: registro?.status ?? "aberta",
    pacote_id: registro?.pacote_id ?? null,
    pacote_nome: registro?.pacote_nome ?? null,
    destino: registro?.destino ?? null,
    data_venda: registro?.data_venda ?? null,
    data_viagem: registro?.data_viagem ?? null,
    data_retorno: registro?.data_retorno ?? null,
    quantidade_pax: Number(registro?.quantidade_pax) || 1,
    itens: normalizarVendaItens(registro?.itens),
    comissoes: normalizarComissoes(registro?.comissoes),
    valor_pago: Number(registro?.valor_pago) || 0,
    forma_pagamento: registro?.forma_pagamento ?? null,
    observacoes: registro?.observacoes ?? "",
    created_at: registro?.created_at ?? new Date().toISOString(),
    updated_at: registro?.updated_at ?? new Date().toISOString(),
  };
}
