import { GState, jsPDF } from "jspdf";
import type { ConfigRecord } from "./config";
import type { Orcamento, OrcamentoItem } from "./types";

export type { Orcamento, OrcamentoItem };

export function novoNumeroOrcamento(): string {
  const ano = new Date().getFullYear();
  const suf = Math.floor(1000 + Math.random() * 9000);
  return `ORC-${ano}-${suf}`;
}

export function valorDoItem(item: OrcamentoItem): number {
  return (Number(item.tarifa) || 0) + (Number(item.taxas) || 0);
}

export function subtotal(itens: OrcamentoItem[]): number {
  return itens.reduce((soma, item) => soma + valorDoItem(item), 0);
}

export function valorTotal(itens: OrcamentoItem[], desconto = 0): number {
  return Math.max(0, subtotal(itens) - (Number(desconto) || 0));
}

export function totaisTarifas(itens: OrcamentoItem[]): number {
  return itens.reduce((soma, item) => soma + (Number(item.tarifa) || 0), 0);
}

export function totaisTaxas(itens: OrcamentoItem[]): number {
  return itens.reduce((soma, item) => soma + (Number(item.taxas) || 0), 0);
}

export function normalizarItens(dados: unknown): OrcamentoItem[] {
  if (!Array.isArray(dados)) return [];
  const saida: OrcamentoItem[] = [];
  for (const d of dados) {
    if (!d || typeof d !== "object") continue;
    const o = d as Record<string, unknown>;
    if (typeof o.descricao !== "string") continue;
    const legado = Number(o.valor) || 0;
    saida.push({
      id: typeof o.id === "string" ? o.id : `item-${saida.length + 1}`,
      tipo: o.tipo === "imagem" ? "imagem" : "padrao",
      descricao: o.descricao,
      tarifa: Number(o.tarifa) || legado,
      taxas: Number(o.taxas) || 0,
      imagem: typeof o.imagem === "string" ? o.imagem : null,
    });
  }
  return saida;
}

export function brl(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
}

function rgb(hex: string): [number, number, number] {
  const h = (hex ?? "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [30, 41, 59];
  const v = parseInt(h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function dataBr(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

async function carregarImagem(url: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!url) return null;
  try {
    const resp = await fetch(url, { mode: "cors" });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    const objUrl = URL.createObjectURL(blob);
    const img = new window.Image();
    img.src = objUrl;
    await img.decode();
    return img;
  } catch {
    return null;
  }
}

const LARGURA = 210;
const ALTURA = 297;
const MARGEM = 16;

function escalaParaCaixa(img: HTMLImageElement, maxW: number, maxH: number) {
  const ir = img.naturalWidth / img.naturalHeight;
  let w = maxW;
  let h = w / ir;
  if (h > maxH) {
    h = maxH;
    w = h * ir;
  }
  return { w, h };
}

export interface DadosPdf {
  orcamento: Orcamento;
  config: ConfigRecord;
}

export async function gerarPdf({ orcamento, config }: DadosPdf): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const primaria = rgb(config.cor_primaria || "#1e6fd9");
  const escura = rgb(config.cor_primaria_escura || "#0b2447");
  const destaque = rgb(config.cor_destaque || "#ff6b35");
  const texto = rgb(config.cor_texto || "#1e293b");
  const cinza: [number, number, number] = [100, 116, 139];

  const logo = await carregarImagem(config.logo_url);
  const imagensItems: Record<string, HTMLImageElement | null> = {};
  await Promise.all(
    orcamento.itens.map(async (item) => {
      imagensItems[item.id] = await carregarImagem(item.imagem);
    }),
  );

  const nomeSite = config.site_nome || "TehivaTour";
  const telefone = config.whatsapp || config.telefone || "";
  const email = config.email || "";
  const endereco = config.endereco || "";
  const totTarifas = totaisTarifas(orcamento.itens);
  const totTaxas = totaisTaxas(orcamento.itens);
  const desconto = Number(orcamento.desconto) || 0;
  const total = valorTotal(orcamento.itens, desconto);
  const validade = new Date();
  validade.setDate(validade.getDate() + (Number(orcamento.validade_dias) || 7));

  function rodape(numPagina: number, totalPaginas: number) {
    const yLinha = ALTURA - 16;
    doc.setDrawColor(...rgb("#cbd5e1"));
    doc.setLineWidth(0.3);
    doc.line(MARGEM, yLinha, LARGURA - MARGEM, yLinha);

    // Logo à esquerda
    let xContato = MARGEM;
    if (logo) {
      const tam = escalaParaCaixa(logo, 16, 7);
      doc.addImage(logo, "PNG", MARGEM, yLinha + 3, tam.w, tam.h);
      xContato += 20;
    }

    // Nome, endereço e contatos ao lado da logo
    const contato = [telefone && `WhatsApp: ${telefone}`, email && email]
      .filter(Boolean)
      .join("  •  ");
    const maxLargura = LARGURA - MARGEM - xContato - 34;
    let fy = yLinha + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...texto);
    doc.text(nomeSite, xContato, fy);
    fy += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...cinza);
    if (endereco) {
      const linhasEnd = doc.splitTextToSize(endereco, maxLargura);
      linhasEnd.forEach((l: string) => {
        doc.text(l, xContato, fy);
        fy += 4.5;
      });
    }
    if (contato) {
      const linhasContato = doc.splitTextToSize(contato, maxLargura);
      linhasContato.forEach((l: string) => {
        doc.text(l, xContato, fy);
        fy += 4.5;
      });
    }

    // Paginação e crédito à direita
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...cinza);
    doc.text(`Página ${numPagina} de ${totalPaginas}`, LARGURA - MARGEM, yLinha + 5, {
      align: "right",
    });
    if (config.credito_dev === "1" && config.credito_nome) {
      doc.text(`Desenvolvido por ${config.credito_nome}`, LARGURA - MARGEM, yLinha + 15, {
        align: "right",
      });
    }
  }

  function cabecalho() {
    // Faixa superior
    doc.setFillColor(...escura);
    doc.rect(0, 0, LARGURA, 44, "F");
    doc.setFillColor(...destaque);
    doc.rect(0, 44, LARGURA, 2.2, "F");

    // Logo ou nome
    if (logo) {
      const tam = escalaParaCaixa(logo, 72, 26);
      doc.addImage(logo, "PNG", MARGEM, 9, tam.w, tam.h);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...rgb("#ffffff"));
      doc.text(nomeSite, MARGEM, 20);
    }
    doc.setTextColor(...rgb("#ffffff"));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const contatos = [telefone && `WhatsApp: ${telefone}`, email].filter(Boolean).join("  •  ");
    if (contatos) doc.text(contatos, MARGEM, 38);

    // Título e metadados à direita
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ORÇAMENTO", LARGURA - MARGEM, 16, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Nº ${orcamento.numero}`, LARGURA - MARGEM, 25, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Emitido em ${dataBr(new Date())}`, LARGURA - MARGEM, 31, { align: "right" });
    doc.text(`Válido até ${dataBr(validade)}`, LARGURA - MARGEM, 36, { align: "right" });
  }

  function marcaDagua() {
    if (logo) {
      const tam = escalaParaCaixa(logo, 130, 130);
      doc.saveGraphicsState();
      doc.setGState(new GState({ opacity: 0.12 }));
      doc.addImage(logo, "PNG", (LARGURA - tam.w) / 2, (ALTURA - tam.h) / 2, tam.w, tam.h);
      doc.restoreGraphicsState();
    } else {
      doc.saveGraphicsState();
      doc.setGState(new GState({ opacity: 0.07 }));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(42);
      doc.setTextColor(...primaria);
      doc.text(nomeSite, LARGURA / 2, 150, { align: "center" });
      doc.restoreGraphicsState();
    }
  }

  function novaPagina() {
    doc.addPage();
    cabecalho();
    marcaDagua();
  }

  function desenharResumo(yInicio: number): number {
    const boxW = LARGURA - MARGEM * 2;
    const temDesconto = desconto > 0;
    const alt = temDesconto ? 46 : 38;

    doc.setFillColor(...rgb("#eef2f7"));
    doc.setDrawColor(...rgb("#cbd5e1"));
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGEM, yInicio, boxW, alt, 2, 2, "FD");

    const xEsq = MARGEM + 8;
    const xDir = LARGURA - MARGEM - 8;
    let yy = yInicio + 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...cinza);
    doc.text("Total tarifas", xEsq, yy);
    doc.text(brl(totTarifas), xDir, yy, { align: "right" });

    yy += 6;
    doc.text("Total taxas", xEsq, yy);
    doc.text(brl(totTaxas), xDir, yy, { align: "right" });

    if (temDesconto) {
      yy += 6;
      doc.setTextColor(...destaque);
      doc.text("Desconto", xEsq, yy);
      doc.text(`- ${brl(desconto)}`, xDir, yy, { align: "right" });
    }

    yy += 7;
    doc.setDrawColor(...rgb("#cbd5e1"));
    doc.setLineWidth(0.3);
    doc.line(MARGEM + 8, yy - 3, xDir, yy - 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...escura);
    doc.text("VALOR TOTAL", xEsq, yy + 3);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(brl(total), xDir, yy + 3, { align: "right" });

    return yInicio + alt + 8;
  }

  // Página inicial
  cabecalho();
  marcaDagua();

  let y = 58;

  // Bloco do cliente
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...cinza);
  doc.text("ORÇAMENTO PARA", MARGEM, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...texto);
  doc.text(orcamento.cliente_nome || "Cliente", MARGEM, y);
  y += 5.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...cinza);
  const clienteContato = [orcamento.cliente_email, orcamento.cliente_telefone]
    .filter(Boolean)
    .join("  •  ");
  if (clienteContato) doc.text(clienteContato, MARGEM, y);
  y += 8;

  // Resumo de valores no topo
  y = desenharResumo(y);

  // Lista de itens (imagem + descrição)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...texto);
  doc.text("Itens deste orçamento", MARGEM, y);
  y += 4;
  doc.setDrawColor(...rgb("#e2e8f0"));
  doc.setLineWidth(0.4);
  doc.line(MARGEM, y, LARGURA - MARGEM, y);
  y += 5;

  for (const item of orcamento.itens) {
    const img = imagensItems[item.id];
    const soImagem = item.tipo === "imagem";

    let alturaConteudo: number;
    let linhas: string[] = [];
    if (!soImagem) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      linhas = doc.splitTextToSize(item.descricao || "—", LARGURA - MARGEM * 2 - 34);
      alturaConteudo = Math.max(20, linhas.length * 4.6 + 4);
    } else {
      alturaConteudo = 90;
    }
    const alturaLinha = alturaConteudo + 6;

    if (y + alturaLinha > 250) {
      novaPagina();
      y = 58;
    }

    if (img) {
      const maxW = soImagem ? LARGURA - MARGEM * 2 : 26;
      const maxH = soImagem ? 90 : 20;
      const tam = escalaParaCaixa(img, maxW, maxH);
      const xImg = soImagem ? MARGEM + (maxW - tam.w) / 2 : MARGEM;
      doc.addImage(img, "PNG", xImg, y, tam.w, tam.h);
      doc.setDrawColor(...rgb("#cbd5e1"));
      doc.setLineWidth(0.3);
      doc.rect(xImg, y, tam.w, tam.h, "S");
    }

    if (!soImagem) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...texto);
      doc.text(linhas, MARGEM + 34, y + 5, {
        maxWidth: LARGURA - MARGEM * 2 - 34,
      });
    }

    y += alturaLinha;
    doc.setDrawColor(...rgb("#e2e8f0"));
    doc.setLineWidth(0.3);
    doc.line(MARGEM, y, LARGURA - MARGEM, y);
    y += 4;
  }

  if (orcamento.itens.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...cinza);
    doc.text("Nenhum item cadastrado.", MARGEM, y);
    y += 10;
  }

  y += 6;

  // Observações
  if (orcamento.observacoes.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...texto);
    doc.text("Observações", MARGEM, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...cinza);
    const obsLinhas = doc.splitTextToSize(orcamento.observacoes, LARGURA - MARGEM * 2);
    if (y + obsLinhas.length * 4.4 > ALTURA - 30) {
      novaPagina();
      y = 58;
    }
    doc.text(obsLinhas, MARGEM, y);
  }

  // Rodapés em todas as páginas
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    rodape(i, totalPaginas);
  }

  return doc.output("blob");
}
