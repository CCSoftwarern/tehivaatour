import { BarChart3 } from "lucide-react";
import { STATUS_VENDA } from "@/lib/venda";
import { btnSecondary } from "@/components/admin/ui";

type Props = {
  lang: string;
  campo: string;
  status: string;
  de: string;
  ate: string;
};

const CAMPOS = [
  { valor: "venda", rotulo: "Data da venda" },
  { valor: "viagem", rotulo: "Data da viagem" },
];

export function RelatorioFiltros({ lang, campo, status, de, ate }: Props) {
  return (
    <form
      method="get"
      action={`/${lang}/admin/relatorios/vendas`}
      className="rounded-2xl border border-line bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Período</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="de"
              defaultValue={de}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-ink/40">até</span>
            <input
              type="date"
              name="ate"
              defaultValue={ate}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Considera</label>
          <select
            name="campo"
            defaultValue={campo}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {CAMPOS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Status</label>
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {STATUS_VENDA.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className={btnSecondary}>
            Filtrar
          </button>
          <a
            href={`/${lang}/admin/relatorios/vendas`}
            className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-ink/50 hover:text-ink"
          >
            Limpar
          </a>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink/50">
        <BarChart3 size={14} />
        As entradas são contadas pela data do pagamento; vendas, pela data escolhida
        acima.
      </p>
    </form>
  );
}