import type { Locale } from "./i18n";

export function formatCurrency(
  value: number | null | undefined,
  locale: Locale,
): string {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(
  value: string | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function normalizeWhatsApp(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

export function buildWhatsAppLink(
  whatsapp: string | null | undefined,
  message?: string,
): string {
  const number = normalizeWhatsApp(whatsapp);
  if (!number) return "";
  const base = `https://wa.me/${number}`;
  if (message) return `${base}?text=${encodeURIComponent(message)}`;
  return base;
}
