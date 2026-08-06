import { getSiteConfig } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { normalizarItens } from "@/lib/orcamento";
import { OrcamentoForm } from "@/components/admin/orcamento/orcamento-form";
import type { Orcamento } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrcamentoEditar({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const config = await getSiteConfig();
  const supabase = await createClient();
  const { data } = await supabase
    .from("orcamentos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const registro = data as Orcamento | null;

  if (!registro) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
        Orçamento não encontrado.
      </div>
    );
  }

  const orcamento: Orcamento = {
    ...registro,
    itens: normalizarItens(registro.itens),
    desconto: Number(registro.desconto) || 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">
        Orçamento {registro.numero}
      </h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Edite os dados e gere novamente o PDF quando quiser.
      </p>
      <OrcamentoForm lang={lang} config={config} orcamentoInicial={orcamento} />
    </div>
  );
}
