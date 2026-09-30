import { ContaForm } from "@/components/admin/conta-form";

export const dynamic = "force-dynamic";

export default async function AdminContaNova({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Nova conta bancária</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        O nome é obrigatório. Banco, agência e número podem ser completados depois.
      </p>
      <ContaForm lang={lang} />
    </div>
  );
}