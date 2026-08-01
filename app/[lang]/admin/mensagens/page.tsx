import { createClient } from "@/lib/supabase/server";
import { MensagemAcoes } from "@/components/admin/mensagem-acoes";
import { statusBadgeClass } from "@/components/admin/ui";
import type { Contato } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminMensagens({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("contatos")
    .select("*")
    .order("created_at", { ascending: false });

  const contatos = (data ?? []) as Contato[];
  const novA = contatos.filter((c) => c.status === "nova").length;

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Mensagens</h1>
      <p className="mt-1 text-sm text-ink/50">
        {novA > 0
          ? `${novA} mensagem(ns) nova(s) para responder.`
          : "Todas as mensagens foram tratadas."}
      </p>

      {contatos.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
          Nenhuma mensagem recebida ainda.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {contatos.map((c) => (
            <div
              key={c.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                c.status === "nova" ? "border-accent/40 ring-1 ring-accent/20" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-primary-dark">{c.nome}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(c.status)}`}
                    >
                      {c.status === "nova"
                        ? "Nova"
                        : c.status === "lida"
                          ? "Lida"
                          : "Arquivada"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink/40">
                    {new Date(c.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <MensagemAcoes contato={c} />
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {c.email && (
                  <p>
                    <a
                      href={`mailto:${c.email}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.email}
                    </a>
                  </p>
                )}
                {c.telefone && <p className="text-ink/70">{c.telefone}</p>}
                <p className="mt-2 rounded-xl bg-surface px-4 py-3 text-ink/80">
                  {c.mensagem}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
