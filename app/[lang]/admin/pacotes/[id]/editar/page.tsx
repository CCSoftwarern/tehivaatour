import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PacoteForm } from "@/components/admin/pacote-form";
import type { Pacote } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPacoteEditar({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("pacotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Editar pacote</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Atualize as informações e salve.
      </p>
      <PacoteForm lang={lang} pacote={data as Pacote} />
    </div>
  );
}
