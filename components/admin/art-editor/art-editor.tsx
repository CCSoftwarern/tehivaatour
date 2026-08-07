"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type Konva from "konva";
import { createClient } from "@/lib/supabase/client";
import { novoId } from "@/lib/arte/constantes";
import { useHistorico } from "@/lib/arte/historico";
import type { ArtDesign, ArtElemento, ArtFundo, ArtTexto } from "@/lib/arte/tipos";
import {
  criarPostDePacote,
  templateDica,
  templateNovoPacote,
  templatePromocao,
  templateSobre,
  templateNatal,
  templateAnoNovo,
  templateDiaDasMaes,
  templatePascoa,
  templateBlackFriday,
  templateDiaDosPais,
  templateDiaDosNamorados,
  templateCarnaval,
  templateVerao,
  templateInverno,
  type ItemPost,
} from "@/lib/arte/templates";
import type { ConfigRecord } from "@/lib/config";
import { ArtStage } from "./art-stage";
import { ArtToolbar } from "./art-toolbar";
import { ArtProperties } from "./art-properties";
import { ArtTemplates } from "./art-templates";
import { ArtPacoteModal } from "./art-pacote-modal";
import { ZoomControls } from "./zoom-controls";

type Props = {
  lang: string;
  designInicial: ArtDesign;
  config: ConfigRecord;
  arteId?: string;
};

export function ArtEditor({ lang, designInicial, config, arteId }: Props) {
  const router = useRouter();
  const historico = useHistorico(designInicial);
  const { estado, atualizar, comitar, aplicar, desfazer, refazer } = historico;

  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [mostrarTemplates, setMostrarTemplates] = useState(false);
  const [mostrarPacote, setMostrarPacote] = useState(false);
  const [nome, setNome] = useState(designInicial.nome || "Design sem nome");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [fitEscala, setFitEscala] = useState(1);

  const stageRef = useRef<Konva.Stage | null>(null);
  const snapshotRef = useRef<ArtDesign>(estado);

  const selecionado =
    estado.elementos.find((e) => e.id === selecionadoId) ?? null;

  const onDragStart = useCallback((antes: ArtDesign) => {
    snapshotRef.current = antes;
  }, []);
  const onChangeStage = useCallback(
    (novo: ArtDesign) => atualizar(novo),
    [atualizar],
  );
  const onDragEnd = useCallback(() => {
    comitar(snapshotRef.current);
  }, [comitar]);

  const atualizarElemento = useCallback(
    (id: string, parcial: Partial<ArtElemento>) => {
      aplicar((d) => ({
        ...d,
        elementos: d.elementos.map((e) =>
          e.id === id ? ({ ...e, ...parcial } as ArtElemento) : e,
        ),
      }));
    },
    [aplicar],
  );

  const excluirElemento = useCallback(
    (id: string) => {
      aplicar((d) => ({
        ...d,
        elementos: d.elementos.filter((e) => e.id !== id),
      }));
      setSelecionadoId(null);
    },
    [aplicar],
  );

  const duplicarElemento = useCallback(
    (id: string) => {
      const original = estado.elementos.find((e) => e.id === id);
      if (!original) return;
      const novaId = novoId();
      aplicar((d) => ({
        ...d,
        elementos: [
          ...d.elementos,
          { ...original, id: novaId, x: original.x + 28, y: original.y + 28 },
        ],
      }));
      setSelecionadoId(novaId);
    },
    [aplicar, estado.elementos],
  );

  const trazerFrente = useCallback(
    (id: string) => {
      aplicar((d) => {
        const els = [...d.elementos];
        const i = els.findIndex((e) => e.id === id);
        if (i < 0 || i === els.length - 1) return d;
        const [el] = els.splice(i, 1);
        els.push(el);
        return { ...d, elementos: els };
      });
    },
    [aplicar],
  );

  const trazerTras = useCallback(
    (id: string) => {
      aplicar((d) => {
        const els = [...d.elementos];
        const i = els.findIndex((e) => e.id === id);
        if (i <= 0) return d;
        const [el] = els.splice(i, 1);
        els.unshift(el);
        return { ...d, elementos: els };
      });
    },
    [aplicar],
  );

  const adicionarTexto = useCallback(() => {
    const largura = estado.largura;
    const el: ArtTexto = {
      id: novoId(),
      tipo: "texto",
      x: Math.round(largura * 0.08),
      y: 80,
      width: Math.round(largura * 0.84),
      height: 120,
      rotation: 0,
      opacity: 1,
      texto: "Digite seu texto aqui",
      fonte: "Poppins",
      tamanho: Math.round(Math.min(80, largura * 0.07)),
      cor: config.cor_texto || "#1e293b",
      bold: true,
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.2,
      alinhamento: "centro",
      destaque: false,
      destaqueCor: config.cor_destaque || "#ff6b35",
      destaquePadding: 12,
      destaqueRadius: 999,
    };
    aplicar((d) => ({ ...d, elementos: [...d.elementos, el] }));
    setSelecionadoId(el.id);
  }, [aplicar, estado.largura, config]);

  const adicionarForma = useCallback(
    (tipo: "retangulo" | "circulo" | "linha" | "triangulo" | "estrela" | "poligono" | "seta") => {
      const largura = estado.largura;
      const altura = estado.altura;
      const destaque = config.cor_destaque || "#ff6b35";
      const primaria = config.cor_primaria || "#1e6fd9";
      let el: ArtElemento;
      if (tipo === "retangulo") {
        el = {
          id: novoId(),
          tipo: "retangulo",
          x: Math.round((largura - 400) / 2),
          y: Math.round((altura - 300) / 2),
          width: 400,
          height: 300,
          rotation: 0,
          opacity: 1,
          cor: destaque,
          radius: 24,
          larguraContorno: 0,
        };
      } else if (tipo === "circulo") {
        el = {
          id: novoId(),
          tipo: "circulo",
          x: Math.round((largura - 260) / 2),
          y: Math.round((altura - 260) / 2),
          width: 260,
          height: 260,
          rotation: 0,
          opacity: 1,
          cor: primaria,
          larguraContorno: 0,
        };
      } else if (tipo === "triangulo") {
        el = {
          id: novoId(),
          tipo: "triangulo",
          x: Math.round((largura - 260) / 2),
          y: Math.round((altura - 260) / 2),
          width: 260,
          height: 260,
          rotation: 0,
          opacity: 1,
          cor: destaque,
          larguraContorno: 0,
        };
      } else if (tipo === "estrela") {
        el = {
          id: novoId(),
          tipo: "estrela",
          x: Math.round((largura - 260) / 2),
          y: Math.round((altura - 260) / 2),
          width: 260,
          height: 260,
          rotation: 0,
          opacity: 1,
          cor: destaque,
          larguraContorno: 0,
          pontas: 5,
          raioInterno: 0.5,
        };
      } else if (tipo === "poligono") {
        el = {
          id: novoId(),
          tipo: "poligono",
          x: Math.round((largura - 260) / 2),
          y: Math.round((altura - 260) / 2),
          width: 260,
          height: 260,
          rotation: 0,
          opacity: 1,
          cor: primaria,
          larguraContorno: 0,
          lados: 6,
        };
      } else if (tipo === "seta") {
        el = {
          id: novoId(),
          tipo: "seta",
          x: 80,
          y: Math.round(altura / 2),
          width: Math.max(200, largura - 160),
          height: 100,
          rotation: 0,
          opacity: 1,
          cor: destaque,
          larguraContorno: 0,
          pontaComprimento: 30,
          pontaLargura: 40,
        };
      } else {
        el = {
          id: novoId(),
          tipo: "linha",
          x: 80,
          y: Math.round(altura / 2),
          width: Math.max(200, largura - 160),
          height: 10,
          rotation: 0,
          opacity: 1,
          cor: destaque,
          larguraContorno: 10,
        };
      }
      aplicar((d) => ({ ...d, elementos: [...d.elementos, el] }));
      setSelecionadoId(el.id);
    },
    [aplicar, estado.largura, estado.altura, config],
  );

  const enviarImagem = useCallback(
    async (file: File): Promise<string> => {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const caminho = `artes/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("imagens")
        .upload(caminho, file, { upsert: true });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("imagens").getPublicUrl(caminho);
      return data.publicUrl;
    },
    [],
  );

  const adicionarImagem = useCallback(
    async (file: File) => {
      try {
        const url = await enviarImagem(file);
        const largura = estado.largura;
        const altura = estado.altura;
        const w = Math.min(720, Math.round(largura * 0.7));
        const h = Math.min(540, Math.round(altura * 0.6));
        const el: ArtElemento = {
          id: novoId(),
          tipo: "imagem",
          x: Math.round((largura - w) / 2),
          y: Math.round((altura - h) / 2),
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
          url,
          ajuste: "cover",
          cornerRadius: 24,
        };
        aplicar((d) => ({ ...d, elementos: [...d.elementos, el] }));
        setSelecionadoId(el.id);
      } catch (e) {
        alert(
          e && typeof e === "object" && "message" in e
            ? String(e.message)
            : "Falha ao enviar a imagem.",
        );
      }
    },
    [enviarImagem, aplicar, estado.largura, estado.altura],
  );

  const mudarTamanho = useCallback(
    (w: number, h: number) => {
      aplicar((d) => ({ ...d, largura: w, altura: h }));
    },
    [aplicar],
  );

  const aplicarTemplate = useCallback(
    (tipo: "promocao" | "novo_pacote" | "dica" | "sobre" | "natal" | "ano_novo" | "dia_das_maes" | "pascoa" | "black_friday" | "dia_dos_pais" | "dia_dos_namorados" | "carnaval" | "verao" | "inverno") => {
      const construtores = {
        promocao: templatePromocao,
        novo_pacote: templateNovoPacote,
        dica: templateDica,
        sobre: templateSobre,
        natal: templateNatal,
        ano_novo: templateAnoNovo,
        dia_das_maes: templateDiaDasMaes,
        pascoa: templatePascoa,
        black_friday: templateBlackFriday,
        dia_dos_pais: templateDiaDosPais,
        dia_dos_namorados: templateDiaDosNamorados,
        carnaval: templateCarnaval,
        verao: templateVerao,
        inverno: templateInverno,
      };
      aplicar(() => ({ ...construtores[tipo](config), nome }));
      setSelecionadoId(null);
      setMostrarTemplates(false);
    },
    [aplicar, config, nome],
  );

  const pacoteEscolhido = useCallback(
    (item: ItemPost) => {
      aplicar(() => criarPostDePacote(item, config));
      setSelecionadoId(null);
      setMostrarPacote(false);
    },
    [aplicar, config],
  );

  const onFundo = useCallback(
    (fundo: ArtFundo) => {
      aplicar((d) => ({ ...d, fundo }));
    },
    [aplicar],
  );

  async function gerarDataUrl(pixelRatio: number): Promise<string | null> {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* segue */
      }
    }
    const stage = stageRef.current;
    if (!stage) return null;
    const selecao = stage.findOne<Konva.Layer>(".art-selecao");
    if (selecao) selecao.visible(false);
    try {
      return stage.toDataURL({
        pixelRatio,
        x: 0,
        y: 0,
        width: estado.largura,
        height: estado.altura,
      });
    } finally {
      if (selecao) selecao.visible(true);
    }
  }

  function dataUrlParaBlob(dataUrl: string): Blob {
    const [header, b64] = dataUrl.split(",");
    const mime = header.match(/data:(.*?);/)?.[1] ?? "image/png";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  async function baixarPng() {
    const url = await gerarDataUrl(2);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nome.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "post"}.png`;
    a.click();
  }

  async function copiarPng() {
    const url = await gerarDataUrl(2);
    if (!url) return;
    const blob = dataUrlParaBlob(url);
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      alert("Imagem copiada! Agora é só colar no WhatsApp ou no Instagram.");
    } catch {
      baixarPng();
    }
  }

  async function salvar() {
    setSalvando(true);
    setSalvo(false);
    const supabase = createClient();
    const id =
      arteId ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`);
    let thumbUrl: string | null = null;
    try {
      const dataUrl = await gerarDataUrl(0.3);
      if (dataUrl) {
        const blob = dataUrlParaBlob(dataUrl);
        const caminho = `artes/${id}.png`;
        await supabase.storage.from("imagens").upload(caminho, blob, { upsert: true });
        const { data } = supabase.storage.from("imagens").getPublicUrl(caminho);
        thumbUrl = data.publicUrl;
      }
    } catch {
      /* miniatura é opcional */
    }
    const { error } = await supabase
      .from("artes")
      .upsert({ id, nome, dados: estado, thumb_url: thumbUrl });
    setSalvando(false);
    if (error) {
      alert("Erro ao salvar: " + error.message);
      return;
    }
    setSalvo(true);
    window.setTimeout(() => setSalvo(false), 2500);
    router.refresh();
    if (!arteId) {
      router.replace(`/${lang}/admin/artes/${id}`);
    }
  }

  useEffect(() => {
    function teclado(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement | null;
      if (
        alvo &&
        (alvo.tagName === "INPUT" ||
          alvo.tagName === "TEXTAREA" ||
          alvo.tagName === "SELECT")
      ) {
        return;
      }
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        desfazer();
      } else if (ctrl && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        refazer();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selecionadoId) {
        e.preventDefault();
        excluirElemento(selecionadoId);
      }
    }
    window.addEventListener("keydown", teclado);
    return () => window.removeEventListener("keydown", teclado);
  }, [desfazer, refazer, selecionadoId, excluirElemento]);

  return (
    <div className="flex h-full flex-col gap-4">
<ArtToolbar
          nome={nome}
          onNome={setNome}
          largura={estado.largura}
          altura={estado.altura}
          onTamanho={mudarTamanho}
          onAdicionarTexto={adicionarTexto}
          onArquivoImagem={adicionarImagem}
          onAdicionarForma={adicionarForma}
          podeDesfazer={historico.podeDesfazer}
          podeRefazer={historico.podeRefazer}
          onDesfazer={desfazer}
          onRefazer={refazer}
          onTemplates={() => setMostrarTemplates(true)}
          onPacote={() => setMostrarPacote(true)}
          onSalvar={salvar}
          onCopiar={copiarPng}
          onBaixar={baixarPng}
          salvando={salvando}
          salvo={salvo}
          temSelecao={Boolean(selecionado)}
          onDuplicarSelecao={() => selecionadoId && duplicarElemento(selecionadoId)}
          onExcluirSelecao={() => selecionadoId && excluirElemento(selecionadoId)}
          onFrenteSelecao={() => selecionadoId && trazerFrente(selecionadoId)}
          onTrasSelecao={() => selecionadoId && trazerTras(selecionadoId)}
          zoom={zoom}
          onZoom={setZoom}
          onZoomPos={setZoomPos}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <div className="relative min-h-[440px] flex-1 overflow-hidden rounded-2xl border border-line bg-slate-100 lg:min-h-0">
            <ArtStage
              estado={estado}
              selecionadoId={selecionadoId}
              onSelecionar={setSelecionadoId}
              onDragStart={onDragStart}
              onChange={onChangeStage}
              onDragEnd={onDragEnd}
              stageRef={stageRef}
              zoom={zoom}
              zoomPos={zoomPos}
              onZoomPos={setZoomPos}
              onFitEscala={setFitEscala}
            />
            <ZoomControls
              zoom={zoom}
              onZoom={setZoom}
              onZoomPos={setZoomPos}
              largura={estado.largura}
              altura={estado.altura}
              fitEscala={fitEscala}
            />
          </div>
        <aside className="w-full shrink-0 overflow-y-auto rounded-2xl border border-line bg-white p-4 lg:w-80">
          <ArtProperties
            selecionado={selecionado}
            config={config}
            fundo={estado.fundo}
            largura={estado.largura}
            altura={estado.altura}
            onAtualizar={atualizarElemento}
            onExcluir={excluirElemento}
            onDuplicar={duplicarElemento}
            trazerFrente={trazerFrente}
            trazerTras={trazerTras}
            onFundo={onFundo}
          />
        </aside>
      </div>

      {mostrarTemplates && (
        <ArtTemplates
          config={config}
          onFechar={() => setMostrarTemplates(false)}
          onAplicar={aplicarTemplate}
        />
      )}
      {mostrarPacote && (
        <ArtPacoteModal
          onFechar={() => setMostrarPacote(false)}
          onEscolher={pacoteEscolhido}
        />
      )}
    </div>
  );
}
