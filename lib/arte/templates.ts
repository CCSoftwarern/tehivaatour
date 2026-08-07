import { novoId } from "./constantes";
import type {
  ArtDesign,
  ArtElemento,
  ArtFundo,
  ArtRetangulo,
  ArtTexto,
} from "./tipos";

export type ConfigArte = {
  site_nome?: string;
  logo_url?: string;
  whatsapp?: string;
  cor_primaria?: string;
  cor_primaria_escura?: string;
  cor_destaque?: string;
  cor_fundo?: string;
};

export type ItemPost = {
  titulo: string;
  preco: number | null;
  preco_promocional?: number | null;
  imagem: string | null;
  categoria?: string;
};

export function formatarPreco(valor: number | null | undefined): string {
  if (valor == null) return "";
  const semDecimais = Number.isInteger(valor);
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: semDecimais ? 0 : 2,
    maximumFractionDigits: semDecimais ? 0 : 2,
  });
}

export function formatarWhats(whats: string): string {
  let d = whats.replace(/\D/g, "");
  if (d.startsWith("55")) d = d.slice(2);
  if (d.length === 10) {
    return `+55 (${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (d.length === 11) {
    return `+55 (${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  return whats;
}

function texto(parcial: Partial<ArtTexto> & { texto: string }): ArtTexto {
  return {
    id: novoId(),
    tipo: "texto",
    x: 0,
    y: 0,
    width: 900,
    height: 120,
    rotation: 0,
    opacity: 1,
    fonte: "Poppins",
    tamanho: 60,
    cor: "#ffffff",
    bold: true,
    italic: false,
    letterSpacing: 0,
    lineHeight: 1.2,
    alinhamento: "centro",
    destaque: false,
    destaqueCor: "#ff6b35",
    destaquePadding: 12,
    destaqueRadius: 999,
    ...parcial,
  };
}

function retangulo(
  parcial: { x: number; y: number; width: number; height: number } & Partial<ArtRetangulo>,
): ArtRetangulo {
  const { x, y, width, height, ...resto } = parcial;
  return {
    id: novoId(),
    tipo: "retangulo",
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    cor: "#ffffff",
    radius: 0,
    larguraContorno: 0,
    ...resto,
  };
}

function baseConfig(cfg: ConfigArte) {
  return {
    primaria: cfg.cor_primaria || "#1e6fd9",
    escura: cfg.cor_primaria_escura || "#0b2447",
    destaque: cfg.cor_destaque || "#ff6b35",
    fundo: cfg.cor_fundo || "#f8fafc",
    site: cfg.site_nome || "Agência de viagens",
  };
}

export function novoDesign(largura: number, altura: number): ArtDesign {
  return {
    versao: 1,
    nome: "Design sem nome",
    largura,
    altura,
    fundo: { tipo: "cor", cor: "#ffffff" },
    elementos: [],
  };
}

function logoOuNome(cfg: ConfigArte, x: number, y: number, w: number, h: number): ArtElemento[] {
  if (cfg.logo_url) {
    return [
      {
        id: novoId(),
        tipo: "imagem",
        x,
        y,
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
        url: cfg.logo_url,
        ajuste: "contem",
        cornerRadius: 0,
      },
    ];
  }
  return [
    texto({
      x,
      y,
      width: Math.max(w, 400),
      height: h,
      alinhamento: "esquerda",
      fonte: "Poppins",
      tamanho: Math.min(52, h),
      bold: true,
      cor: "#ffffff",
      texto: cfg.site_nome || "Agência de viagens",
    }),
  ];
}

export function templatePromocao(cfg: ConfigArte): ArtDesign {
  const c = baseConfig(cfg);
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: c.escura, cor2: c.primaria };
  const elementos: ArtElemento[] = [
    {
      id: novoId(), tipo: "circulo", x: 760, y: -240, width: 560, height: 560,
      rotation: 0, opacity: 0.25, cor: c.destaque, larguraContorno: 0,
    },
    {
      id: novoId(), tipo: "circulo", x: -200, y: 820, width: 460, height: 460,
      rotation: 0, opacity: 0.18, cor: "#ffffff", larguraContorno: 0,
    },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 240, width: 920, height: 70,
      fonte: "Oswald", tamanho: 52, bold: true, letterSpacing: 10,
      cor: c.destaque, alinhamento: "centro", texto: "PROMOÇÃO",
    }),
    texto({
      x: 80, y: 330, width: 920, height: 240,
      fonte: "Poppins", tamanho: 84, bold: true, cor: "#ffffff",
      lineHeight: 1.05, texto: "Sua promoção em destaque aqui",
    }),
    texto({
      x: 80, y: 610, width: 920, height: 60,
      fonte: "Inter", tamanho: 40, cor: "rgba(255,255,255,0.85)",
      texto: "De R$ 5.000 por",
    }),
    retangulo({ x: 300, y: 690, width: 480, height: 160, cor: c.destaque, radius: 999 }),
    texto({
      x: 300, y: 715, width: 480, height: 110,
      fonte: "Oswald", tamanho: 92, bold: true, cor: "#ffffff", texto: "R$ 3.999",
    }),
    retangulo({ x: 290, y: 890, width: 500, height: 110, cor: "#ffffff", radius: 999 }),
    texto({
      x: 290, y: 914, width: 500, height: 68,
      fonte: "Poppins", tamanho: 42, bold: true, cor: c.escura,
      texto: "Chame no WhatsApp",
    }),
    texto({
      x: 80, y: 1020, width: 920, height: 40,
      fonte: "Inter", tamanho: 30, cor: "rgba(255,255,255,0.8)",
      texto: cfg.whatsapp ? formatarWhats(cfg.whatsapp) : c.site,
    }),
  ];
  return { versao: 1, nome: "Promoção", largura: W, altura: H, fundo, elementos };
}

export function templateNovoPacote(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#0e7490", cor2: "#06b6d4" };
  const elementos: ArtElemento[] = [
    {
      id: novoId(), tipo: "circulo", x: 860, y: -300, width: 600, height: 600,
      rotation: 0, opacity: 0.2, cor: "#ffffff", larguraContorno: 0,
    },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 250, width: 920, height: 70,
      fonte: "Oswald", tamanho: 52, bold: true, letterSpacing: 10,
      cor: "#bae6fd", alinhamento: "centro", texto: "NOVO PACOTE",
    }),
    texto({
      x: 80, y: 360, width: 920, height: 300,
      fonte: "Poppins", tamanho: 88, bold: true, cor: "#ffffff",
      lineHeight: 1.05, texto: "Conheça nosso novo destino",
    }),
    retangulo({ x: 290, y: 760, width: 500, height: 110, cor: "#ffffff", radius: 999 }),
    texto({
      x: 290, y: 784, width: 500, height: 68,
      fonte: "Poppins", tamanho: 42, bold: true, cor: "#0e7490",
      texto: "Saiba mais",
    }),
    texto({
      x: 80, y: 950, width: 920, height: 60,
      fonte: "Inter", tamanho: 36, cor: "rgba(255,255,255,0.85)",
      texto: "A partir de R$ 2.990 por pessoa",
    }),
  ];
  return { versao: 1, nome: "Novo pacote", largura: W, altura: H, fundo, elementos };
}

export function templateDica(cfg: ConfigArte): ArtDesign {
  const c = baseConfig(cfg);
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "cor", cor: c.fundo };
  const elementos: ArtElemento[] = [
    {
      id: novoId(), tipo: "retangulo", x: 0, y: 0, width: 28, height: H,
      rotation: 0, opacity: 1, cor: c.destaque, radius: 0, larguraContorno: 0,
    },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 250, width: 920, height: 70,
      fonte: "Oswald", tamanho: 52, bold: true, letterSpacing: 10,
      cor: c.destaque, alinhamento: "esquerda", texto: "DICA DE VIAGEM",
    }),
    texto({
      x: 80, y: 360, width: 920, height: 300,
      fonte: "Playfair Display", tamanho: 84, bold: true,
      cor: c.escura, lineHeight: 1.1, alinhamento: "esquerda",
      texto: "O melhor período para viajar para o Nordeste",
    }),
    texto({
      x: 80, y: 760, width: 920, height: 160,
      fonte: "Inter", tamanho: 40, cor: "#475569", alinhamento: "esquerda",
      lineHeight: 1.4,
      texto: "Entre setembro e dezembro os preços caem e o mar fica perfeito. Guarde essa dica!",
    }),
    retangulo({ x: 80, y: 960, width: 420, height: 90, cor: c.primaria, radius: 999 }),
    texto({
      x: 80, y: 980, width: 420, height: 56,
      fonte: "Poppins", tamanho: 34, bold: true, cor: "#ffffff",
      texto: "Planeje com a gente",
    }),
  ];
  return { versao: 1, nome: "Dica de viagem", largura: W, altura: H, fundo, elementos };
}

export function templateSobre(cfg: ConfigArte): ArtDesign {
  const c = baseConfig(cfg);
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "cor", cor: c.escura };
  const elementos: ArtElemento[] = [
    {
      id: novoId(), tipo: "circulo", x: 700, y: -260, width: 560, height: 560,
      rotation: 0, opacity: 0.15, cor: c.primaria, larguraContorno: 0,
    },
    {
      id: novoId(), tipo: "circulo", x: -160, y: 760, width: 440, height: 440,
      rotation: 0, opacity: 0.12, cor: c.destaque, larguraContorno: 0,
    },
    texto({
      x: 80, y: 300, width: 920, height: 260,
      fonte: "Playfair Display", tamanho: 96, bold: true, cor: "#ffffff",
      lineHeight: 1.08, texto: c.site,
    }),
    texto({
      x: 80, y: 600, width: 920, height: 180,
      fonte: "Inter", tamanho: 40, cor: "rgba(255,255,255,0.85)",
      lineHeight: 1.4,
      texto: "Viagens que você nunca vai esquecer, com atendimento próximo e personalizado.",
    }),
    retangulo({ x: 80, y: 830, width: 520, height: 110, cor: c.destaque, radius: 999 }),
    texto({
      x: 80, y: 854, width: 520, height: 68,
      fonte: "Poppins", tamanho: 40, bold: true, cor: "#ffffff",
      texto: "Fale com a gente",
    }),
  ];
  return { versao: 1, nome: "Sobre a agência", largura: W, altura: H, fundo, elementos };
}

// ---- Temas sazonais / datas comemorativas ----

export function templateNatal(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "cor", cor: "#0d1b2a" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "retangulo", x: 0, y: 0, width: W, height: H, rotation: 0, opacity: 0.08, cor: "#ffffff", radius: 0, larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 220, width: 920, height: 80,
      fonte: "Playfair Display", tamanho: 72, bold: true, cor: "#ff6b35",
      lineHeight: 1.1, alinhamento: "centro", texto: "✨  Natal  ✨",
    }),
    texto({
      x: 80, y: 330, width: 920, height: 220,
      fonte: "Poppins", tamanho: 64, bold: true, cor: "#ffffff",
      lineHeight: 1.1, alinhamento: "centro", texto: "Pacotes mágicos para\no fim de ano",
    }),
    retangulo({ x: 340, y: 620, width: 400, height: 140, cor: "#ff6b35", radius: 999 }),
    texto({
      x: 340, y: 650, width: 400, height: 90,
      fonte: "Oswald", tamanho: 68, bold: true, cor: "#ffffff", texto: "A partir de",
    }),
    texto({
      x: 340, y: 730, width: 400, height: 60,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#ffffff", texto: "R$ 2.490",
    }),
    texto({
      x: 80, y: 820, width: 920, height: 120,
      fonte: "Inter", tamanho: 38, cor: "rgba(255,255,255,0.8)",
      lineHeight: 1.4, alinhamento: "centro",
      texto: "Ceia inclusa · Traslados · Hospedagem 4★",
    }),
    retangulo({ x: 290, y: 960, width: 500, height: 90, cor: "#ffffff", radius: 999 }),
    texto({
      x: 290, y: 980, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#0d1b2a",
      texto: "Reserve seu Natal",
    }),
  ];
  return { versao: 1, nome: "Natal", largura: W, altura: H, fundo, elementos };
}

export function templateAnoNovo(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#0a0a2e", cor2: "#1a1a6e" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "circulo", x: 800, y: -200, width: 500, height: 500, rotation: 0, opacity: 0.3, cor: "#ffd700", larguraContorno: 0 },
    { id: novoId(), tipo: "circulo", x: -100, y: 780, width: 400, height: 400, rotation: 0, opacity: 0.2, cor: "#ffd700", larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 250, width: 920, height: 80,
      fonte: "Bebas Neue", tamanho: 88, bold: true, cor: "#ffd700",
      lineHeight: 1.1, alinhamento: "centro", letterSpacing: 20, texto: "2025",
    }),
    texto({
      x: 80, y: 360, width: 920, height: 180,
      fonte: "Poppins", tamanho: 68, bold: true, cor: "#ffffff",
      lineHeight: 1.1, alinhamento: "centro", texto: "Feliz Ano Novo!",
    }),
    texto({
      x: 80, y: 560, width: 920, height: 160,
      fonte: "Inter", tamanho: 42, cor: "rgba(255,255,255,0.85)",
      lineHeight: 1.4, alinhamento: "centro", texto: "Novos destinos, novas histórias.\nViaje mais em 2025.",
    }),
    retangulo({ x: 290, y: 760, width: 500, height: 120, cor: "#ffd700", radius: 999 }),
    texto({
      x: 290, y: 790, width: 500, height: 70,
      fonte: "Oswald", tamanho: 56, bold: true, cor: "#0a0a2e", texto: "Planeje já",
    }),
    texto({
      x: 80, y: 930, width: 920, height: 80,
      fonte: "Inter", tamanho: 34, cor: "rgba(255,215,0,0.8)",
      alinhamento: "centro", texto: "Ofertas especiais de réveillon disponíveis",
    }),
  ];
  return { versao: 1, nome: "Ano Novo", largura: W, altura: H, fundo, elementos };
}

export function templateDiaDasMaes(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#fce4ec", cor2: "#f8bbd0" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "circulo", x: 780, y: -180, width: 480, height: 480, rotation: 0, opacity: 0.4, cor: "#f48fb1", larguraContorno: 0 },
    { id: novoId(), tipo: "circulo", x: -80, y: 780, width: 420, height: 420, rotation: 0, opacity: 0.3, cor: "#f48fb1", larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 260, width: 920, height: 80,
      fonte: "Playfair Display", tamanho: 72, bold: true, cor: "#c62828",
      lineHeight: 1.1, alinhamento: "centro", texto: "💝 Dia das Mães",
    }),
    texto({
      x: 80, y: 370, width: 920, height: 200,
      fonte: "Poppins", tamanho: 60, bold: true, cor: "#3e2723",
      lineHeight: 1.2, alinhamento: "centro", texto: "O melhor presente\né uma viagem inesquecível",
    }),
    retangulo({ x: 340, y: 630, width: 400, height: 140, cor: "#c62828", radius: 999 }),
    texto({
      x: 340, y: 660, width: 400, height: 90,
      fonte: "Oswald", tamanho: 64, bold: true, cor: "#ffffff", texto: "Pacotes a partir de",
    }),
    texto({
      x: 340, y: 740, width: 400, height: 50,
      fonte: "Poppins", tamanho: 36, bold: true, cor: "#ffffff", texto: "R$ 1.890",
    }),
    texto({
      x: 80, y: 820, width: 920, height: 120,
      fonte: "Inter", tamanho: 36, cor: "rgba(62,39,35,0.8)",
      lineHeight: 1.4, alinhamento: "centro",
      texto: "Spa · Vinho · Jantar romântico · Hospedagem charmosa",
    }),
    retangulo({ x: 290, y: 960, width: 500, height: 90, cor: "#ffffff", radius: 999 }),
    texto({
      x: 290, y: 980, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#c62828",
      texto: "Garanta a vaga",
    }),
  ];
  return { versao: 1, nome: "Dia das Mães", largura: W, altura: H, fundo, elementos };
}

export function templatePascoa(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#e8f5e9", cor2: "#c8e6c9" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "circulo", x: 820, y: -160, width: 460, height: 460, rotation: 0, opacity: 0.5, cor: "#81c784", larguraContorno: 0 },
    { id: novoId(), tipo: "circulo", x: -60, y: 760, width: 400, height: 400, rotation: 0, opacity: 0.3, cor: "#a5d6a7", larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 240, width: 920, height: 80,
      fonte: "Bebas Neue", tamanho: 76, bold: true, cor: "#2e7d32",
      lineHeight: 1.1, alinhamento: "centro", letterSpacing: 8, texto: "🐰 Páscoa",
    }),
    texto({
      x: 80, y: 350, width: 920, height: 200,
      fonte: "Poppins", tamanho: 64, bold: true, cor: "#1b5e20",
      lineHeight: 1.1, alinhamento: "centro", texto: "Chocolate é bom,\nviajar é melhor!",
    }),
    retangulo({ x: 340, y: 620, width: 400, height: 130, cor: "#2e7d32", radius: 999 }),
    texto({
      x: 340, y: 650, width: 400, height: 80,
      fonte: "Oswald", tamanho: 60, bold: true, cor: "#ffffff", texto: "Feriado prolongado",
    }),
    texto({
      x: 340, y: 720, width: 400, height: 50,
      fonte: "Poppins", tamanho: 36, bold: true, cor: "#ffffff", texto: "De R$ 1.590",
    }),
    texto({
      x: 80, y: 800, width: 920, height: 120,
      fonte: "Inter", tamanho: 36, cor: "rgba(30,95,32,0.8)",
      lineHeight: 1.4, alinhamento: "centro",
      texto: "Passeios · Trilhas · Cachoeiras · Hospedagem familiar",
    }),
    retangulo({ x: 290, y: 950, width: 500, height: 90, cor: "#ffffff", radius: 999 }),
    texto({
      x: 290, y: 970, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#2e7d32",
      texto: "Reserve agora",
    }),
  ];
  return { versao: 1, nome: "Páscoa", largura: W, altura: H, fundo, elementos };
}

export function templateBlackFriday(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "cor", cor: "#000000" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "retangulo", x: 0, y: 0, width: W, height: H, rotation: 0, opacity: 0.06, cor: "#ffffff", radius: 0, larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 220, width: 920, height: 80,
      fonte: "Bebas Neue", tamanho: 72, bold: true, cor: "#ff0000",
      lineHeight: 1.1, alinhamento: "centro", letterSpacing: 12, texto: "BLACK FRIDAY",
    }),
    texto({
      x: 80, y: 320, width: 920, height: 200,
      fonte: "Oswald", tamanho: 88, bold: true, cor: "#ffffff",
      lineHeight: 1.05, alinhamento: "centro", texto: "ATÉ 50% OFF",
    }),
    texto({
      x: 80, y: 540, width: 920, height: 100,
      fonte: "Poppins", tamanho: 42, cor: "#cccccc",
      lineHeight: 1.3, alinhamento: "centro", texto: "Pacotes nacionais e internacionais\ncom descontos exclusivos",
    }),
    retangulo({ x: 240, y: 680, width: 600, height: 160, cor: "#ff0000", radius: 999 }),
    texto({
      x: 240, y: 710, width: 600, height: 110,
      fonte: "Oswald", tamanho: 92, bold: true, cor: "#ffffff", texto: "CONFIRA",
    }),
    texto({
      x: 80, y: 880, width: 920, height: 80,
      fonte: "Inter", tamanho: 36, cor: "#888888",
      alinhamento: "centro", texto: "Vagas limitadas · Válido até 30/11",
    }),
    retangulo({ x: 290, y: 980, width: 500, height: 90, cor: "#333333", radius: 999 }),
    texto({
      x: 290, y: 1000, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#ff0000",
      texto: "Ver ofertas",
    }),
  ];
  return { versao: 1, nome: "Black Friday", largura: W, altura: H, fundo, elementos };
}

export function templateDiaDosPais(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#1a237e", cor2: "#283593" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "circulo", x: 800, y: -180, width: 480, height: 480, rotation: 0, opacity: 0.25, cor: "#ffd54f", larguraContorno: 0 },
    { id: novoId(), tipo: "circulo", x: -80, y: 780, width: 400, height: 400, rotation: 0, opacity: 0.18, cor: "#ffd54f", larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 260, width: 920, height: 80,
      fonte: "Bebas Neue", tamanho: 72, bold: true, cor: "#ffd54f",
      lineHeight: 1.1, alinhamento: "centro", letterSpacing: 10, texto: "DIA DOS PAIS",
    }),
    texto({
      x: 80, y: 370, width: 920, height: 200,
      fonte: "Poppins", tamanho: 64, bold: true, cor: "#ffffff",
      lineHeight: 1.1, alinhamento: "centro", texto: "Aventura & Descanso\npara o melhor pai do mundo",
    }),
    retangulo({ x: 340, y: 630, width: 400, height: 130, cor: "#ffd54f", radius: 999 }),
    texto({
      x: 340, y: 660, width: 400, height: 80,
      fonte: "Oswald", tamanho: 56, bold: true, cor: "#1a237e", texto: "Pacotes especiais",
    }),
    texto({
      x: 340, y: 730, width: 400, height: 50,
      fonte: "Poppins", tamanho: 36, bold: true, cor: "#1a237e", texto: "De R$ 1.690",
    }),
    texto({
      x: 80, y: 810, width: 920, height: 120,
      fonte: "Inter", tamanho: 36, cor: "rgba(255,213,79,0.85)",
      lineHeight: 1.4, alinhamento: "centro",
      texto: "Pesca · Trilha · Cervejaria · Hospedagem fazenda",
    }),
    retangulo({ x: 290, y: 960, width: 500, height: 90, cor: "#ffd54f", radius: 999 }),
    texto({
      x: 290, y: 980, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#1a237e",
      texto: "Compre agora",
    }),
  ];
  return { versao: 1, nome: "Dia dos Pais", largura: W, altura: H, fundo, elementos };
}

export function templateDiaDosNamorados(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#b71c1c", cor2: "#880e4f" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "circulo", x: 800, y: -200, width: 500, height: 500, rotation: 0, opacity: 0.3, cor: "#ff5252", larguraContorno: 0 },
    { id: novoId(), tipo: "circulo", x: -100, y: 780, width: 420, height: 420, rotation: 0, opacity: 0.22, cor: "#ff5252", larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 240, width: 920, height: 80,
      fonte: "Playfair Display", tamanho: 76, bold: true, cor: "#ffebee",
      lineHeight: 1.1, alinhamento: "centro", texto: "💕 Dia dos Namorados",
    }),
    texto({
      x: 80, y: 350, width: 920, height: 200,
      fonte: "Poppins", tamanho: 62, bold: true, cor: "#ffffff",
      lineHeight: 1.15, alinhamento: "centro", texto: "Uma viagem a dois\npara recordar para sempre",
    }),
    retangulo({ x: 340, y: 620, width: 400, height: 130, cor: "#ff5252", radius: 999 }),
    texto({
      x: 340, y: 650, width: 400, height: 80,
      fonte: "Oswald", tamanho: 56, bold: true, cor: "#b71c1c", texto: "Romance Package",
    }),
    texto({
      x: 340, y: 720, width: 400, height: 50,
      fonte: "Poppins", tamanho: 36, bold: true, cor: "#b71c1c", texto: "R$ 2.290 / casal",
    }),
    texto({
      x: 80, y: 800, width: 920, height: 120,
      fonte: "Inter", tamanho: 36, cor: "rgba(255,235,238,0.85)",
      lineHeight: 1.4, alinhamento: "centro",
      texto: "Jantar à luz de velas · Spa couples · Vinho · Suite romântica",
    }),
    retangulo({ x: 290, y: 950, width: 500, height: 90, cor: "#ffffff", radius: 999 }),
    texto({
      x: 290, y: 970, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#b71c1c",
      texto: "Garanta sua data",
    }),
  ];
  return { versao: 1, nome: "Dia dos Namorados", largura: W, altura: H, fundo, elementos };
}

export function templateCarnaval(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#6a1b9a", cor2: "#e91e63" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "circulo", x: 820, y: -180, width: 480, height: 480, rotation: 0, opacity: 0.35, cor: "#ffd600", larguraContorno: 0 },
    { id: novoId(), tipo: "circulo", x: -80, y: 760, width: 400, height: 400, rotation: 0, opacity: 0.25, cor: "#ffd600", larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 240, width: 920, height: 80,
      fonte: "Bebas Neue", tamanho: 80, bold: true, cor: "#ffd600",
      lineHeight: 1.1, alinhamento: "centro", letterSpacing: 14, texto: "CARNAVAL 2025",
    }),
    texto({
      x: 80, y: 350, width: 920, height: 200,
      fonte: "Poppins", tamanho: 64, bold: true, cor: "#ffffff",
      lineHeight: 1.1, alinhamento: "centro", texto: "Folia, praia ou descanso.\nEscolha o seu ritmo.",
    }),
    retangulo({ x: 340, y: 620, width: 400, height: 130, cor: "#ffd600", radius: 999 }),
    texto({
      x: 340, y: 650, width: 400, height: 80,
      fonte: "Oswald", tamanho: 56, bold: true, cor: "#6a1b9a", texto: "Pacotes foliões",
    }),
    texto({
      x: 340, y: 720, width: 400, height: 50,
      fonte: "Poppins", tamanho: 36, bold: true, cor: "#6a1b9a", texto: "De R$ 1.990",
    }),
    texto({
      x: 80, y: 800, width: 920, height: 120,
      fonte: "Inter", tamanho: 36, cor: "rgba(255,214,0,0.9)",
      lineHeight: 1.4, alinhamento: "centro",
      texto: "Blocos · Camarotes · Praias · Hospedagem central",
    }),
    retangulo({ x: 290, y: 950, width: 500, height: 90, cor: "#ffd600", radius: 999 }),
    texto({
      x: 290, y: 970, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#6a1b9a",
      texto: "Reserve já",
    }),
  ];
  return { versao: 1, nome: "Carnaval", largura: W, altura: H, fundo, elementos };
}

export function templateVerao(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#006064", cor2: "#0097a7" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "circulo", x: 820, y: -180, width: 480, height: 480, rotation: 0, opacity: 0.3, cor: "#4dd0e1", larguraContorno: 0 },
    { id: novoId(), tipo: "circulo", x: -80, y: 760, width: 400, height: 400, rotation: 0, opacity: 0.2, cor: "#4dd0e1", larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 250, width: 920, height: 80,
      fonte: "Bebas Neue", tamanho: 76, bold: true, cor: "#4dd0e1",
      lineHeight: 1.1, alinhamento: "centro", letterSpacing: 10, texto: "VERÃO ☀️",
    }),
    texto({
      x: 80, y: 360, width: 920, height: 200,
      fonte: "Poppins", tamanho: 64, bold: true, cor: "#ffffff",
      lineHeight: 1.1, alinhamento: "centro", texto: "Sol, mar e\nas melhores tarifas",
    }),
    retangulo({ x: 340, y: 620, width: 400, height: 130, cor: "#4dd0e1", radius: 999 }),
    texto({
      x: 340, y: 650, width: 400, height: 80,
      fonte: "Oswald", tamanho: 56, bold: true, cor: "#006064", texto: "Litoral brasileiro",
    }),
    texto({
      x: 340, y: 720, width: 400, height: 50,
      fonte: "Poppins", tamanho: 36, bold: true, cor: "#006064", texto: "A partir de R$ 1.290",
    }),
    texto({
      x: 80, y: 800, width: 920, height: 120,
      fonte: "Inter", tamanho: 36, cor: "rgba(77,208,225,0.9)",
      lineHeight: 1.4, alinhamento: "centro",
      texto: "Praias paradisíacas · Passeios de barco · All-inclusive",
    }),
    retangulo({ x: 290, y: 950, width: 500, height: 90, cor: "#ffffff", radius: 999 }),
    texto({
      x: 290, y: 970, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#006064",
      texto: "Ver pacotes",
    }),
  ];
  return { versao: 1, nome: "Verão", largura: W, altura: H, fundo, elementos };
}

export function templateInverno(cfg: ConfigArte): ArtDesign {
  const W = 1080;
  const H = 1080;
  const fundo: ArtFundo = { tipo: "gradiente", cor: "#0d47a1", cor2: "#1565c0" };
  const elementos: ArtElemento[] = [
    { id: novoId(), tipo: "circulo", x: 820, y: -180, width: 480, height: 480, rotation: 0, opacity: 0.3, cor: "#90caf9", larguraContorno: 0 },
    { id: novoId(), tipo: "circulo", x: -80, y: 760, width: 400, height: 400, rotation: 0, opacity: 0.2, cor: "#90caf9", larguraContorno: 0 },
    ...logoOuNome(cfg, 70, 64, 220, 110),
    texto({
      x: 80, y: 250, width: 920, height: 80,
      fonte: "Playfair Display", tamanho: 72, bold: true, cor: "#e3f2fd",
      lineHeight: 1.1, alinhamento: "centro", texto: "❄️ Inverno na Serra",
    }),
    texto({
      x: 80, y: 360, width: 920, height: 200,
      fonte: "Poppins", tamanho: 64, bold: true, cor: "#ffffff",
      lineHeight: 1.1, alinhamento: "centro", texto: "Frio, lareira\ne fondue incluso",
    }),
    retangulo({ x: 340, y: 620, width: 400, height: 130, cor: "#90caf9", radius: 999 }),
    texto({
      x: 340, y: 650, width: 400, height: 80,
      fonte: "Oswald", tamanho: 56, bold: true, cor: "#0d47a1", texto: "Gramado · Campos",
    }),
    texto({
      x: 340, y: 720, width: 400, height: 50,
      fonte: "Poppins", tamanho: 36, bold: true, cor: "#0d47a1", texto: "De R$ 1.890",
    }),
    texto({
      x: 80, y: 800, width: 920, height: 120,
      fonte: "Inter", tamanho: 36, cor: "rgba(144,202,249,0.9)",
      lineHeight: 1.4, alinhamento: "centro",
      texto: "Chalé com lareira · Vinho · Fondue · Passeios neve",
    }),
    retangulo({ x: 290, y: 950, width: 500, height: 90, cor: "#0d47a1", radius: 999 }),
    texto({
      x: 290, y: 970, width: 500, height: 56,
      fonte: "Poppins", tamanho: 38, bold: true, cor: "#ffffff",
      texto: "Reserve seu chalé",
    }),
  ];
  return { versao: 1, nome: "Inverno", largura: W, altura: H, fundo, elementos };
}

export function criarPostDePacote(item: ItemPost, cfg: ConfigArte): ArtDesign {
  const c = baseConfig(cfg);
  const W = 1080;
  const H = 1080;
  const temImagem = Boolean(item.imagem);
  const precoPromo = item.preco_promocional ?? item.preco;
  const precoNormal = item.preco_promocional != null ? item.preco : null;
  const whats = (cfg.whatsapp || "").replace(/\D/g, "");

  const fundo: ArtFundo = temImagem
    ? { tipo: "imagem", url: item.imagem as string }
    : { tipo: "gradiente", cor: c.escura, cor2: c.primaria };

  const elementos: ArtElemento[] = [];
  if (temImagem) {
    elementos.push(retangulo({ x: 0, y: 0, width: W, height: H, cor: "#000000", opacity: 0.5 }));
  }
  elementos.push({
    id: novoId(), tipo: "circulo", x: W - 320, y: -260, width: 640, height: 640,
    rotation: 0, opacity: 0.25, cor: c.destaque, larguraContorno: 0,
  });
  elementos.push(...logoOuNome(cfg, 70, 64, 220, 110));

  const rotulo = item.categoria ? item.categoria.toUpperCase() : "PROMOÇÃO";
  elementos.push(
    texto({
      x: 80, y: 220, width: 700, height: 60,
      fonte: "Oswald", tamanho: 44, bold: true, letterSpacing: 8,
      cor: c.destaque, alinhamento: "esquerda", texto: rotulo,
    }),
    texto({
      x: 80, y: 310, width: 920, height: 250,
      fonte: "Poppins", tamanho: 72, bold: true, cor: "#ffffff",
      lineHeight: 1.08, alinhamento: "esquerda", texto: item.titulo,
    }),
    texto({
      x: 80, y: 590, width: 920, height: 56,
      fonte: "Inter", tamanho: 40, cor: "rgba(255,255,255,0.85)",
      alinhamento: "esquerda", texto: "a partir de",
    }),
  );

  if (precoNormal != null) {
    elementos.push(
texto({
          x: 80, y: 660, width: 920, height: 60,
          fonte: "Inter", tamanho: 46, cor: "rgba(255,255,255,0.7)",
          alinhamento: "esquerda", texto: "de " + formatarPreco(precoNormal),
        }),
    );
  }

  elementos.push(
    retangulo({ x: 300, y: 700, width: 480, height: 150, cor: c.destaque, radius: 999 }),
    texto({
      x: 300, y: 724, width: 480, height: 104,
      fonte: "Oswald", tamanho: 86, bold: true, cor: "#ffffff",
      texto: formatarPreco(precoPromo),
    }),
    retangulo({ x: 290, y: 890, width: 500, height: 110, cor: "#ffffff", radius: 999 }),
    texto({
      x: 290, y: 914, width: 500, height: 68,
      fonte: "Poppins", tamanho: 42, bold: true, cor: c.escura,
      texto: "Chame no WhatsApp",
    }),
  );

  if (whats) {
    elementos.push(
      texto({
        x: 80, y: 1020, width: 920, height: 40,
        fonte: "Inter", tamanho: 30, cor: "rgba(255,255,255,0.85)",
        texto: formatarWhats(cfg.whatsapp || ""),
      }),
    );
  }

  return {
    versao: 1,
    nome: item.titulo.slice(0, 40) || "Post de pacote",
    largura: W,
    altura: H,
    fundo,
    elementos,
  };
}

