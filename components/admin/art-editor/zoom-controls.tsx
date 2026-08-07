"use client";

import { Minus, Plus, RotateCcw, Maximize } from "lucide-react";

type Props = {
  zoom: number;
  onZoom: (z: number) => void;
  onZoomPos: (pos: { x: number; y: number }) => void;
  largura: number;
  altura: number;
  fitEscala: number;
};

export function ZoomControls({ zoom, onZoom, onZoomPos, largura, altura, fitEscala }: Props) {
  const clamp = (v: number) => Math.max(0.1, Math.min(5, v));

  const zoomIn = () => {
    const nz = clamp(zoom * 1.2);
    onZoom(nz);
  };

  const zoomOut = () => {
    const nz = clamp(zoom / 1.2);
    onZoom(nz);
  };

  const resetZoom = () => {
    onZoom(1);
    onZoomPos({ x: 0, y: 0 });
  };

  const fitZoom = () => {
    const container = document.querySelector(".art-stage-container") as HTMLElement | null;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = Math.min(rect.width / largura, rect.height / altura, 1);
    onZoom(scale / fitEscala);
    onZoomPos({ x: 0, y: 0 });
  };

  const pct = Math.round(zoom * 100);

  return (
    <div
      className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-white/95 backdrop-blur border border-line p-2 shadow-lg"
      style={{ zIndex: 10 }}
    >
      <button
        type="button"
        onClick={zoomOut}
        disabled={zoom <= 0.1}
        className="rounded-lg p-1.5 text-ink/70 hover:bg-surface transition-colors disabled:opacity-40"
        title="Diminuir zoom (-)"
        aria-label="Diminuir zoom"
      >
        <Minus size={16} />
      </button>

      <span className="w-16 text-center text-xs font-mono text-ink/80 px-1">
        {pct}%
      </span>

      <button
        type="button"
        onClick={zoomIn}
        disabled={zoom >= 5}
        className="rounded-lg p-1.5 text-ink/70 hover:bg-surface transition-colors disabled:opacity-40"
        title="Aumentar zoom (+)"
        aria-label="Aumentar zoom"
      >
        <Plus size={16} />
      </button>

      <span className="w-px h-6 bg-line mx-1" />

      <button
        type="button"
        onClick={resetZoom}
        className="rounded-lg p-1.5 text-ink/70 hover:bg-surface transition-colors"
        title="Zoom 100%"
        aria-label="Zoom 100%"
      >
        <RotateCcw size={16} />
      </button>

      <button
        type="button"
        onClick={fitZoom}
        className="rounded-lg p-1.5 text-ink/70 hover:bg-surface transition-colors"
        title="Ajustar à tela"
        aria-label="Ajustar à tela"
      >
        <Maximize size={16} />
      </button>
    </div>
  );
}