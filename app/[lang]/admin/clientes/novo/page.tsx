import { ClienteForm } from "@/components/admin/cliente-form";

export const dynamic = "force-dynamic";

export default async function AdminClienteNovo({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Novo cliente</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Só o nome é obrigatório. Os demais dados podem ser completados depois.
      </p>
      <ClienteForm lang={lang} />
    </div>
  );
}
