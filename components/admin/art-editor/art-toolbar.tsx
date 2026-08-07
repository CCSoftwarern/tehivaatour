"use client";

import { useRef } from "react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ArrowUpRight,
  Check,
  Circle,
  Copy,
  CopyPlus,
  Download,
  Hexagon,
  ImagePlus,
  LayoutTemplate,
  Minus,
  Package,
  Redo2,
  Save,
  Square,
  Star,
  Triangle,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { TAMANHOS } from "@/lib/arte/constantes";
import { btnPrimary, inputClass } from "../ui";

type Props = {
  nome: string;
  onNome: (n: string) => void;
  largura: number;
  altura: number;
  onTamanho: (w: number, h: number) => void;
  onAdicionarTexto: () => void;
  onArquivoImagem: (file: File) => void;
  onAdicionarForma: (tipo: "retangulo" | "circulo" | "linha" | "triangulo" | "estrela" | "poligono" | "seta") => void;
  podeDesfazer: boolean;
  podeRefazer: boolean;
  onDesfazer: () => void;
  onRefazer: () => void;
  onTemplates: () => void;
  onPacote: () => void;
  onSalvar: () => void;
  onCopiar: () => void;
  onBaixar: () => void;
  salvando: boolean;
  salvo: boolean;
  temSelecao: boolean;
  onDuplicarSelecao: () => void;
  onExcluirSelecao: () => void;
  onFrenteSelecao: () => void;
  onTrasSelecao: () => void;
  zoom?: number;
  onZoom?: (z: number) => void;
  onZoomPos?: (pos: { x: number; y: number }) => void;
};

const botaoAcao =
  "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/80 hover:bg-surface hover:border-primary/40 transition-colors disabled:opacity-40";

export function ArtToolbar(props: Props) {
  const arquivoRef = useRef<HTMLInputElement>(null);

  const tamanhoAtual = TAMANHOS.find(
    (t) => t.largura === props.largura && t.altura === props.altura,
  )?.id;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-3 shadow-sm">
      <input
        value={props.nome}
        onChange={(e) => props.onNome(e.target.value)}
        placeholder="Nome do design"
        className={`${inputClass} w-44`}
      />

      <select
        value={tamanhoAtual ?? "custom"}
        onChange={(e) => {
          const t = TAMANHOS.find((x) => x.id === e.target.value);
          if (t) props.onTamanho(t.largura, t.altura);
        }}
        className={`${inputClass} w-52`}
      >
        <option value="custom">
          Personalizado · {props.largura}×{props.altura}
        </option>
        {TAMANHOS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome} · {t.largura}×{t.altura}
          </option>
        ))}
      </select>

      <span className="mx-1 hidden h-6 w-px bg-line md:block" />

      <button type="button" onClick={props.onAdicionarTexto} className={botaoAcao}>
        <Type size={14} /> Texto
      </button>
      <button
        type="button"
        onClick={() => arquivoRef.current?.click()}
        className={botaoAcao}
      >
        <ImagePlus size={14} /> Imagem
      </button>
      <button type="button" onClick={() => props.onAdicionarForma("retangulo")} className={botaoAcao}>
        <Square size={14} /> Quadrado
      </button>
      <button type="button" onClick={() => props.onAdicionarForma("circulo")} className={botaoAcao}>
        <Circle size={14} /> Círculo
      </button>
      <button type="button" onClick={() => props.onAdicionarForma("triangulo")} className={botaoAcao}>
        <Triangle size={14} /> Triângulo
      </button>
      <button type="button" onClick={() => props.onAdicionarForma("estrela")} className={botaoAcao}>
        <Star size={14} /> Estrela
      </button>
      <button type="button" onClick={() => props.onAdicionarForma("poligono")} className={botaoAcao}>
        <Hexagon size={14} /> Polígono
      </button>
      <button type="button" onClick={() => props.onAdicionarForma("seta")} className={botaoAcao}>
        <ArrowUpRight size={14} /> Seta
      </button>
      <button type="button" onClick={() => props.onAdicionarForma("linha")} className={botaoAcao}>
        <Minus size={14} /> Linha
      </button>
      <input
        ref={arquivoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) props.onArquivoImagem(f);
          e.target.value = "";
        }}
      />

      <span className="mx-1 hidden h-6 w-px bg-line md:block" />

      {props.temSelecao && (
        <>
          <button type="button" onClick={props.onDuplicarSelecao} className={botaoAcao}>
            <CopyPlus size={14} /> Duplicar
          </button>
          <button type="button" onClick={props.onFrenteSelecao} className={botaoAcao}>
            <ArrowUpToLine size={14} />
          </button>
          <button type="button" onClick={props.onTrasSelecao} className={botaoAcao}>
            <ArrowDownToLine size={14} />
          </button>
          <button type="button" onClick={props.onExcluirSelecao} className={`${botaoAcao} text-red-600 hover:bg-red-50`}>
            <Trash2 size={14} />
          </button>
        </>
      )}

      <span className="mx-1 hidden h-6 w-px bg-line md:block" />

      <button type="button" onClick={props.onDesfazer} disabled={!props.podeDesfazer} className={botaoAcao}>
        <Undo2 size={14} /> Desfazer
      </button>
      <button type="button" onClick={props.onRefazer} disabled={!props.podeRefazer} className={botaoAcao}>
        <Redo2 size={14} /> Refazer
      </button>

      <span className="mx-1 hidden h-6 w-px bg-line md:block" />

      <button type="button" onClick={props.onTemplates} className={botaoAcao}>
        <LayoutTemplate size={14} /> Modelos
      </button>
      <button type="button" onClick={props.onPacote} className={botaoAcao}>
        <Package size={14} /> Post de pacote
      </button>

      <span className="mx-1 hidden h-6 w-px bg-line md:block" />

      <button
        type="button"
        onClick={props.onCopiar}
        className={`${botaoAcao} border-primary/40 text-primary`}
      >
        <Copy size={14} /> Copiar
      </button>
      <button type="button" onClick={props.onBaixar} className={botaoAcao}>
        <Download size={14} /> Baixar
      </button>
      <button type="button" onClick={props.onSalvar} disabled={props.salvando} className={btnPrimary}>
        {props.salvando ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : props.salvo ? (
          <Check size={14} />
        ) : (
          <Save size={14} />
        )}
        {props.salvo ? "Salvo" : "Salvar"}
      </button>
    </div>
  );
}
