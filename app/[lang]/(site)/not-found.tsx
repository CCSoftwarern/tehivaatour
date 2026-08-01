"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const lang = pathname?.split("/")[1] === "en" ? "en" : "pt";

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-7xl font-black text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-primary-dark">
        {lang === "pt" ? "Página não encontrada" : "Page not found"}
      </h1>
      <p className="mt-2 text-ink/60">
        {lang === "pt"
          ? "A página que você procura não existe ou foi movida."
          : "The page you are looking for does not exist or has been moved."}
      </p>
      <Link
        href={`/${lang}`}
        className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
      >
        {lang === "pt" ? "Voltar ao início" : "Back to home"}
      </Link>
    </div>
  );
}
