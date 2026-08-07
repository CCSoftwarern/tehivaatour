"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import {
  Circle,
  Group,
  Image as KonvaImage,
  Layer,
  Line as KonvaLine,
  Rect,
  Stage,
  Text as KonvaText,
  Star as KonvaStar,
  RegularPolygon,
  Arrow as KonvaArrow,
} from "react-konva";
import type { ArtDesign, ArtElemento, ArtFundo, ArtImagem, ArtTexto } from "@/lib/arte/tipos";
import { useArtImagem } from "./use-art-imagem";

type Alca = { dx: -1 | 0 | 1; dy: -1 | 0 | 1 };

type DragState = {
  id: string;
  alca?: Alca | "rotacao";
  inicio: { x: number; y: number; width: number; height: number; rotation: number };
  ponteiro: { x: number; y: number };
  mexido: boolean;
};

type Mover = (pos: { x: number; y: number }, d: DragState, dx: number, dy: number) => void;

type Props = {
  estado: ArtDesign;
  selecionadoId: string | null;
  onSelecionar: (id: string | null) => void;
  onDragStart: (antes: ArtDesign) => void;
  onChange: (novo: ArtDesign) => void;
  onDragEnd: () => void;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  zoom: number;
  zoomPos: { x: number; y: number };
  onZoomPos: (pos: { x: number; y: number }) => void;
  onFitEscala: (escala: number) => void;
};

const ALCAS: { fx: number; fy: number; dx: -1 | 0 | 1; dy: -1 | 0 | 1 }[] = [
  { fx: 0, fy: 0, dx: -1, dy: -1 },
  { fx: 0.5, fy: 0, dx: 0, dy: -1 },
  { fx: 1, fy: 0, dx: 1, dy: -1 },
  { fx: 0, fy: 0.5, dx: -1, dy: 0 },
  { fx: 1, fy: 0.5, dx: 1, dy: 0 },
  { fx: 0, fy: 1, dx: -1, dy: 1 },
  { fx: 0.5, fy: 1, dx: 0, dy: 1 },
  { fx: 1, fy: 1, dx: 1, dy: 1 },
];

export function ArtStage({
  estado,
  selecionadoId,
  onSelecionar,
  onDragStart,
  onChange,
  onDragEnd,
  stageRef,
  zoom,
  zoomPos,
  onZoomPos,
  onFitEscala,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const estadoRef = useRef(estado);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  const [fit, setFit] = useState({ escala: 1 });

  const recalcularFit = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const largura = Math.max(280, r.width);
    const altura = Math.max(280, r.height);
    const escala = Math.min(1, largura / estadoRef.current.largura, altura / estadoRef.current.altura);
    setFit({ escala });
    onFitEscala(escala);
  }, [onFitEscala]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      recalcularFit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalcularFit]);

  useEffect(() => {
    recalcularFit();
  }, [estado.largura, estado.altura, recalcularFit]);

  // Keyboard nudge for selected element
  useEffect(() => {
    if (!selecionadoId) return;
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
      const step = e.shiftKey ? 10 : 1;
      let dx = 0, dy = 0;
      switch (e.key) {
        case "ArrowLeft": dx = -step; break;
        case "ArrowRight": dx = step; break;
        case "ArrowUp": dy = -step; break;
        case "ArrowDown": dy = step; break;
        default: return;
      }
      e.preventDefault();
      const el = estadoRef.current.elementos.find((x) => x.id === selecionadoId);
      if (!el) return;
      onChange({
        ...estadoRef.current,
        elementos: estadoRef.current.elementos.map((x) =>
          x.id === selecionadoId ? { ...x, x: x.x + dx, y: x.y + dy } : x,
        ),
      });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selecionadoId, onChange]);

  const scale = fit.escala * zoom;

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const wrapper = canvasWrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      // Mouse position relative to wrapper (canvas content)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      // Convert to canvas coordinates (before zoom)
      const canvasMouseX = mouseX / scale;
      const canvasMouseY = mouseY / scale;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
      const newScale = fit.escala * newZoom;
      // New scroll position to keep mouse point fixed on same canvas point
      const newScrollLeft = canvasMouseX * newScale - mouseX;
      const newScrollTop = canvasMouseY * newScale - mouseY;
      const container = rootRef.current;
      if (container) {
        container.scrollLeft = Math.max(0, newScrollLeft);
        container.scrollTop = Math.max(0, newScrollTop);
      }
      onZoomPos({ x: newScrollLeft / newScale, y: newScrollTop / newScale });
    },
    [zoom, scale, fit.escala, onZoomPos]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button === 1 || (e.button === 0 && (e.shiftKey || e.altKey))) {
        e.preventDefault();
        const container = rootRef.current;
        if (!container) return;
        isPanningRef.current = true;
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          scrollLeft: container.scrollLeft,
          scrollTop: container.scrollTop,
        };
        container.style.cursor = "grabbing";
        const moveHandler = (ev: PointerEvent) => {
          if (!isPanningRef.current) return;
          const container2 = rootRef.current;
          if (!container2) return;
          const dx = ev.clientX - panStartRef.current.x;
          const dy = ev.clientY - panStartRef.current.y;
          container2.scrollLeft = panStartRef.current.scrollLeft - dx;
          container2.scrollTop = panStartRef.current.scrollTop - dy;
          onZoomPos({ x: container2.scrollLeft / scale, y: container2.scrollTop / scale });
        };
        const upHandler = () => {
          isPanningRef.current = false;
          const container2 = rootRef.current;
          if (container2) container2.style.cursor = zoom > 1 ? "grab" : "default";
          window.removeEventListener("pointermove", moveHandler);
          window.removeEventListener("pointerup", upHandler);
        };
        window.addEventListener("pointermove", moveHandler);
        window.addEventListener("pointerup", upHandler);
      }
    },
    [zoom, scale, onZoomPos]
  );

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;
    const targetX = zoomPos.x * scale;
    const targetY = zoomPos.y * scale;
    if (Math.abs(container.scrollLeft - targetX) > 1 || Math.abs(container.scrollTop - targetY) > 1) {
      container.scrollLeft = targetX;
      container.scrollTop = targetY;
    }
  }, [zoomPos, scale]);

  const selecionado =
    estado.elementos.find((e) => e.id === selecionadoId) ?? null;

  const dragRef = useRef<DragState | null>(null);

  const mover = useCallback<Mover>(
    (pos, d, dx, dy) => {
      const des = estadoRef.current;
      const el = des.elementos.find((x) => x.id === d.id);
      if (!el) return;
      if (d.alca === "rotacao") {
        const cx = d.inicio.x + d.inicio.width / 2;
        const cy = d.inicio.y + d.inicio.height / 2;
        const ang = (Math.atan2(pos.y - cy, pos.x - cx) * 180) / Math.PI;
        const rot = Math.round((ang + 90) / 5) * 5;
        onChange({
          ...des,
          elementos: des.elementos.map((x) =>
            x.id === d.id ? { ...x, rotation: rot } : x,
          ),
        });
        return;
      }
      if (d.alca) {
        const a = (d.inicio.rotation * Math.PI) / 180;
        const cos = Math.cos(-a);
        const sin = Math.sin(-a);
        const px = pos.x - d.inicio.x;
        const py = pos.y - d.inicio.y;
        const lx = px * cos - py * sin;
        const ly = px * sin + py * cos;
        const { inicio } = d;
        let nx = inicio.x;
        let ny = inicio.y;
        let nw = inicio.width;
        let nh = inicio.height;
        if (d.alca.dx === -1) {
          nx = inicio.x + lx;
          nw = inicio.width - lx;
        }
        if (d.alca.dx === 1) {
          nw = lx;
        }
        if (d.alca.dy === -1) {
          ny = inicio.y + ly;
          nh = inicio.height - ly;
        }
        if (d.alca.dy === 1) {
          nh = ly;
        }
        nw = Math.max(20, nw);
        nh = Math.max(20, nh);
        onChange({
          ...des,
          elementos: des.elementos.map((x) =>
            x.id === d.id
              ? { ...x, x: nx, y: ny, width: nw, height: nh }
              : x,
          ),
        });
        return;
      }
      onChange({
        ...des,
        elementos: des.elementos.map((x) =>
          x.id === d.id
            ? { ...x, x: d.inicio.x + dx, y: d.inicio.y + dy }
            : x,
        ),
      });
    },
    [onChange],
  );

  const soltar = useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  const handlersRef = useRef<{ mover: Mover; soltar: () => void } | null>(null);
  useEffect(() => {
    handlersRef.current = { mover, soltar };
  }, [mover, soltar]);

  useEffect(() => {
    function moverEvento(e: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      const h = handlersRef.current;
      if (!h) return;
      const stage = stageRef.current;
      if (!stage) return;
      stage.setPointersPositions(e);
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const dx = pos.x - d.ponteiro.x;
      const dy = pos.y - d.ponteiro.y;
      if (dx !== 0 || dy !== 0) d.mexido = true;
      h.mover(pos, d, dx, dy);
    }
    function soltarEvento() {
      const d = dragRef.current;
      if (!d) return;
      const h = handlersRef.current;
      dragRef.current = null;
      if (d.mexido && h) h.soltar();
    }
    window.addEventListener("pointermove", moverEvento);
    window.addEventListener("pointerup", soltarEvento);
    window.addEventListener("pointercancel", soltarEvento);
    return () => {
      window.removeEventListener("pointermove", moverEvento);
      window.removeEventListener("pointerup", soltarEvento);
      window.removeEventListener("pointercancel", soltarEvento);
    };
  }, [stageRef]);

  function iniciarDrag(
    e: Konva.KonvaEventObject<PointerEvent>,
    id: string,
    alca?: Alca | "rotacao",
  ) {
    e.cancelBubble = true;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const el = estadoRef.current.elementos.find((x) => x.id === id);
    if (!el) return;
    onSelecionar(id);
    onDragStart(estadoRef.current);
    dragRef.current = {
      id,
      alca,
      inicio: { x: el.x, y: el.y, width: el.width, height: el.height, rotation: el.rotation },
      ponteiro: pos,
      mexido: false,
    };
  }

  function elementoDown(e: Konva.KonvaEventObject<PointerEvent>, id: string) {
    e.evt.preventDefault();
    iniciarDrag(e, id);
  }

return (
    <div
      ref={rootRef}
      className="art-stage-container h-full w-full"
      style={{
        background: "#e2e8f0",
        cursor: zoom > 1 ? "grab" : "default",
        overflow: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelecionar(null);
      }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
    >
      <div
        ref={canvasWrapperRef}
        style={{
          width: estado.largura * scale,
          height: estado.altura * scale,
          position: "relative",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Stage
          ref={stageRef}
          width={estado.largura}
          height={estado.altura}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
          onPointerDown={(e) => {
            if (e.target === e.target.getStage()) onSelecionar(null);
          }}
        >
            <Layer>
              <Fundo fundo={estado.fundo} largura={estado.largura} altura={estado.altura} />
              {estado.elementos.map((el) => (
                <Elemento
                  key={el.tipo === "imagem" ? `${el.id}-${el.url}` : el.id}
                  el={el}
                  onPointerDown={(e) => elementoDown(e, el.id)}
                />
              ))}
            </Layer>
            <Layer name="art-selecao">
              {selecionado && (
                <Group
                  x={selecionado.x}
                  y={selecionado.y}
                  rotation={selecionado.rotation}
                >
                  <Rect
                    x={0}
                    y={0}
                    width={selecionado.width}
                    height={selecionado.height}
                    stroke="#2563eb"
                    strokeWidth={2}
                    dash={[8, 6]}
                    listening={false}
                  />
                  <Rect
                    x={selecionado.width / 2 - 1}
                    y={-26}
                    width={2}
                    height={26}
                    fill="#2563eb"
                    listening={false}
                  />
                  <Circle
                    x={selecionado.width / 2}
                    y={-32}
                    radius={10}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth={2}
                    onPointerDown={(e) => iniciarDrag(e, selecionado.id, "rotacao")}
                  />
                  {ALCAS.map((a) => {
                    const px = a.fx * selecionado.width;
                    const py = a.fy * selecionado.height;
                    return (
                      <Rect
                        key={`${a.fx}-${a.fy}`}
                        x={px - 7}
                        y={py - 7}
                        width={14}
                        height={14}
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth={2}
                        cornerRadius={4}
                        onPointerDown={(e) =>
                          iniciarDrag(e, selecionado.id, { dx: a.dx, dy: a.dy })
                        }
                      />
                    );
                  })}
                </Group>
              )}
            </Layer>
          </Stage>
        </div>
      </div>
  );
}

function Fundo({ fundo, largura, altura }: { fundo: ArtFundo; largura: number; altura: number }) {
  if (fundo.tipo === "imagem") {
    return <FundoImagem key={fundo.url} url={fundo.url} largura={largura} altura={altura} />;
  }
  const fill =
    fundo.tipo === "gradiente"
      ? gradiente(fundo.cor, fundo.cor2, largura, altura)
      : fundo.cor;
  return <Rect width={largura} height={altura} fill={fill} />;
}

function FundoImagem({ url, largura, altura }: { url: string; largura: number; altura: number }) {
  const img = useArtImagem(url);
  if (!img) {
    return <Rect width={largura} height={altura} fill="#e2e8f0" />;
  }
  return (
    <KonvaImage
      image={img}
      width={largura}
      height={altura}
      crop={cropCover(img, largura, altura)}
    />
  );
}

function Elemento({
  el,
  onPointerDown,
}: {
  el: ArtElemento;
  onPointerDown: (e: Konva.KonvaEventObject<PointerEvent>) => void;
}) {
  switch (el.tipo) {
    case "texto":
      return <ElementoTexto el={el} onPointerDown={onPointerDown} />;
    case "imagem":
      return <ElementoImagem el={el} onPointerDown={onPointerDown} />;
    case "retangulo": {
      const fill = el.cor2
        ? gradiente(el.cor, el.cor2, el.width, el.height)
        : el.cor;
      return (
        <Group
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          opacity={el.opacity}
          onPointerDown={onPointerDown}
        >
          <Rect
            width={el.width}
            height={el.height}
            cornerRadius={el.radius}
            fill={fill}
            stroke={el.contorno || undefined}
            strokeWidth={el.larguraContorno}
          />
        </Group>
      );
    }
    case "circulo": {
      const fill = el.cor2
        ? gradiente(el.cor, el.cor2, el.width, el.height)
        : el.cor;
      return (
        <Group
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          opacity={el.opacity}
          onPointerDown={onPointerDown}
        >
          <Circle
            x={el.width / 2}
            y={el.height / 2}
            radius={Math.min(el.width, el.height) / 2}
            fill={fill}
            stroke={el.contorno || undefined}
            strokeWidth={el.larguraContorno}
          />
        </Group>
      );
    }
    case "triangulo": {
      const fill = el.cor2
        ? gradiente(el.cor, el.cor2, el.width, el.height)
        : el.cor;
      return (
        <Group
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          opacity={el.opacity}
          onPointerDown={onPointerDown}
        >
          <RegularPolygon
            x={el.width / 2}
            y={el.height / 2}
            sides={3}
            radius={Math.min(el.width, el.height) / 2}
            fill={fill}
            stroke={el.contorno || undefined}
            strokeWidth={el.larguraContorno}
          />
        </Group>
      );
    }
    case "estrela": {
      const fill = el.cor2
        ? gradiente(el.cor, el.cor2, el.width, el.height)
        : el.cor;
      const rExt = Math.min(el.width, el.height) / 2;
      const rInt = rExt * (el.raioInterno ?? 0.5);
      return (
        <Group
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          opacity={el.opacity}
          onPointerDown={onPointerDown}
        >
          <KonvaStar
            x={el.width / 2}
            y={el.height / 2}
            numPoints={el.pontas ?? 5}
            innerRadius={rInt}
            outerRadius={rExt}
            fill={fill}
            stroke={el.contorno || undefined}
            strokeWidth={el.larguraContorno}
          />
        </Group>
      );
    }
    case "poligono": {
      const fill = el.cor2
        ? gradiente(el.cor, el.cor2, el.width, el.height)
        : el.cor;
      return (
        <Group
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          opacity={el.opacity}
          onPointerDown={onPointerDown}
        >
          <RegularPolygon
            x={el.width / 2}
            y={el.height / 2}
            sides={el.lados ?? 6}
            radius={Math.min(el.width, el.height) / 2}
            fill={fill}
            stroke={el.contorno || undefined}
            strokeWidth={el.larguraContorno}
          />
        </Group>
      );
    }
    case "seta": {
      const fill = el.cor2
        ? gradiente(el.cor, el.cor2, el.width, el.height)
        : el.cor;
      return (
        <Group
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          opacity={el.opacity}
          onPointerDown={onPointerDown}
        >
          <KonvaArrow
            x={0}
            y={el.height / 2}
            points={[0, 0, el.width - (el.pontaComprimento ?? 30), 0]}
            pointerLength={el.pontaComprimento ?? 30}
            pointerWidth={el.pontaLargura ?? 40}
            fill={fill}
            stroke={el.contorno || undefined}
            strokeWidth={el.larguraContorno}
            lineCap="round"
          />
        </Group>
      );
    }
    case "linha":
      return (
        <Group
          x={el.x}
          y={el.y}
          rotation={el.rotation}
          opacity={el.opacity}
          onPointerDown={onPointerDown}
        >
          <KonvaLine
            points={[0, 0, el.width, 0]}
            stroke={el.cor}
            strokeWidth={el.larguraContorno}
            lineCap="round"
          />
        </Group>
      );
    default:
      return null;
  }
}

function ElementoTexto({
  el,
  onPointerDown,
}: {
  el: ArtTexto;
  onPointerDown: (e: Konva.KonvaEventObject<PointerEvent>) => void;
}) {
  const fontStyle = `${el.bold ? "bold" : "normal"} ${el.italic ? "italic" : "normal"}`;
  return (
    <Group
      x={el.x}
      y={el.y}
      rotation={el.rotation}
      opacity={el.opacity}
      onPointerDown={onPointerDown}
    >
      {el.destaque && (
        <Rect
          x={-el.destaquePadding}
          y={-el.destaquePadding}
          width={el.width + el.destaquePadding * 2}
          height={el.height + el.destaquePadding * 2}
          cornerRadius={el.destaqueRadius}
          fill={el.destaqueCor}
        />
      )}
      <KonvaText
        text={el.texto}
        width={el.width}
        fontFamily={el.fonte}
        fontSize={el.tamanho}
        fontStyle={fontStyle}
        fill={el.cor}
        align={el.alinhamento === "centro" ? "center" : el.alinhamento === "direita" ? "right" : "left"}
        letterSpacing={el.letterSpacing}
        lineHeight={el.lineHeight}
      />
    </Group>
  );
}

function ElementoImagem({
  el,
  onPointerDown,
}: {
  el: ArtImagem;
  onPointerDown: (e: Konva.KonvaEventObject<PointerEvent>) => void;
}) {
  const img = useArtImagem(el.url);
  return (
    <Group
      x={el.x}
      y={el.y}
      rotation={el.rotation}
      opacity={el.opacity}
      onPointerDown={onPointerDown}
    >
      {img ? (
        el.ajuste === "contem" ? (
          <ImagemContem img={img} el={el} />
        ) : (
          <KonvaImage
            image={img}
            width={el.width}
            height={el.height}
            crop={cropCover(img, el.width, el.height)}
            cornerRadius={el.cornerRadius}
          />
        )
      ) : (
        <Rect width={el.width} height={el.height} fill="#e2e8f0" cornerRadius={el.cornerRadius} />
      )}
    </Group>
  );
}

function ImagemContem({ img, el }: { img: HTMLImageElement; el: ArtImagem }) {
  const esc = Math.min(el.width / img.width, el.height / img.height);
  const w = img.width * esc;
  const h = img.height * esc;
  const offX = (el.width - w) / 2;
  const offY = (el.height - h) / 2;
  return <KonvaImage image={img} x={offX} y={offY} width={w} height={h} />;
}

function gradiente(
  cor: string,
  cor2: string,
  largura: number,
  altura: number,
): CanvasGradient {
  return {
    startPoint: { x: 0, y: 0 },
    endPoint: { x: largura, y: altura },
    colorStops: [0, cor, 1, cor2],
  } as unknown as CanvasGradient;
}

export function cropCover(
  img: HTMLImageElement,
  boxW: number,
  boxH: number,
): { x: number; y: number; width: number; height: number } {
  const ir = img.width / img.height;
  const er = boxW / boxH;
  let sw = img.width;
  let sh = img.height;
  let sx = 0;
  let sy = 0;
  if (ir > er) {
    sw = img.height * er;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / er;
    sy = (img.height - sh) / 2;
  }
  return { x: sx, y: sy, width: sw, height: sh };
}
