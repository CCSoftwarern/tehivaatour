"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, FileDown, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  brl,
  gerarPdf,
  novoNumeroOrcamento,
  normalizarItens,
  totaisTarifas,
  totaisTaxas,
  valorTotal,
} from "@/lib/orcamento";
import type { ConfigRecord } from "@/lib/config";
import type { Orcamento, OrcamentoItem } from "@/lib/types";
import { btnDanger, btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from "../ui";
import { novoItem, OrcamentoItemLinha } from "./orcamento-item";

type Props = {
  lang: string;
  config: ConfigRecord;
  orcamentoInicial?: Orcamento | null;
};

export function OrcamentoForm({ lang, config, orcamentoInicial }: Props) {
  const router = useRouter();

  const [numero, setNumero] = useState(orcamentoInicial?.numero ?? novoNumeroOrcamento());
  const [clienteNome, setClienteNome] = useState(orcamentoInicial?.cliente_nome ?? "");
  const [clienteEmail, setClienteEmail] = useState(orcamentoInicial?.cliente_email ?? "");
  const [clienteTelefone, setClienteTelefone] = useState(
    orcamentoInicial?.cliente_telefone ?? "",
  );
  const [validadeDias, setValidadeDias] = useState(orcamentoInicial?.validade_dias ?? 7);
  const [desconto, setDesconto] = useState(orcamentoInicial?.desconto ?? 0);
  const [observacoes, setObservacoes] = useState(orcamentoInicial?.observacoes ?? "");
  const [itens, setItens] = useState<OrcamentoItem[]>(() => {
    const normalizados = normalizarItens(orcamentoInicial?.itens);
    return normalizados.length ? normalizados : [novoItem()];
  });

  const [pdfUrl, setPdfUrl] = useState<string | null>(orcamentoInicial?.pdf_url ?? null);
  const [idAtual, setIdAtual] = useState<string | null>(orcamentoInicial?.id ?? null);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [excluindoPdf, setExcluindoPdf] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");

  const total = valorTotal(itens, desconto);
  const totTarifas = totaisTarifas(itens);
  const totTaxas = totaisTaxas(itens);

  function mudarItem(id: string, novo: OrcamentoItem) {
    setItens((lista) => lista.map((i) => (i.id === id ? novo : i)));
  }

  function removerItem(id: string) {
    setItens((lista) => lista.filter((i) => i.id !== id));
  }

  function moverItem(id: string, direcao: -1 | 1) {
    setItens((lista) => {
      const idx = lista.findIndex((i) => i.id === id);
      const alvo = idx + direcao;
      if (idx < 0 || alvo < 0 || alvo >= lista.length) return lista;
      const nova = [...lista];
      [nova[idx], nova[alvo]] = [nova[alvo], nova[idx]];
      return nova;
    });
  }

  const construirRegistro = useCallback(
    (id: string): Orcamento => ({
      id,
      numero,
      cliente_nome: clienteNome,
      cliente_email: clienteEmail,
      cliente_telefone: clienteTelefone,
      itens,
      desconto,
      observacoes,
      validade_dias: validadeDias,
      pdf_url: pdfUrl,
      created_at: orcamentoInicial?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    [
      numero,
      clienteNome,
      clienteEmail,
      clienteTelefone,
      itens,
      desconto,
      observacoes,
      validadeDias,
      pdfUrl,
      orcamentoInicial,
    ],
  );

  function novoIdCliente(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now());
  }

  async function salvarRegistro(): Promise<Orcamento> {
    const supabase = createClient();
    const id = orcamentoInicial?.id ?? novoIdCliente();
    setIdAtual(id);
    const registro = construirRegistro(id);
    const { error } = await supabase.from("orcamentos").upsert(registro);
    if (error) throw new Error(error.message);
    return registro;
  }

  async function salvar() {
    setErro("");
    setSalvando(true);
    setSalvo(false);
    try {
      const o = await salvarRegistro();
      setSalvo(true);
      window.setTimeout(() => setSalvo(false), 2500);
      router.refresh();
      if (!orcamentoInicial) {
        router.replace(`/${lang}/admin/orcamentos/${o.id}`);
      }
    } catch (e) {
      setErro(
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : "Não foi possível salvar o orçamento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function gerarPdfEEnviar() {
    setErro("");
    setGerando(true);
    setSalvo(false);
    try {
      const o = await salvarRegistro();
      const blob = await gerarPdf({ orcamento: o, config });

      const supabase = createClient();
      const caminho = `orcamentos/${o.id}.pdf`;
      const { error: erroUpload } = await supabase.storage
        .from("imagens")
        .upload(caminho, blob, { upsert: true, contentType: "application/pdf" });
      if (erroUpload) throw new Error(erroUpload.message);

      const { data } = supabase.storage.from("imagens").getPublicUrl(caminho);
      const link = data.publicUrl;
      setPdfUrl(link);
      await supabase.from("orcamentos").update({ pdf_url: link }).eq("id", o.id);

      setSalvo(true);
      router.refresh();
      if (!orcamentoInicial) {
        router.replace(`/${lang}/admin/orcamentos/${o.id}`);
      }
    } catch (e) {
      setErro(
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : "Não foi possível gerar o PDF.",
      );
    } finally {
      setGerando(false);
    }
  }

  async function copiarLink() {
    if (!pdfUrl) return;
    try {
      await navigator.clipboard.writeText(pdfUrl);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copie o link abaixo:", pdfUrl);
    }
  }

  async function excluirPdf() {
    if (!pdfUrl || !idAtual) return;
    if (!window.confirm("Excluir o PDF gerado? O orçamento será mantido.")) return;
    setErro("");
    setExcluindoPdf(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("imagens")
        .remove([`orcamentos/${idAtual}.pdf`]);
      if (error) throw new Error(error.message);
      const { error: erroUpdate } = await supabase
        .from("orcamentos")
        .update({ pdf_url: null })
        .eq("id", idAtual);
      if (erroUpdate) throw new Error(erroUpdate.message);
      setPdfUrl(null);
      setSalvo(true);
      router.refresh();
    } catch (e) {
      setErro(
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : "Não foi possível excluir o PDF.",
      );
    } finally {
      setExcluindoPdf(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Cliente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nome do cliente</label>
            <input
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              className={inputClass}
              placeholder="Ex: Maria Silva"
            />
          </div>
          <div>
            <label className={labelClass}>Número do orçamento</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>E-mail do cliente</label>
            <input
              type="email"
              value={clienteEmail}
              onChange={(e) => setClienteEmail(e.target.value)}
              className={inputClass}
              placeholder="cliente@email.com"
            />
          </div>
          <div>
            <label className={labelClass}>Telefone do cliente</label>
            <input
              value={clienteTelefone}
              onChange={(e) => setClienteTelefone(e.target.value)}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-primary-dark">Itens do orçamento</h2>
          <button
            type="button"
            onClick={() => setItens((lista) => [...lista, novoItem()])}
            className={btnSecondary}
          >
            <Plus size={16} />
            Adicionar item
          </button>
        </div>
        <p className="text-xs text-ink/50">
          Cada item pode ter uma imagem (clique para enviar ou cole com Ctrl+V).
          Escolha {"\"Somente imagem\""} para colar recortes (ex.: trechos aéreos). O
          PDF mostra tarifas, taxas e total.
        </p>

        <div className="space-y-4">
          {itens.map((item, indice) => (
            <OrcamentoItemLinha
              key={item.id}
              item={item}
              onMudar={(n) => mudarItem(item.id, n)}
              onRemover={() => removerItem(item.id)}
              onSubir={() => moverItem(item.id, -1)}
              onDescer={() => moverItem(item.id, 1)}
              primeiro={indice === 0}
              ultimo={indice === itens.length - 1}
            />
          ))}
        </div>

        <div className="ml-auto flex flex-col items-end gap-1 rounded-xl bg-primary/5 px-5 py-3">
          <span className="text-sm text-ink/60">
            Tarifas: <b className="text-ink/80">{brl(totTarifas)}</b>
          </span>
          <span className="text-sm text-ink/60">
            Taxas: <b className="text-ink/80">{brl(totTaxas)}</b>
          </span>
          {desconto > 0 && (
            <span className="text-sm text-ink/60">
              Desconto: <b className="text-red-500">- {brl(desconto)}</b>
            </span>
          )}
          <span className="text-lg font-black text-primary-dark">
            Total: {brl(total)}
          </span>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Detalhes do documento</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Validade (dias)</label>
            <input
              type="number"
              min="1"
              value={validadeDias}
              onChange={(e) => setValidadeDias(Number(e.target.value) || 7)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Desconto (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={Number.isFinite(desconto) ? desconto : ""}
              onChange={(e) => setDesconto(Number(e.target.value) || 0)}
              className={inputClass}
              placeholder="0,00"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Observações</label>
          <textarea
            rows={4}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Formas de pagamento, condições, prazo de confirmação..."
          />
        </div>
      </div>

      {erro && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className={btnSecondary}
        >
          {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {salvando ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={gerarPdfEEnviar}
          disabled={gerando}
          className={btnPrimary}
        >
          {gerando ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          {gerando ? "Gerando PDF..." : "Salvar e gerar PDF"}
        </button>
        {salvo && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Check size={16} />
            Salvo com sucesso!
          </span>
        )}
      </div>

      {pdfUrl && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-3 flex items-center gap-2 font-bold text-emerald-700">
            <ExternalLink size={16} />
            PDF gerado — envie este link para o cliente
          </p>
          <p className="mb-3 break-all rounded-xl bg-white px-4 py-3 text-sm text-ink/70">
            {pdfUrl}
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
              <ExternalLink size={16} />
              Abrir PDF
            </a>
            <button type="button" onClick={copiarLink} className={btnPrimary}>
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
            <button
              type="button"
              onClick={excluirPdf}
              disabled={excluindoPdf}
              className={btnDanger}
              title="Excluir o PDF gerado"
            >
              {excluindoPdf ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {excluindoPdf ? "Excluindo..." : "Excluir PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
