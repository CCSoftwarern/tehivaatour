"use client";

import { useEffect, useState } from "react";
import { Loader2, Package, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatarPreco, type ItemPost } from "@/lib/arte/templates";

type Props = {
  onFechar: () => void;
  onEscolher: (item: ItemPost) => void;
};

type Linha = ItemPost & { fonte: string; id: string };

export function ArtPacoteModal({ onFechar, onEscolher }: Props) {
  const [itens, setItens] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const lista: Linha[] = [];
      const { data: pacotes } = await supabase
        .from("pacotes")
        .select("id, titulo_pt, preco, imagem, categoria")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(30);
      for (const p of pacotes ?? []) {
        lista.push({
          id: p.id,
          fonte: "pacote",
          titulo: p.titulo_pt,
          preco: p.preco,
          preco_promocional: null,
          imagem: p.imagem,
          categoria: p.categoria,
        });
      }
      const { data: promocoes } = await supabase
        .from("promocoes")
        .select("id, titulo_pt, preco, preco_promocional, imagem")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(30);
      for (const p of promocoes ?? []) {
        lista.push({
          id: p.id,
          fonte: "promocao",
          titulo: p.titulo_pt,
          preco: p.preco,
          preco_promocional: p.preco_promocional,
          imagem: p.imagem,
          categoria: "promoção",
        });
      }
      setItens(lista);
      setCarregando(false);
    })();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onFechar}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-primary-dark">
              <Package size={20} /> Criar post de pacote
            </h2>
            <p className="text-sm text-ink/50">
              O post é gerado com a foto, título, preço e WhatsApp da agência.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full bg-surface p-2 text-ink/60 hover:bg-line"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {carregando ? (
            <div className="flex items-center justify-center gap-2 py-16 text-ink/50">
              <Loader2 size={18} className="animate-spin" /> Carregando...
            </div>
          ) : itens.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink/50">
              Nenhum pacote ou promoção cadastrado ainda. Cadastre um em
              &quot;Pacotes&quot; ou &quot;Promoções&quot; e volte aqui.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {itens.map((item) => (
                <button
                  key={`${item.fonte}-${item.id}`}
                  type="button"
                  onClick={() =>
                    onEscolher({
                      titulo: item.titulo,
                      preco: item.preco,
                      preco_promocional: item.preco_promocional,
                      imagem: item.imagem,
                      categoria: item.categoria,
                    })
                  }
                  className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left shadow-sm transition hover:border-primary hover:shadow-md"
                >
                  {item.imagem ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imagem}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-surface text-ink/40">
                      <Package size={20} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary-dark">
                      {item.titulo}
                    </p>
                    <p className="text-xs text-ink/50">
                      {item.fonte === "promocao" ? "Promoção" : "Pacote"}
                      {item.preco_promocional != null && (
                        <span className="ml-2 font-bold text-destaque">
                          {formatarPreco(item.preco_promocional)}
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
