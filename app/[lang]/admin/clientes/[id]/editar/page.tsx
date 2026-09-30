import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClienteForm } from "@/components/admin/cliente-form";
import type { Cliente } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminClienteEditar({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">
        Editar {(data as Cliente).nome || "cliente"}
      </h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Atualize os dados e salve.
      </p>
      <ClienteForm lang={lang} cliente={data as Cliente} />
    </div>
  );
}
