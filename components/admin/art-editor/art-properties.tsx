"use client";

import { ArrowDownToLine, ArrowUpToLine, Copy, Trash2 } from "lucide-react";
import {
  CORES,
  FONTES,
} from "@/lib/arte/constantes";
import { medirAlturaTexto } from "@/lib/arte/medir";
import type {
  ArtElemento,
  ArtFundo,
  ArtImagem,
  ArtLinha,
  ArtRetangulo,
  ArtTexto,
} from "@/lib/arte/tipos";
import { ImageUpload } from "../imagem-upload";
import { btnDanger, btnSecondary, inputClass, labelClass } from "../ui";
import type { ConfigRecord } from "@/lib/config";

type Props = {
  selecionado: ArtElemento | null;
  config: ConfigRecord;
  fundo: ArtFundo;
  largura: number;
  altura: number;
  onAtualizar: (id: string, parcial: Partial<ArtElemento>) => void;
  onExcluir: (id: string) => void;
  onDuplicar: (id: string) => void;
  trazerFrente: (id: string) => void;
  trazerTras: (id: string) => void;
  onFundo: (fundo: ArtFundo) => void;
};

export function ArtProperties({
  selecionado,
  fundo,
  onAtualizar,
  onExcluir,
  onDuplicar,
  trazerFrente,
  trazerTras,
  onFundo,
}: Props) {
  if (!selecionado) {
    return (
      <div className="space-y-5">
        <h3 className="font-bold text-primary-dark">Fundo e tela</h3>
        <CampoFundo fundo={fundo} onChange={onFundo} />
        <p className="rounded-xl bg-surface p-3 text-xs text-ink/50">
          Selecione um elemento no canvas para editar texto, imagem, formas,
          camadas e rotação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-primary-dark">
        {rotuloTipo(selecionado.tipo)}
      </h3>

      {selecionado.tipo === "texto" && (
        <PainelTexto el={selecionado} onAtualizar={onAtualizar} />
      )}
      {selecionado.tipo === "imagem" && (
        <PainelImagem el={selecionado} onAtualizar={onAtualizar} />
      )}
      {selecionado.tipo === "retangulo" && (
        <PainelRetangulo el={selecionado} onAtualizar={onAtualizar} />
      )}
      {selecionado.tipo === "circulo" && (
        <PainelCirculo el={selecionado} onAtualizar={onAtualizar} />
      )}
      {selecionado.tipo === "linha" && (
        <PainelLinha el={selecionado} onAtualizar={onAtualizar} />
      )}

      <div className="border-t border-line pt-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onDuplicar(selecionado.id)} className={btnSecondary}>
            <Copy size={14} /> Duplicar
          </button>
          <button type="button" onClick={() => trazerFrente(selecionado.id)} className={btnSecondary}>
            <ArrowUpToLine size={14} /> Frente
          </button>
          <button type="button" onClick={() => trazerTras(selecionado.id)} className={btnSecondary}>
            <ArrowDownToLine size={14} /> Trás
          </button>
          <button type="button" onClick={() => onExcluir(selecionado.id)} className={btnDanger}>
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function rotuloTipo(tipo: ArtElemento["tipo"]): string {
  const map: Record<ArtElemento["tipo"], string> = {
    texto: "Texto",
    imagem: "Imagem",
    retangulo: "Retângulo",
    circulo: "Círculo",
    linha: "Linha",
  };
  return map[tipo];
}

function PainelTexto({
  el,
  onAtualizar,
}: {
  el: ArtTexto;
  onAtualizar: Props["onAtualizar"];
}) {
  const atualizar = (parcial: Partial<ArtTexto>) => {
    const base = { ...el, ...parcial };
    const altura = medirAlturaTexto(
      base.texto,
      base.fonte,
      base.tamanho,
      base.width,
      base.lineHeight,
    );
    onAtualizar(el.id, { ...parcial, height: altura });
  };
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Texto</label>
        <textarea
          rows={3}
          value={el.texto}
          onChange={(e) => atualizar({ texto: e.target.value })}
          className={`${inputClass} resize-none`}
        />
      </div>
      <div>
        <label className={labelClass}>Fonte</label>
        <select
          value={el.fonte}
          onChange={(e) => atualizar({ fonte: e.target.value })}
          className={inputClass}
          style={{ fontFamily: el.fonte }}
        >
          {FONTES.map((f) => (
            <option key={f.nome} value={f.nome}>
              {f.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tamanho</label>
          <input
            type="number"
            min={8}
            max={400}
            value={el.tamanho}
            onChange={(e) => atualizar({ tamanho: Number(e.target.value) || 8 })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Cor</label>
          <CorInput valor={el.cor} onChange={(c) => atualizar({ cor: c })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Espaçamento</label>
          <input
            type="number"
            min={0}
            max={20}
            value={el.letterSpacing}
            onChange={(e) => atualizar({ letterSpacing: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Altura da linha</label>
          <input
            type="number"
            min={0.8}
            max={2.5}
            step={0.1}
            value={el.lineHeight}
            onChange={(e) => atualizar({ lineHeight: Number(e.target.value) || 1.2 })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => atualizar({ bold: !el.bold })}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold ${el.bold ? "bg-primary text-white" : "bg-surface text-ink/70"}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => atualizar({ italic: !el.italic })}
          className={`rounded-lg px-3 py-1.5 text-sm italic ${el.italic ? "bg-primary text-white" : "bg-surface text-ink/70"}`}
        >
          I
        </button>
        <div className="ml-2 flex overflow-hidden rounded-lg border border-line">
          {(["esquerda", "centro", "direita"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => atualizar({ alinhamento: a })}
              className={`px-3 py-1.5 text-xs font-semibold capitalize ${el.alinhamento === a ? "bg-primary text-white" : "bg-white text-ink/60"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
          <input
            type="checkbox"
            checked={el.destaque}
            onChange={(e) => atualizar({ destaque: e.target.checked })}
            className="h-4 w-4 accent-[var(--cor-primaria)]"
          />
          Destaque (fundo colorido)
        </label>
        {el.destaque && (
          <div className="mt-3 space-y-3">
            <CorInput valor={el.destaqueCor} onChange={(c) => atualizar({ destaqueCor: c })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Arredondar</label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={el.destaqueRadius}
                  onChange={(e) => atualizar({ destaqueRadius: Number(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Margem</label>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={el.destaquePadding}
                  onChange={(e) => atualizar({ destaquePadding: Number(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <CampoComum el={el} onAtualizar={onAtualizar} />
    </div>
  );
}

function PainelImagem({
  el,
  onAtualizar,
}: {
  el: ArtImagem;
  onAtualizar: Props["onAtualizar"];
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Imagem</label>
        <ImageUpload value={el.url} onChange={(url) => onAtualizar(el.id, { url: url ?? "" })} pasta="artes" />
      </div>
      <div>
        <label className={labelClass}>Ajuste</label>
        <div className="flex overflow-hidden rounded-lg border border-line">
          {(["cover", "contem"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onAtualizar(el.id, { ajuste: a })}
              className={`flex-1 px-3 py-2 text-sm capitalize ${el.ajuste === a ? "bg-primary text-white" : "bg-white text-ink/60"}`}
            >
              {a === "cover" ? "Preencher" : "Ajustar"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelClass}>Canto arredondado</label>
        <input
          type="number"
          min={0}
          max={400}
          value={el.cornerRadius}
          onChange={(e) => onAtualizar(el.id, { cornerRadius: Number(e.target.value) || 0 })}
          className={inputClass}
        />
      </div>
      <CampoComum el={el} onAtualizar={onAtualizar} />
    </div>
  );
}

function PainelRetangulo({
  el,
  onAtualizar,
}: {
  el: ArtRetangulo;
  onAtualizar: Props["onAtualizar"];
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Cor</label>
        <CorInput valor={el.cor} onChange={(c) => onAtualizar(el.id, { cor: c })} />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
          <input
            type="checkbox"
            checked={Boolean(el.cor2)}
            onChange={(e) =>
              onAtualizar(el.id, { cor2: e.target.checked ? "#0b2447" : undefined })
            }
            className="h-4 w-4 accent-[var(--cor-primaria)]"
          />
          Gradiente
        </label>
        {el.cor2 && (
          <div className="mt-2">
            <CorInput
              valor={el.cor2}
              onChange={(c) => onAtualizar(el.id, { cor2: c })}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Arredondar</label>
          <input
            type="number"
            min={0}
            max={400}
            value={el.radius}
            onChange={(e) => onAtualizar(el.id, { radius: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Contorno (px)</label>
          <input
            type="number"
            min={0}
            max={40}
            value={el.larguraContorno}
            onChange={(e) => onAtualizar(el.id, { larguraContorno: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
      </div>
      {el.larguraContorno > 0 && (
        <div>
          <label className={labelClass}>Cor do contorno</label>
          <CorInput
            valor={el.contorno || "#000000"}
            onChange={(c) => onAtualizar(el.id, { contorno: c })}
          />
        </div>
      )}
      <CampoComum el={el} onAtualizar={onAtualizar} />
    </div>
  );
}

function PainelCirculo({
  el,
  onAtualizar,
}: {
  el: Extract<ArtElemento, { tipo: "circulo" }>;
  onAtualizar: Props["onAtualizar"];
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Cor</label>
        <CorInput valor={el.cor} onChange={(c) => onAtualizar(el.id, { cor: c })} />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
          <input
            type="checkbox"
            checked={Boolean(el.cor2)}
            onChange={(e) =>
              onAtualizar(el.id, { cor2: e.target.checked ? "#0b2447" : undefined })
            }
            className="h-4 w-4 accent-[var(--cor-primaria)]"
          />
          Gradiente
        </label>
        {el.cor2 && (
          <div className="mt-2">
            <CorInput
              valor={el.cor2}
              onChange={(c) => onAtualizar(el.id, { cor2: c })}
            />
          </div>
        )}
      </div>
      <div>
        <label className={labelClass}>Contorno (px)</label>
        <input
          type="number"
          min={0}
          max={40}
          value={el.larguraContorno}
          onChange={(e) => onAtualizar(el.id, { larguraContorno: Number(e.target.value) || 0 })}
          className={inputClass}
        />
      </div>
      {el.larguraContorno > 0 && (
        <div>
          <label className={labelClass}>Cor do contorno</label>
          <CorInput
            valor={el.contorno || "#000000"}
            onChange={(c) => onAtualizar(el.id, { contorno: c })}
          />
        </div>
      )}
      <CampoComum el={el} onAtualizar={onAtualizar} />
    </div>
  );
}

function PainelLinha({
  el,
  onAtualizar,
}: {
  el: ArtLinha;
  onAtualizar: Props["onAtualizar"];
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Cor</label>
        <CorInput valor={el.cor} onChange={(c) => onAtualizar(el.id, { cor: c })} />
      </div>
      <div>
        <label className={labelClass}>Espessura</label>
        <input
          type="number"
          min={1}
          max={60}
          value={el.larguraContorno}
          onChange={(e) => onAtualizar(el.id, { larguraContorno: Number(e.target.value) || 1 })}
          className={inputClass}
        />
      </div>
      <CampoComum el={el} onAtualizar={onAtualizar} />
    </div>
  );
}

function CampoComum({
  el,
  onAtualizar,
}: {
  el: ArtElemento;
  onAtualizar: Props["onAtualizar"];
}) {
  return (
    <div className="space-y-3 border-t border-line pt-3">
      <div>
        <label className={labelClass}>
          Opacidade: {Math.round(el.opacity * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={el.opacity}
          onChange={(e) => onAtualizar(el.id, { opacity: Number(e.target.value) })}
          className="w-full accent-[var(--cor-primaria)]"
        />
      </div>
      <div>
        <label className={labelClass}>Rotação: {el.rotation}°</label>
        <input
          type="range"
          min={-180}
          max={180}
          step={5}
          value={el.rotation}
          onChange={(e) => onAtualizar(el.id, { rotation: Number(e.target.value) })}
          className="w-full accent-[var(--cor-primaria)]"
        />
      </div>
      <p className="text-xs text-ink/50">
        Arraste para mover · use as alças para redimensionar.
      </p>
    </div>
  );
}

function CampoFundo({
  fundo,
  onChange,
}: {
  fundo: ArtFundo;
  onChange: (fundo: ArtFundo) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex overflow-hidden rounded-lg border border-line">
        {(["cor", "gradiente", "imagem"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() =>
              onChange(
                t === "cor"
                  ? { tipo: "cor", cor: fundo.tipo === "cor" ? fundo.cor : "#ffffff" }
                  : t === "gradiente"
                    ? {
                        tipo: "gradiente",
                        cor: "#0b2447",
                        cor2: "#1e6fd9",
                      }
                    : { tipo: "imagem", url: "" },
              )
            }
            className={`flex-1 px-2 py-2 text-xs font-semibold capitalize ${fundo.tipo === t ? "bg-primary text-white" : "bg-white text-ink/60"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {fundo.tipo === "cor" && (
        <div>
          <label className={labelClass}>Cor de fundo</label>
          <CorInput valor={fundo.cor} onChange={(c) => onChange({ tipo: "cor", cor: c })} />
        </div>
      )}

      {fundo.tipo === "gradiente" && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Cor 1</label>
            <CorInput
              valor={fundo.cor}
              onChange={(c) => onChange({ tipo: "gradiente", cor: c, cor2: fundo.cor2 })}
            />
          </div>
          <div>
            <label className={labelClass}>Cor 2</label>
            <CorInput
              valor={fundo.cor2}
              onChange={(c) => onChange({ tipo: "gradiente", cor: fundo.cor, cor2: c })}
            />
          </div>
        </div>
      )}

      {fundo.tipo === "imagem" && (
        <div>
          <label className={labelClass}>Imagem de fundo</label>
          <ImageUpload
            value={fundo.url || null}
            onChange={(url) =>
              onChange({ tipo: "imagem", url: url ?? "" })
            }
            pasta="artes"
          />
        </div>
      )}
    </div>
  );
}

export function CorInput({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(valor) ? valor : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-white p-0.5"
      />
      <div className="flex flex-wrap gap-1.5">
        {CORES.slice(0, 18).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-6 w-6 rounded-md border ${
              valor.toLowerCase() === c.toLowerCase()
                ? "ring-2 ring-primary ring-offset-1"
                : "border-line"
            }`}
            style={{ background: c }}
            aria-label={c}
          />
        ))}
      </div>
    </div>
  );
}
