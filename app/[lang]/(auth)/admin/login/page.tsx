import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSiteConfig } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    config,
  ] = await Promise.all([supabase.auth.getUser(), getSiteConfig()]);

  if (user) {
    redirect(`/${lang}/admin`);
  }

  const empresa = config.site_nome?.trim() || "TehivaTour";
  const iniciais = empresa.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen grid place-items-center bg-primary-dark px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            {config.logo_url ? (
              <Image
                src={config.logo_url}
                alt={empresa}
                width={168}
                height={56}
                priority
                className="mx-auto h-14 w-auto max-w-[180px] object-contain"
              />
            ) : (
              <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-primary text-white font-black text-2xl">
                {iniciais}
              </span>
            )}
            <h1 className="mt-4 text-2xl font-black text-primary-dark">{empresa} Admin</h1>
            <p className="mt-1 text-sm text-ink/50">Acesse para gerenciar o site</p>
          </div>
          <LoginForm lang={lang} />
        </div>
        <p className="mt-6 text-center">
          <Link
            href={`/${lang}`}
            className="text-sm text-white/70 hover:text-white underline"
          >
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
