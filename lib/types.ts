export type Categoria = "pacote" | "cruzeiro" | "seguro";

export interface Promocao {
  id: string;
  titulo_pt: string;
  titulo_en: string;
  descricao_pt: string | null;
  descricao_en: string | null;
  preco: number | null;
  preco_promocional: number | null;
  imagem: string | null;
  slug: string | null;
  destaque: boolean;
  ativo: boolean;
  inicio: string | null;
  vencimento: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pacote {
  id: string;
  slug: string;
  categoria: Categoria;
  titulo_pt: string;
  titulo_en: string;
  descricao_pt: string | null;
  descricao_en: string | null;
  destino_pt: string | null;
  destino_en: string | null;
  duracao_pt: string | null;
  duracao_en: string | null;
  preco: number | null;
  imagem: string | null;
  ativo: boolean;
  vencimento: string | null;
  created_at: string;
  updated_at: string;
}

export interface Servico {
  id: string;
  icone: string | null;
  titulo_pt: string;
  titulo_en: string;
  descricao_pt: string | null;
  descricao_en: string | null;
  imagem: string | null;
  ordem: number;
  ativo: boolean;
}

export interface Contato {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string;
  status: "nova" | "lida" | "arquivada";
  created_at: string;
}

export interface Configuracao {
  chave: string;
  valor: string;
}

export interface HeroImagem {
  id: string;
  url: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}
