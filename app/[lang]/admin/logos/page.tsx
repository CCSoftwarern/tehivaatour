import { createClient } from "@/lib/supabase/server";
import { LogosAdmin } from "@/components/admin/logos-admin";
import type { Logo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminLogos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("logos")
    .select("*")
    .order("ordem", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-black text-primary-dark">
        Logos do rodapé
      </h1>
      <p className="mt-1 mb-8 text-sm text-ink/50">
        Logos de operadoras e certificados exibidos no rodapé do site. Você pode
        reordenar, ocultar ou remover.
      </p>
      <LogosAdmin logos={(data ?? []) as Logo[]} />
    </div>
  );
}
