export type ArtTipo = "texto" | "imagem" | "retangulo" | "circulo" | "linha";

export interface ArtBase {
  id: string;
  tipo: ArtTipo;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface ArtTexto extends ArtBase {
  tipo: "texto";
  texto: string;
  fonte: string;
  tamanho: number;
  cor: string;
  bold: boolean;
  italic: boolean;
  letterSpacing: number;
  lineHeight: number;
  alinhamento: "esquerda" | "centro" | "direita";
  destaque: boolean;
  destaqueCor: string;
  destaquePadding: number;
  destaqueRadius: number;
}

export interface ArtImagem extends ArtBase {
  tipo: "imagem";
  url: string;
  ajuste: "cover" | "contem";
  cornerRadius: number;
}

export interface ArtRetangulo extends ArtBase {
  tipo: "retangulo";
  cor: string;
  cor2?: string;
  contorno?: string;
  larguraContorno: number;
  radius: number;
}

export interface ArtCirculo extends ArtBase {
  tipo: "circulo";
  cor: string;
  cor2?: string;
  contorno?: string;
  larguraContorno: number;
}

export interface ArtLinha extends ArtBase {
  tipo: "linha";
  cor: string;
  larguraContorno: number;
}

export type ArtElemento =
  | ArtTexto
  | ArtImagem
  | ArtRetangulo
  | ArtCirculo
  | ArtLinha;

export type ArtFundo =
  | { tipo: "cor"; cor: string }
  | { tipo: "gradiente"; cor: string; cor2: string }
  | { tipo: "imagem"; url: string };

export interface ArtDesign {
  versao: 1;
  nome: string;
  largura: number;
  altura: number;
  fundo: ArtFundo;
  elementos: ArtElemento[];
}
