import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/admin/login`);
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav lang={lang} />
      <div className="flex-1 min-w-0 bg-surface">
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
