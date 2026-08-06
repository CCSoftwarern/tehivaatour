import Link from "next/link";
import { ExternalLink, FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { brl, normalizarItens, valorTotal } from "@/lib/orcamento";
import { DeleteButton } from "@/components/admin/delete-button";
import { CopiarLink } from "@/components/admin/orcamento/copiar-link";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";
import type { Orcamento } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrcamentos({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orcamentos")
    .select("*")
    .order("created_at", { ascending: false });

  const orcamentos = (data ?? []).map((o) => ({
    ...(o as Orcamento),
    itens: normalizarItens((o as Orcamento).itens),
    desconto: Number((o as Orcamento).desconto) || 0,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-primary-dark">
            <FileText size={24} /> Orçamentos
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Gere orçamentos em PDF com cabeçalho, rodapé e marca d&apos;água, e
            compartilhe o link com o cliente.
          </p>
        </div>
        <Link href={`/${lang}/admin/orcamentos/novo`} className={btnPrimary}>
          <Plus size={16} />
          Novo orçamento
        </Link>
      </div>

      {orcamentos.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-ink/30" />
          <p className="font-bold text-primary-dark">Nenhum orçamento ainda</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink/50">
            Crie o primeiro orçamento: informe o cliente, adicione os itens (com
            imagem opcional) e gere o PDF com um clique.
          </p>
          <Link href={`/${lang}/admin/orcamentos/novo`} className={`${btnPrimary} mt-5`}>
            <Plus size={16} />
            Criar primeiro orçamento
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orcamentos.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {o.numero}
                  </span>
                  {o.pdf_url ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                      PDF gerado
                    </span>
                  ) : (
                    <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-semibold text-ink/60">
                      Sem PDF
                    </span>
                  )}
                </div>
                <h3 className="mt-1 truncate font-bold text-primary-dark">
                  {o.cliente_nome || "Cliente"}
                </h3>
                <p className="text-sm text-ink/50">
                  {brl(valorTotal(o.itens, o.desconto))} ·{" "}
                  {new Date(o.created_at).toLocaleDateString(
                    lang === "pt" ? "pt-BR" : "en-US",
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {o.pdf_url && (
                  <a
                    href={o.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btnSecondary}
                  >
                    <ExternalLink size={14} />
                    Abrir PDF
                  </a>
                )}
                {o.pdf_url && <CopiarLink url={o.pdf_url} />}
                <Link
                  href={`/${lang}/admin/orcamentos/${o.id}`}
                  className={btnSecondary}
                >
                  Editar
                </Link>
                <DeleteButton tabela="orcamentos" id={o.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
