import { createClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/queries";
import { ArtEditor } from "@/components/admin/art-editor/art-editor";
import type { ArtDesign, ArtElemento, ArtFundo } from "@/lib/arte/tipos";
import type { Arte } from "@/lib/types";

export const dynamic = "force-dynamic";

function sanitizar(dados: unknown): ArtDesign | null {
  if (!dados || typeof dados !== "object") return null;
  const d = dados as Partial<ArtDesign>;
  if (!Array.isArray(d.elementos)) return null;
  let fundo: ArtFundo = { tipo: "cor", cor: "#ffffff" };
  const f = d.fundo as ArtFundo | undefined;
  if (f && f.tipo === "cor" && typeof f.cor === "string") {
    fundo = { tipo: "cor", cor: f.cor };
  } else if (f && f.tipo === "gradiente" && typeof f.cor === "string" && typeof f.cor2 === "string") {
    fundo = { tipo: "gradiente", cor: f.cor, cor2: f.cor2 };
  } else if (f && f.tipo === "imagem" && typeof f.url === "string") {
    fundo = { tipo: "imagem", url: f.url };
  }
  return {
    versao: 1,
    nome: typeof d.nome === "string" ? d.nome : "Design sem nome",
    largura: typeof d.largura === "number" && d.largura > 0 ? d.largura : 1080,
    altura: typeof d.altura === "number" && d.altura > 0 ? d.altura : 1080,
    fundo,
    elementos: d.elementos as ArtElemento[],
  };
}

export default async function AdminArteEditar({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const config = await getSiteConfig();
  const supabase = await createClient();
  const { data } = await supabase
    .from("artes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const arte = data as Arte | null;

  if (!arte) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
        Design não encontrado.
      </div>
    );
  }

  const design = sanitizar(arte.dados);
  if (!design) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/50">
        Este design está com dados inválidos. Tente abrir novamente ou crie um
        novo.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)]">
      <ArtEditor
        lang={lang}
        designInicial={design}
        config={config}
        arteId={arte.id}
      />
    </div>
  );
}
