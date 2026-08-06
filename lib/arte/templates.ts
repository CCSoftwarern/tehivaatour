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
        alinhamento: "esquerda", texto: `de ${formatarPreco(precoNormal)}`,
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
