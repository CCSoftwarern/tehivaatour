import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";
import type { Pacote } from "@/lib/types";

export const dynamic = "force-dynamic";

const catLabel: Record<string, string> = {
  pacote: "Pacote",
  cruzeiro: "Cruzeiro",
  seguro: "Seguro",
};

export default async function AdminPacotes({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("pacotes")
    .select("*")
    .order("created_at", { ascending: false });

  const pacotes = (data ?? []) as Pacote[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary-dark">Pacotes</h1>
          <p className="mt-1 text-sm text-ink/50">
            Pacotes de viagem, cruzeiros e seguros exibidos no site.
          </p>
        </div>
        <Link href={`/${lang}/admin/pacotes/novo`} className={btnPrimary}>
          <Plus size={16} />
          Novo pacote
        </Link>
      </div>

      {pacotes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
          Nenhum pacote cadastrado ainda.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {pacotes.map((p) => {
            const vencido = p.vencimento && new Date(p.vencimento) < new Date();
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-primary-dark">{p.titulo_pt}</h3>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {catLabel[p.categoria] ?? p.categoria}
                    </span>
                    {vencido ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                        Vencido
                      </span>
                    ) : p.ativo ? (
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
                    /{lang}/pacotes/{p.slug} ·{" "}
                    {p.preco ? `R$ ${p.preco}` : "sem preço"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/${lang}/admin/pacotes/${p.id}/editar`}
                    className={btnSecondary}
                  >
                    Editar
                  </Link>
                  <DeleteButton tabela="pacotes" id={p.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
