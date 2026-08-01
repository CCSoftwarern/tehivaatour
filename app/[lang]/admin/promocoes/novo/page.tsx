import { PromocaoForm } from "@/components/admin/promocao-form";

export const dynamic = "force-dynamic";

export default async function AdminPromocaoNovo({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Nova promoção</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Preencha os campos e salve para publicar no site.
      </p>
      <PromocaoForm lang={lang} />
    </div>
  );
}
