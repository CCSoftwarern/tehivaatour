import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContaForm } from "@/components/admin/conta-form";
import type { Conta } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminContaEditar({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("contas").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();

  const conta = data as Conta;
  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">
        Editar {conta.nome || "conta"}
      </h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">Atualize os dados e salve.</p>
      <ContaForm lang={lang} conta={conta} />
    </div>
  );
}