import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/format";

type Props = {
  whatsapp: string;
  message?: string;
  label?: string;
};

export function WhatsAppLink({ whatsapp, message, label }: Props) {
  const href = buildWhatsAppLink(whatsapp, message);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-green-500 text-white px-6 py-3 text-sm font-semibold hover:bg-green-600 transition-colors"
    >
      <MessageCircle size={18} />
      {label || "WhatsApp"}
    </a>
  );
}

export function FloatingWhatsApp({ whatsapp }: { whatsapp: string }) {
  const href = buildWhatsAppLink(whatsapp);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-105 transition-all"
    >
      <MessageCircle size={26} />
    </a>
  );
}
