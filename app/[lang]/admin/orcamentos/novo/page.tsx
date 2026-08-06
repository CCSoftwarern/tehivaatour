import { getSiteConfig } from "@/lib/queries";
import { OrcamentoForm } from "@/components/admin/orcamento/orcamento-form";

export const dynamic = "force-dynamic";

export default async function AdminOrcamentoNovo({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const config = await getSiteConfig();

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Novo orçamento</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Preencha os dados do cliente e os itens. Depois gere o PDF para obter o
        link de envio.
      </p>
      <OrcamentoForm lang={lang} config={config} />
    </div>
  );
}
