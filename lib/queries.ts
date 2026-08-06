import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { defaultConfig, type ConfigRecord } from "@/lib/config";
import type {
  Categoria,
  Contato,
  HeroImagem,
  Logo,
  Pacote,
  Promocao,
  Servico,
  TipoLogo,
} from "@/lib/types";

function now(): string {
  return new Date().toISOString();
}

/** Constrói o filtro de validade por data (início não futuro / vencimento não vencido). */
function periodoFiltro(
  coluna: string,
  data: string,
  op: "lte" | "gte" = "lte",
): string {
  return `${coluna}.is.null,${coluna}.${op}.${data}`;
}

export async function getSiteConfig(): Promise<ConfigRecord> {
  if (!isSupabaseConfigured) return { ...defaultConfig };
  const supabase = await createClient();
  const { data } = await supabase.from("configuracoes").select("chave, valor");
  const config: ConfigRecord = { ...defaultConfig };
  for (const item of data ?? []) {
    config[item.chave] = item.valor;
  }
  return config;
}

export async function getPromocoes(): Promise<Promocao[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promocoes")
    .select("*")
    .eq("ativo", true)
    .or(periodoFiltro("inicio", now()))
    .or(periodoFiltro("vencimento", now(), "gte"))
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Promocao[];
}

export async function getPromocaoPorSlug(slug: string): Promise<Promocao | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promocoes")
    .select("*")
    .eq("slug", slug)
    .eq("ativo", true)
    .or(periodoFiltro("inicio", now()))
    .or(periodoFiltro("vencimento", now(), "gte"))
    .single();

  if (error || !data) return null;
  return data as Promocao;
}

export async function getPacotes(
  categoria?: Categoria,
  limite?: number,
): Promise<Pacote[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  let query = supabase
    .from("pacotes")
    .select("*")
    .eq("ativo", true)
    .or(periodoFiltro("vencimento", now(), "gte"));

  if (categoria) query = query.eq("categoria", categoria);
  query = query.order("created_at", { ascending: false });
  if (limite) query = query.limit(limite);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as Pacote[];
}

export async function getPacotePorSlug(
  slug: string,
): Promise<Pacote | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacotes")
    .select("*")
    .eq("slug", slug)
    .eq("ativo", true)
    .or(periodoFiltro("vencimento", now(), "gte"))
    .single();

  if (error || !data) return null;
  return data as Pacote;
}

export async function getServicos(): Promise<Servico[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error) return [];
  return (data ?? []) as Servico[];
}

export async function getHeroImagens(): Promise<HeroImagem[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_imagens")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error) return [];
  return (data ?? []) as HeroImagem[];
}

export async function getLogos(tipo?: TipoLogo): Promise<Logo[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  let query = supabase
    .from("logos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (tipo) query = query.eq("tipo", tipo);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as Logo[];
}

/** Admin — apenas para usuários autenticados (RLS). */
export async function getContatosAdmin(): Promise<Contato[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contatos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Contato[];
}

export async function getTodosAdmin<T extends { id: string }>(
  tabela: "promocoes" | "pacotes" | "servicos",
): Promise<T[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from(tabela).select("*");
  if (error) return [];
  return (data ?? []) as T[];
}

export function contagemMensagensNaoLidas(contatos: Contato[]): number {
  return contatos.filter((c) => c.status === "nova").length;
}
