import { ServicoForm } from "@/components/admin/servico-form";

export const dynamic = "force-dynamic";

export default async function AdminServicoNovo({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Novo serviço</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Preencha os campos e salve para publicar no site.
      </p>
      <ServicoForm lang={lang} />
    </div>
  );
}
