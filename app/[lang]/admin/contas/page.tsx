import Link from "next/link";
import { Landmark, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";
import type { Conta } from "@/lib/types";

export const dynamic = "force-dynamic";

const rotuloTipo: Record<string, string> = {
  corrente: "Conta corrente",
  poupanca: "Poupança",
};

export default async function AdminContas({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();

  const [{ data: contas }, { data: entradas }, { data: vendas }] = await Promise.all([
    supabase.from("contas").select("*").order("nome", { ascending: true }),
    supabase.from("entradas").select("venda_id, conta_id, valor"),
    supabase.from("vendas").select("id, status"),
  ]);

  const lista = (contas ?? []) as Conta[];
  const canceladas = new Set(
    (vendas ?? []).filter((v) => v.status === "cancelada").map((v) => v.id as string),
  );

  const entradasPorConta = new Map<string, number>();
  for (const e of entradas ?? []) {
    if (!e.conta_id || canceladas.has(e.venda_id as string)) continue;
    const chave = e.conta_id as string;
    entradasPorConta.set(
      chave,
      (entradasPorConta.get(chave) ?? 0) + (Number(e.valor) || 0),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-primary-dark">
            <Landmark size={24} /> Contas bancárias
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Contas que recebem as vendas. Use nas entradas para saber onde cada
            pagamento caiu.
          </p>
        </div>
        <Link href={`/${lang}/admin/contas/nova`} className={btnPrimary}>
          <Plus size={16} />
          Nova conta
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <Landmark className="mx-auto mb-3 h-10 w-10 text-ink/30" />
          <p className="font-bold text-primary-dark">Nenhuma conta cadastrada</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink/50">
            Cadastre a conta corrente ou poupança da agência para vincular nas
            entradas das vendas.
          </p>
          <Link href={`/${lang}/admin/contas/nova`} className={`${btnPrimary} mt-5`}>
            <Plus size={16} />
            Cadastrar primeira conta
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {lista.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-primary-dark">{c.nome || "Sem nome"}</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {rotuloTipo[c.tipo] ?? c.tipo}
                  </span>
                  {!c.ativa && (
                    <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-semibold text-ink/60">
                      Inativa
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink/50">
                  {[
                    c.banco,
                    c.agencia ? `Ag. ${c.agencia}` : null,
                    c.numero ? `Conta ${c.numero}` : null,
                    c.titular,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Sem dados bancários"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-ink/50">Recebido</p>
                  <p className="font-bold text-primary-dark">
                    R$ {(entradasPorConta.get(c.id) ?? 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <Link href={`/${lang}/admin/contas/${c.id}/editar`} className={btnSecondary}>
                  Editar
                </Link>
                <DeleteButton tabela="contas" id={c.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}