import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";
import { mascararCpf, mascararTelefone } from "@/lib/cliente";
import type { Cliente } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminClientes({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .order("nome", { ascending: true });

  const clientes = (data ?? []) as Cliente[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-primary-dark">
            <Users size={24} /> Clientes
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Cadastro de clientes usado nas vendas de pacotes e turísticos.
          </p>
        </div>
        <Link href={`/${lang}/admin/clientes/novo`} className={btnPrimary}>
          <Plus size={16} />
          Novo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-ink/30" />
          <p className="font-bold text-primary-dark">Nenhum cliente cadastrado</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink/50">
            Cadastre nome, CPF, contato e endereço para reutilizar nas vendas.
          </p>
          <Link href={`/${lang}/admin/clientes/novo`} className={`${btnPrimary} mt-5`}>
            <Plus size={16} />
            Cadastrar primeiro cliente
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {clientes.map((c) => {
            const contato = [c.email, mascararTelefone(c.telefone)].filter(Boolean).join(" · ");
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-primary-dark">{c.nome || "Sem nome"}</h3>
                    {!c.ativo && (
                      <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-semibold text-ink/60">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink/50">
                    {[
                      c.cpf ? `CPF ${mascararCpf(c.cpf)}` : null,
                      contato || null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {(c.cidade || c.uf) && (
                    <p className="text-sm text-ink/40">
                      {[c.cidade, c.uf].filter(Boolean).join("/")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/${lang}/admin/clientes/${c.id}/editar`}
                    className={btnSecondary}
                  >
                    Editar
                  </Link>
                  <DeleteButton tabela="clientes" id={c.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
