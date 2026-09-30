import Link from "next/link";
import { CalendarX2, Plane, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { normalizarVenda } from "@/lib/venda";
import { agruparEmbarques, hojeIso } from "@/lib/embarque";
import { EmbarqueFiltros } from "@/components/admin/embarque/embarque-filtros";
import { EmbarqueCard } from "@/components/admin/embarque/embarque-card";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";
import type { Cliente, Entrada, Venda } from "@/lib/types";

export const dynamic = "force-dynamic";

const primeiro = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function AdminEmbarques({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  const sp = await searchParams;

  const hoje = hojeIso();
  const de = primeiro(sp.de) || hoje;
  const ate = primeiro(sp.ate);
  const busca = primeiro(sp.q).trim().toLowerCase();

  const supabase = await createClient();

  let consulta = supabase.from("vendas").select("*").not("data_viagem", "is", null);
  consulta = consulta.gte("data_viagem", de);
  if (ate) consulta = consulta.lte("data_viagem", ate);

  const [{ data: vendasData }, { data: clientesData }] = await Promise.all([
    consulta.order("data_viagem", { ascending: true }),
    supabase.from("clientes").select("id, nome, telefone"),
  ]);

  const vendas = (vendasData ?? []).map((v) => normalizarVenda(v as Partial<Venda>));
  const clientes = new Map(
    (clientesData ?? []).map((c) => [
      c.id as string,
      { nome: (c as Cliente).nome ?? "", telefone: (c as Cliente).telefone ?? null },
    ]),
  );

  // Só as vendas com data dentro do recorte entram nas entradas, senão a consulta
  // traria o histórico inteiro para filtrar no servidor.
  const ids = vendas.map((v) => v.id);
  const { data: entradasData } = ids.length
    ? await supabase.from("entradas").select("*").in("venda_id", ids)
    : { data: [] as unknown[] };

  const entradas = (entradasData ?? []) as Entrada[];
  const { grupos, canceladas, semData } = agruparEmbarques(vendas, entradas, clientes);

  const filtrados = busca
    ? grupos.filter((g) =>
        g.passageiros.some((p) =>
          [p.cliente, p.venda.pacote_nome, p.venda.destino, p.venda.numero]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(busca),
        ),
      )
    : grupos;

  const totalPax = filtrados.reduce((s, g) => s + g.pax, 0);
  const totalVendas = filtrados.reduce((s, g) => s + g.vendas, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-primary-dark">
            <Plane size={24} /> Embarques
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Passageiros que embarcam por data, a partir das vendas cadastradas.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <EmbarqueFiltros lang={lang} de={de} ate={ate} busca={busca} />
      </div>

      {filtrados.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-ink/50">Datas de embarque</p>
            <p className="mt-1 text-2xl font-black text-primary-dark">{filtrados.length}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-ink/50">Grupos</p>
            <p className="mt-1 text-2xl font-black text-primary-dark">{totalVendas}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-ink/50">Passageiros</p>
            <p className="mt-1 text-2xl font-black text-primary-dark">{totalPax}</p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {filtrados.map((grupo) => (
          <EmbarqueCard key={grupo.data} grupo={grupo} />
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <CalendarX2 className="mx-auto mb-3 h-10 w-10 text-ink/30" />
          <p className="font-bold text-primary-dark">Nenhum embarque no período</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink/50">
            Verifique o intervalo de datas ou consulte as vendas sem data de viagem
            definida.
          </p>
          <Link href={`/${lang}/admin/vendas`} className={`${btnSecondary} mt-5`}>
            Ir para vendas
          </Link>
        </div>
      )}

      {semData.length > 0 && (
        <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <h2 className="flex items-center gap-2 font-bold text-primary-dark">
            <TriangleAlert size={18} className="text-accent" />
            {semData.length} venda{semData.length === 1 ? "" : "s"} sem data de viagem
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            Essas vendas não aparecem nos embarques até você informar a data.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {semData.slice(0, 8).map((v) => (
              <li key={v.id} className="text-ink/70">
                <Link
                  href={`/${lang}/admin/vendas/${v.id}`}
                  className="font-medium text-primary-dark underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                >
                  {v.numero}
                </Link>
                {v.cliente_id && (
                  <span className="text-ink/50"> — {clientes.get(v.cliente_id)?.nome}</span>
                )}
                {v.pacote_nome && <span className="text-ink/50"> — {v.pacote_nome}</span>}
              </li>
            ))}
            {semData.length > 8 && (
              <li className="text-ink/50">e mais {semData.length - 8}...</li>
            )}
          </ul>
        </div>
      )}

      {canceladas.length > 0 && (
        <p className="mt-6 text-center text-sm text-ink/50">
          {canceladas.length} venda{canceladas.length === 1 ? "" : "s"} cancelada
          {canceladas.length === 1 ? "" : "s"} no período, ignorada
          {canceladas.length === 1 ? "" : "s"} nos embarques.{" "}
          <Link href={`/${lang}/admin/vendas`} className="underline underline-offset-2">
            Ver vendas
          </Link>
        </p>
      )}

      <div className="mt-8">
        <Link href={`/${lang}/admin/vendas/novo`} className={btnPrimary}>
          Lançar venda
        </Link>
      </div>
    </div>
  );
}