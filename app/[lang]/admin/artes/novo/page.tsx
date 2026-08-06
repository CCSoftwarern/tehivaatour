import { templatePromocao } from "@/lib/arte/templates";
import { getSiteConfig } from "@/lib/queries";
import { ArtEditor } from "@/components/admin/art-editor/art-editor";

export const dynamic = "force-dynamic";

export default async function AdminArtesNovo({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const config = await getSiteConfig();
  const design = templatePromocao(config);

  return (
    <div className="h-[calc(100vh-5rem)]">
      <ArtEditor lang={lang} designInicial={design} config={config} />
    </div>
  );
}
