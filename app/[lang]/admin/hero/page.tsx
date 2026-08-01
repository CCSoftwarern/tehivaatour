import { createClient } from "@/lib/supabase/server";
import { HeroImagensAdmin } from "@/components/admin/hero-imagens-admin";
import type { HeroImagem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminHero() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_imagens")
    .select("*")
    .order("ordem", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">Banner principal</h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Imagens de fundo do topo da página inicial. Elas aparecem em carrossel e
        podem ser reordenadas, ocultadas ou removidas.
      </p>
      <HeroImagensAdmin imagens={(data ?? []) as HeroImagem[]} />
    </div>
  );
}
