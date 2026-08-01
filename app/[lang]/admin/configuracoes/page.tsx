import { getSiteConfig } from "@/lib/queries";
import { ConfiguracaoForm } from "@/components/admin/configuracao-form";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoes() {
  const config = await getSiteConfig();
  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Configurações</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Textos, contato e cores do site — salvos no banco e aplicados em tempo
        real.
      </p>
      <ConfiguracaoForm config={config} />
    </div>
  );
}
