export function brl(valor: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);
}

export function arredondar(valor: number): number {
  return Math.round((Number(valor) || 0) * 100) / 100;
}
