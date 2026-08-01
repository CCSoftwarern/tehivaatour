export const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-ink/40";

export const labelClass = "mb-1.5 block text-sm font-medium text-ink/80";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink/80 hover:bg-surface transition-colors";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-full bg-red-50 text-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-100 transition-colors";

export const cardClass =
  "rounded-2xl bg-white border border-line shadow-sm p-6";

export function statusBadgeClass(status: string): string {
  if (status === "nova") return "bg-accent/15 text-accent";
  if (status === "lida") return "bg-primary/10 text-primary";
  return "bg-line text-ink/60";
}
