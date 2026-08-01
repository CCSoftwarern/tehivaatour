import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";
import type { Promocao } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPromocoes({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("promocoes")
    .select("*")
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false });

  const promocoes = (data ?? []) as Promocao[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary-dark">Promoções</h1>
          <p className="mt-1 text-sm text-ink/50">
            As que passaram do vencimento somem do site automaticamente.
          </p>
        </div>
        <Link href={`/${lang}/admin/promocoes/novo`} className={btnPrimary}>
          <Plus size={16} />
          Nova promoção
        </Link>
      </div>

      {promocoes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
          Nenhuma promoção cadastrada ainda.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {promocoes.map((p) => {
            const vencida =
              p.vencimento && new Date(p.vencimento) < new Date();
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-primary-dark">
                      {p.titulo_pt}
                    </h3>
                    {p.destaque && (
                      <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                        Destaque
                      </span>
                    )}
                    {vencida ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                        Vencida
                      </span>
                    ) : p.ativo ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                        Ativa
                      </span>
                    ) : (
                      <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-semibold text-ink/60">
                        Inativa
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink/50">
                    {p.titulo_en} ·{" "}
                    {p.preco_promocional
                      ? `R$ ${p.preco_promocional}`
                      : "sem preço"}
                  </p>
                  {p.vencimento && (
                    <p className="mt-0.5 text-xs text-ink/40">
                      Vence em{" "}
                      {new Date(p.vencimento).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/${lang}/admin/promocoes/${p.id}/editar`}
                    className={btnSecondary}
                  >
                    Editar
                  </Link>
                  <DeleteButton tabela="promocoes" id={p.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
