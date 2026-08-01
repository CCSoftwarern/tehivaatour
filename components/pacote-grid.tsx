import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { Pacote } from "@/lib/types";
import { PacoteCard } from "./pacote-card";

type Props = {
  pacotes: Pacote[];
  lang: Locale;
  dict: Dictionary;
};

export function PacoteGrid({ pacotes, lang, dict }: Props) {
  if (pacotes.length === 0) {
    return (
      <p className="text-center text-ink/60 bg-white rounded-2xl border border-line py-16">
        {dict.pacotes.sem_pacotes}
      </p>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pacotes.map((pacote) => (
        <PacoteCard key={pacote.id} pacote={pacote} lang={lang} dict={dict} />
      ))}
    </div>
  );
}
