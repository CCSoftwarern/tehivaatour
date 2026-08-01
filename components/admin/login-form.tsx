"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "./ui";

type Props = {
  lang: string;
};

export function LoginForm({ lang }: Props) {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setPending(true);
    const formData = new FormData(event.currentTarget);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (error) {
        setErro("E-mail ou senha inválidos.");
        setPending(false);
        return;
      }
      router.push(`/${lang}/admin`);
      router.refresh();
    } catch {
      setErro("Não foi possível entrar. Verifique a configuração do Supabase.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className={labelClass}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@email.com"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </div>
      {erro && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors"
      >
        <Lock size={16} />
        {pending ? "Entrando..." : "Entrar"}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-ink/50">
        <LogIn size={12} />
        Área restrita para administradores.
      </p>
    </form>
  );
}
