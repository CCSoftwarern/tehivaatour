export function somenteDigitos(valor: string | null | undefined): string {
  return (valor ?? "").replace(/\D/g, "");
}

export function mascararCpf(valor: string | null | undefined): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length !== 11) return d;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function mascararCep(valor: string | null | undefined): string {
  const d = somenteDigitos(valor).slice(0, 8);
  if (d.length !== 8) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function mascararTelefone(valor: string | null | undefined): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 10) {
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function cpfValido(valor: string | null | undefined): boolean {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;
    if (digito !== Number(d[tamanho])) return false;
  }
  return true;
}

export function idade(dataNascimento: string | null | undefined): number | null {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return null;
  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) anos -= 1;
  return anos >= 0 && anos < 130 ? anos : null;
}
