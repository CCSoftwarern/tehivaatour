import Link from "next/link";
import Image from "next/image";
import { Brush, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { GaleriaAcoes } from "@/components/admin/art-editor/galeria-acoes";
import { btnPrimary } from "@/components/admin/ui";
import type { Arte } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminArtes({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("artes")
    .select("*")
    .order("updated_at", { ascending: false });

  const artes = (data ?? []) as Arte[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-primary-dark">
            <Brush size={24} /> Editor de arte
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Crie posts para o Instagram e status do WhatsApp com as cores da
            agência. Escolha um modelo, personalize e baixe em PNG.
          </p>
        </div>
        <Link href={`/${lang}/admin/artes/novo`} className={btnPrimary}>
          <Plus size={16} />
          Novo design
        </Link>
      </div>

      {artes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <Brush className="mx-auto mb-3 h-10 w-10 text-ink/30" />
          <p className="font-bold text-primary-dark">Nenhum design salvo ainda</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink/50">
            Crie o primeiro post em segundos: escolha um modelo pronto ou gere
            direto de um pacote da agência.
          </p>
          <Link href={`/${lang}/admin/artes/novo`} className={`${btnPrimary} mt-5`}>
            <Plus size={16} />
            Criar primeiro design
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artes.map((arte) => (
            <div
              key={arte.id}
              className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
            >
              <Link
                href={`/${lang}/admin/artes/${arte.id}`}
                className="block aspect-square bg-slate-100"
              >
                {arte.thumb_url ? (
                  <Image
                    src={arte.thumb_url}
                    alt={arte.nome}
                    width={360}
                    height={360}
                    className="h-full w-full object-cover transition hover:opacity-90"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-ink/30">
                    <Brush size={36} />
                  </div>
                )}
              </Link>
              <div className="p-4">
                <p className="truncate font-bold text-primary-dark">{arte.nome}</p>
                <p className="mb-3 text-xs text-ink/50">
                  {new Date(arte.updated_at ?? arte.created_at).toLocaleDateString(
                    lang === "pt" ? "pt-BR" : "en-US",
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${lang}/admin/artes/${arte.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
                  >
                    Editar
                  </Link>
                  <GaleriaAcoes arte={arte} />
                  <DeleteButton tabela="artes" id={arte.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
