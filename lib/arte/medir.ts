let ctx: CanvasRenderingContext2D | null = null;

function getCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!ctx) {
    ctx = document.createElement("canvas").getContext("2d");
  }
  return ctx;
}

function quebrarLinhas(
  texto: string,
  fonte: string,
  tamanho: number,
  largura: number,
): string[] {
  const c = getCtx();
  const linhas: string[] = [];
  const palavras = texto.split(/\s+/);
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    let w = teste.length;
    if (c) {
      c.font = `${tamanho}px ${fonte}`;
      w = c.measureText(teste).width;
    }
    if (w <= largura || !atual) {
      atual = teste;
    } else {
      linhas.push(atual);
      atual = p;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export function medirAlturaTexto(
  texto: string,
  fonte: string,
  tamanho: number,
  largura: number,
  lineHeight: number,
): number {
  const linhas = quebrarLinhas(texto, fonte, tamanho, largura);
  return Math.max(1, linhas.length) * tamanho * (lineHeight || 1.2);
}
