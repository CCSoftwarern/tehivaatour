export type ArtFonte = {
  nome: string;
};

export const TAMANHOS = [
  { id: "post", nome: "Post do Instagram", largura: 1080, altura: 1080 },
  { id: "retrato", nome: "Post retrato (IG/FB)", largura: 1080, altura: 1350 },
  { id: "story", nome: "Story / Status", largura: 1080, altura: 1920 },
  { id: "banner", nome: "Banner / Link", largura: 1200, altura: 628 },
  { id: "facebook", nome: "Facebook", largura: 940, altura: 788 },
] as const;

export type ArtTamanhoId = (typeof TAMANHOS)[number]["id"];

export const FONTES: ArtFonte[] = [
  { nome: "Inter" },
  { nome: "Poppins" },
  { nome: "Montserrat" },
  { nome: "Oswald" },
  { nome: "Bebas Neue" },
  { nome: "Playfair Display" },
];

export const CORES = [
  "#ffffff",
  "#0f172a",
  "#1e293b",
  "#334155",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#f8fafc",
  "#ef4444",
  "#f43f5e",
  "#ec4899",
  "#d946ef",
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#22c55e",
  "#facc15",
  "#f59e0b",
  "#f97316",
];

export function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function corComOpacidade(hex: string, opacidade: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, opacidade));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
