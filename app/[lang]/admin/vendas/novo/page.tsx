import { createClient } from "@/lib/supabase/server";
import { VendaForm } from "@/components/admin/venda/venda-form";
import type { Cliente, Conta, Pacote } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminVendaNovo({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const [{ data: clientes }, { data: pacotes }, { data: contas }] = await Promise.all([
    supabase.from("clientes").select("*").order("nome", { ascending: true }),
    supabase
      .from("pacotes")
      .select("id, titulo_pt, destino_pt")
      .eq("ativo", true)
      .order("titulo_pt", { ascending: true }),
      supabase.from("contas").select("*").order("nome", { ascending: true }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Nova venda</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Lance os itens com tarifa, percentual, desconto, abatimento e taxas. As
        comissÃµes sÃ£o calculadas sobre o total lÃ­quido.
      </p>
      <VendaForm
        lang={lang}
        clientes={(clientes ?? []) as Cliente[]}
        contas={(contas ?? []) as Conta[]}
        pacotes={(pacotes ?? []) as Pacote[]}
      />
    </div>
  );
}
