import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendaForm } from "@/components/admin/venda/venda-form";
import { normalizarVenda } from "@/lib/venda";
import type { Cliente, Conta, Entrada, Pacote, Venda } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminVendaEditar({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: clientes }, { data: pacotes }, { data: contas }, { data: entradas }] =
    await Promise.all([
      supabase.from("vendas").select("*").eq("id", id).maybeSingle(),
      supabase.from("clientes").select("*").order("nome", { ascending: true }),
      supabase
        .from("pacotes")
        .select("id, titulo_pt, destino_pt")
        .eq("ativo", true)
        .order("titulo_pt", { ascending: true }),
      supabase.from("contas").select("*").order("nome", { ascending: true }),
      supabase.from("entradas").select("*").eq("venda_id", id).order("data", { ascending: true }),
    ]);

  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">
        Editar venda {(data as Venda).numero}
      </h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Atualize os valores, as entradas recebidas e as comissões.
      </p>
      <VendaForm
        lang={lang}
        vendaInicial={normalizarVenda(data as Venda)}
        clientes={(clientes ?? []) as Cliente[]}
        pacotes={(pacotes ?? []) as Pacote[]}
        contas={(contas ?? []) as Conta[]}
        entradasIniciais={(entradas ?? []) as Entrada[]}
      />
    </div>
  );
}
