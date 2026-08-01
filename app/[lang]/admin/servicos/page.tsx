import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";
import type { Servico } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminServicos({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("servicos")
    .select("*")
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: true });

  const servicos = (data ?? []) as Servico[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary-dark">Serviços</h1>
          <p className="mt-1 text-sm text-ink/50">
            Diferenciais e serviços exibidos na seção &quot;Por que viajar
            conosco&quot;.
          </p>
        </div>
        <Link href={`/${lang}/admin/servicos/novo`} className={btnPrimary}>
          <Plus size={16} />
          Novo serviço
        </Link>
      </div>

      {servicos.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
          Nenhum serviço cadastrado ainda.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {servicos.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-primary-dark">{s.titulo_pt}</h3>
                  {s.ativo ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                      Ativo
                    </span>
                  ) : (
                    <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-semibold text-ink/60">
                      Inativo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink/50">
                  {s.titulo_en} · ordem {s.ordem ?? 0}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/${lang}/admin/servicos/${s.id}/editar`}
                  className={btnSecondary}
                >
                  Editar
                </Link>
                <DeleteButton tabela="servicos" id={s.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
