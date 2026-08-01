import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PromocaoForm } from "@/components/admin/promocao-form";
import type { Promocao } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPromocaoEditar({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("promocoes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Editar promoção</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Atualize as informações e salve.
      </p>
      <PromocaoForm lang={lang} promocao={data as Promocao} />
    </div>
  );
}
