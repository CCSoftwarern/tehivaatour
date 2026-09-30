import { Plane } from "lucide-react";
import { btnSecondary } from "@/components/admin/ui";

type Props = {
  lang: string;
  de: string;
  ate: string;
  busca: string;
};

export function EmbarqueFiltros({ lang, de, ate, busca }: Props) {
  return (
    <form
      method="get"
      action={`/${lang}/admin/embarques`}
      className="rounded-2xl border border-line bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Embarcando de</label>
          <input
            type="date"
            name="de"
            defaultValue={de}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Até</label>
          <input
            type="date"
            name="ate"
            defaultValue={ate}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Buscar</label>
          <input
            name="q"
            defaultValue={busca}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Cliente, pacote, destino..."
          />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className={btnSecondary}>
            Consultar
          </button>
          <a
            href={`/${lang}/admin/embarques`}
            className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-ink/50 hover:text-ink"
          >
            Limpar
          </a>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink/50">
        <Plane size={14} />
        Os embarques vêm das vendas com data de viagem definida. Passegadores
        cancelados não entram.
      </p>
    </form>
  );
}