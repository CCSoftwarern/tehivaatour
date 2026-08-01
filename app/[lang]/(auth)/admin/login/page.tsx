import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(`/${lang}/admin`);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-primary-dark px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-primary text-white font-black text-2xl">
              T
            </span>
            <h1 className="mt-4 text-2xl font-black text-primary-dark">
              TehivaTour Admin
            </h1>
            <p className="mt-1 text-sm text-ink/50">
              Acesse para gerenciar o site
            </p>
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
