import { arredondar } from "./moeda";
import { totalVenda, valorComissao } from "./venda";
import type { Comissao, Entrada, Venda } from "./types";

export interface ResumoVenda {
  venda: Venda;
  total: number;
  recebido: number;
  saldo: number;
}

export interface LinhaComissao {
  pessoa: string;
  papel: string;
  percentual: number;
  valor: number;
  vendas: number;
}

export interface LinhaConta {
  contaId: string | null;
  nome: string;
  valor: number;
  entradas: number;
}

export function resumirVendas(
  vendas: Venda[],
  entradas: Entrada[],
): ResumoVenda[] {
  const porVenda = new Map<string, Entrada[]>();
  for (const e of entradas) {
    const lista = porVenda.get(e.venda_id);
    if (lista) lista.push(e);
    else porVenda.set(e.venda_id, [e]);
  }
  return vendas.map((venda) => {
    const lista = porVenda.get(venda.id) ?? [];
    const total = totalVenda(venda.itens);
    const recebido = arredondar(lista.reduce((soma, e) => soma + (Number(e.valor) || 0), 0));
    return { venda, total, recebido, saldo: arredondar(total - recebido) };
  });
}

export interface TotaisRelatorio {
  vendas: number;
  passages: number;
  vendido: number;
  recebido: number;
  saldo: number;
  ticketMedio: number;
  comissaoTotal: number;
}

/** Vendas canceladas ficam fora de vendido/recebido, mas o saldo nunca fica negativo. */
export function totaisRelatorio(resumos: ResumoVenda[], comissoesAtivas: boolean): TotaisRelatorio {
  const validas = comissoesAtivas ? resumos.filter((r) => r.venda.status !== "cancelada") : resumos;
  const vendido = arredondar(validas.reduce((s, r) => s + r.total, 0));
  const recebido = arredondar(validas.reduce((s, r) => s + r.recebido, 0));
  const comissaoTotal = arredondar(
    validas.reduce(
      (soma, r) =>
        soma + r.venda.comissoes.reduce((s, c) => s + valorComissao(c, r.total), 0),
      0,
    ),
  );
  return {
    vendas: validas.length,
    passages: validas.reduce((s, r) => s + (r.venda.quantidade_pax || 0), 0),
    vendido,
    recebido,
    saldo: arredondar(vendido - recebido),
    ticketMedio: validas.length ? arredondar(vendido / validas.length) : 0,
    comissaoTotal,
  };
}

/** Agrupa comissões por responsável, mantendo a maior participação como linha principal. */
export function comissoesPorPessoa(resumos: ResumoVenda[]): LinhaComissao[] {
  const mapa = new Map<string, LinhaComissao>();
  for (const { venda, total } of resumos) {
    if (venda.status === "cancelada") continue;
    for (const comissao of venda.comissoes) {
      const chave = `${comissao.pessoa.trim().toLowerCase()}|${comissao.papel}`;
      const existente = mapa.get(chave);
      const valor = valorComissao(comissao, total);
      if (existente) {
        existente.valor = arredondar(existente.valor + valor);
        existente.vendas += 1;
      } else {
        mapa.set(chave, {
          pessoa: comissao.pessoa.trim() || "(sem nome)",
          papel: comissao.papel,
          percentual: Number(comissao.percentual) || 0,
          valor,
          vendas: 1,
        });
      }
    }
  }
  return [...mapa.values()].sort((a, b) => b.valor - a.valor);
}

/** Entradas agrupadas pela conta que recebeu. */
export function entradasPorConta(entradas: Entrada[], contas: { id: string; nome: string }[]): LinhaConta[] {
  const nomes = new Map(contas.map((c) => [c.id, c.nome]));
  const mapa = new Map<string, LinhaConta>();
  for (const e of entradas) {
    const chave = e.conta_id ?? "";
    const existente = mapa.get(chave);
    const valor = Number(e.valor) || 0;
    if (existente) {
      existente.valor = arredondar(existente.valor + valor);
      existente.entradas += 1;
    } else {
      mapa.set(chave, {
        contaId: e.conta_id,
        nome: e.conta_id ? nomes.get(e.conta_id) ?? "Conta removida" : "Sem conta",
        valor,
        entradas: 1,
      });
    }
  }
  return [...mapa.values()].sort((a, b) => b.valor - a.valor);
}

export function comissaoPrincipal(comissoes: Comissao[]): Comissao | null {
  if (comissoes.length === 0) return null;
  return comissoes.reduce((maior, atual) =>
    (Number(atual.percentual) || 0) > (Number(maior.percentual) || 0) ? atual : maior,
  );
}

function celula(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

function numero(valor: number): string {
  return String(valor).replace(".", ",");
}

/** CSV com separador ";" e BOM, que abre direto no Excel em pt-BR. */
export function vendasParaCsv(resumos: ResumoVenda[], nomes: Map<string, string>): string {
  const cabecalho = [
    "Venda",
    "Status",
    "Data da venda",
    "Data da viagem",
    "Cliente",
    "Pacote",
    "Destino",
    "Passageiros",
    "Total",
    "Recebido",
    "Saldo",
    "Comissão principal",
    "Pessoa",
    "Percentual",
    "Valor comissão",
  ];
  const linhas = resumos.map(({ venda, total, recebido, saldo }) => {
    const principal = comissaoPrincipal(venda.comissoes);
    const comissaoValor = principal ? valorComissao(principal, total) : 0;
    return [
      venda.numero,
      venda.status,
      venda.data_venda ?? "",
      venda.data_viagem ?? "",
      venda.cliente_id ? nomes.get(venda.cliente_id) ?? "" : "",
      venda.pacote_nome ?? "",
      venda.destino ?? "",
      venda.quantidade_pax,
      numero(total),
      numero(recebido),
      numero(saldo),
      principal?.papel ?? "",
      principal?.pessoa ?? "",
      principal ? `${numero(Number(principal.percentual) || 0)}%` : "",
      numero(comissaoValor),
    ]
      .map(celula)
      .join(";");
  });
  return `﻿${[cabecalho.map(celula).join(";"), ...linhas].join("\r\n")}`;
}

export function entradasParaCsv(entradas: Entrada[], contas: Map<string, string>): string {
  const cabecalho = ["Data", "Venda", "Conta", "Forma de pagamento", "Valor", "Observações"];
  const linhas = entradas.map((e) =>
    [
      e.data ?? "",
      e.venda_id,
      e.conta_id ? contas.get(e.conta_id) ?? "" : "Sem conta",
      e.forma_pagamento ?? "",
      numero(Number(e.valor) || 0),
      e.observacoes ?? "",
    ]
      .map(celula)
      .join(";"),
  );
  return `﻿${[cabecalho.map(celula).join(";"), ...linhas].join("\r\n")}`;
}
