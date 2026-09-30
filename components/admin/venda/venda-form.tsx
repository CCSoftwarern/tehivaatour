"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Loader2, Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  FORMAS_PAGAMENTO,
  STATUS_VENDA,
  novoNumeroVenda,
  normalizarEntrada,
  normalizarVenda,
  saldoVenda,
  somaPercentuaisComissao,
  statusSugerido,
  totalAbatimentos,
  totalComissoes,
  totalDescontos,
  totalPercentuais,
  totalTarifas,
  totalRecebido,
  totalTaxas,
  totalVenda,
} from "@/lib/venda";
import type {
  Cliente,
  Conta,
  Entrada,
  Pacote,
  StatusVenda,
  Venda,
  VendaItem,
} from "@/lib/types";
import { btnPrimary, btnSecondary, cardClass, inputClass, labelClass } from "../ui";
import { ComissaoLinha, novaComissao } from "./comissao-linha";
import { novaVendaItem, VendaItemLinha } from "./venda-item";
import { ClienteVendaSelect } from "./cliente-select";
import { EntradasVenda, novaEntrada } from "./entradas-venda";

type Props = {
  lang: string;
  vendaInicial?: Venda | null;
  clientes: Cliente[];
  pacotes: Pacote[];
  contas: Conta[];
  entradasIniciais?: Entrada[];
};

function hoje(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function VendaForm({
  lang,
  vendaInicial,
  clientes,
  pacotes,
  contas,
  entradasIniciais,
}: Props) {
  const router = useRouter();
  const base = useMemo(() => normalizarVenda(vendaInicial), [vendaInicial]);

  const [numero, setNumero] = useState(base.numero || novoNumeroVenda());
  const [clienteId, setClienteId] = useState(base.cliente_id ?? "");
  const [pacoteId, setPacoteId] = useState(base.pacote_id ?? "");
  const [pacoteNome, setPacoteNome] = useState(base.pacote_nome ?? "");
  const [destino, setDestino] = useState(base.destino ?? "");
  const [dataVenda, setDataVenda] = useState(base.data_venda ?? hoje());
  const [dataViagem, setDataViagem] = useState(base.data_viagem ?? "");
  const [dataRetorno, setDataRetorno] = useState(base.data_retorno ?? "");
  const [quantidadePax, setQuantidadePax] = useState(base.quantidade_pax);
  const [status, setStatus] = useState<StatusVenda>(base.status);
  const [formaPagamento, setFormaPagamento] = useState(base.forma_pagamento ?? "");
  const [observacoes, setObservacoes] = useState(base.observacoes);
  const [itens, setItens] = useState<VendaItem[]>(() =>
    base.itens.length ? base.itens : [novaVendaItem()],
  );
  const [comissoes, setComissoes] = useState(base.comissoes);
  const [entradas, setEntradas] = useState<Entrada[]>(() =>
    (entradasIniciais ?? []).map(normalizarEntrada),
  );

  const [pending, setPending] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  const total = totalVenda(itens);
  const totalComissaoValor = totalComissoes(itens, comissoes);
  const somaPercentuais = somaPercentuaisComissao(comissoes);
  const valorPago = totalRecebido(entradas);
  const saldo = saldoVenda(itens, valorPago);

  function aoEscolherPacote(id: string) {
    setPacoteId(id);
    const pacote = pacotes.find((p) => p.id === id);
    if (pacote) {
      setPacoteNome(pacote.titulo_pt);
      if (!destino) setDestino(pacote.destino_pt ?? "");
    }
  }

  function marcarPago() {
    const existentes = entradas.filter((e) => Number(e.valor) > 0);
    const jaRecebido = totalRecebido(existentes);
    const faltam = total - jaRecebido;
    if (faltam <= 0.009) {
      setEntradas(existentes);
      setStatus(statusSugerido(itens, jaRecebido));
      return;
    }
    const nova = novaEntrada();
    const cartao = contas.find((c) => c.ativa);
    setEntradas([
      ...existentes,
      normalizarEntrada({
        ...nova,
        valor: faltam,
        forma_pagamento: formaPagamento || null,
        conta_id: cartao?.id ?? null,
      }),
    ]);
    setStatus(statusSugerido(itens, total));
  }

  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const nomeItens = itens.find((i) => !i.descricao.trim() && i.tarifa === 0 && i.taxas === 0);
    if (nomeItens) {
      setErro("Preencha ao menos um item com descrição ou valores.");
      return;
    }
    if (somaPercentuais > 100) {
      setErro("A soma dos percentuais de comissão não pode passar de 100%.");
      return;
    }

    const id = base.id || crypto.randomUUID();
    const registro = {
      id,
      numero: numero.trim() || novoNumeroVenda(),
      cliente_id: clienteId || null,
      pacote_id: pacoteId || null,
      pacote_nome: pacoteNome.trim() || null,
      destino: destino.trim() || null,
      data_venda: dataVenda || null,
      data_viagem: dataViagem || null,
      data_retorno: dataRetorno || null,
      quantidade_pax: quantidadePax || 1,
      status,
      itens,
      comissoes: comissoes.filter((c) => c.pessoa.trim() || c.percentual > 0),
      valor_pago: valorPago,
      forma_pagamento: formaPagamento || null,
      observacoes,
      created_at: base.created_at,
      updated_at: new Date().toISOString(),
    };

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("vendas").upsert(registro);
      if (error) {
        setErro(error.message);
        setPending(false);
        return;
      }

      // Entradas: substitui o conjunto da venda (o id da venda já está salvo)
      const validas = entradas.filter((e) => Number(e.valor) > 0);
      if (validas.length > 0) {
        const linhas = validas.map((e) => ({
          id: e.id || crypto.randomUUID(),
          venda_id: id,
          valor: Number(e.valor) || 0,
          data: e.data || null,
          conta_id: e.conta_id || null,
          forma_pagamento: e.forma_pagamento || null,
          observacoes: e.observacoes || null,
        }));
        const { error: erroEntradas } = await supabase.from("entradas").upsert(linhas);
        if (erroEntradas) {
          setErro(`Venda salva, mas as entradas falharam: ${erroEntradas.message}`);
          setPending(false);
          return;
        }
        const idsAtuais = new Set(linhas.map((l) => l.id));
        const antigos = (entradasIniciais ?? [])
          .filter((e) => e.id && !idsAtuais.has(e.id))
          .map((e) => e.id);
        if (antigos.length > 0) {
          await supabase.from("entradas").delete().in("id", antigos);
        }
      } else if ((entradasIniciais ?? []).length > 0) {
        await supabase
          .from("entradas")
          .delete()
          .in("id", (entradasIniciais ?? []).map((e) => e.id));
      }

      setSalvo(true);
      setPending(false);
      router.push(`/${lang}/admin/vendas/${registro.id}`);
      router.refresh();
    } catch {
      setErro("Erro inesperado ao salvar a venda.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Venda</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Número *</label>
            <input value={numero} onChange={(e) => setNumero(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data da venda</label>
            <input
              type="date"
              value={dataVenda}
              onChange={(e) => setDataVenda(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusVenda)}
              className={inputClass}
            >
              {STATUS_VENDA.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Passageiros</label>
            <input
              type="number"
              min="1"
              value={Number.isFinite(quantidadePax) ? quantidadePax : 1}
              onChange={(e) => setQuantidadePax(Number(e.target.value) || 1)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Cliente e produto</h2>
        <ClienteVendaSelect
          lang={lang}
          clientes={clientes}
          value={clienteId}
          onChange={setClienteId}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Pacote do catálogo</label>
            <select
              value={pacoteId}
              onChange={(e) => aoEscolherPacote(e.target.value)}
              className={inputClass}
            >
              <option value="">— Não usar catálogo —</option>
              {pacotes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo_pt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nome do pacote vendido</label>
            <input
              value={pacoteNome}
              onChange={(e) => setPacoteNome(e.target.value)}
              className={inputClass}
              placeholder="Ex: Pacote Roma + Paris"
            />
          </div>
          <div>
            <label className={labelClass}>Destino</label>
            <input
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className={inputClass}
              placeholder="Ex: Itália / França"
            />
          </div>
          <div>
            <label className={labelClass}>Data de viagem</label>
            <input
              type="date"
              value={dataViagem}
              onChange={(e) => setDataViagem(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Data de retorno</label>
            <input
              type="date"
              value={dataRetorno}
              onChange={(e) => setDataRetorno(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-primary-dark">Itens vendidos</h2>
          <button
            type="button"
            onClick={() => setItens((lista) => [...lista, novaVendaItem()])}
            className={btnSecondary}
          >
            <Plus size={16} />
            Adicionar item
          </button>
        </div>
        <p className="text-xs text-ink/50">
          Cálculo por item: tarifa + percentual − desconto − abatimento + taxas.
        </p>

        <div className="space-y-4">
          {itens.map((item, indice) => (
            <VendaItemLinha
              key={item.id}
              item={item}
              indice={indice}
              totalItens={itens.length}
              onMudar={(novo) =>
                setItens((lista) => lista.map((i) => (i.id === item.id ? novo : i)))
              }
              onRemover={() => setItens((lista) => lista.filter((i) => i.id !== item.id))}
              onSubir={() =>
                setItens((lista) => {
                  const idx = lista.findIndex((i) => i.id === item.id);
                  if (idx <= 0) return lista;
                  const nova = [...lista];
                  [nova[idx], nova[idx - 1]] = [nova[idx - 1], nova[idx]];
                  return nova;
                })
              }
              onDescer={() =>
                setItens((lista) => {
                  const idx = lista.findIndex((i) => i.id === item.id);
                  if (idx < 0 || idx >= lista.length - 1) return lista;
                  const nova = [...lista];
                  [nova[idx], nova[idx + 1]] = [nova[idx + 1], nova[idx]];
                  return nova;
                })
              }
            />
          ))}
        </div>

        <div className="ml-auto flex flex-col items-end gap-1 rounded-xl bg-primary/5 px-5 py-3">
          <span className="text-sm text-ink/60">
            Tarifas: <b className="text-ink/80">R$ {totalTarifas(itens).toFixed(2)}</b>
          </span>
          <span className="text-sm text-ink/60">
            Percentuais: <b className="text-ink/80">R$ {totalPercentuais(itens).toFixed(2)}</b>
          </span>
          <span className="text-sm text-ink/60">
            Descontos: <b className="text-red-500">- R$ {totalDescontos(itens).toFixed(2)}</b>
          </span>
          <span className="text-sm text-ink/60">
            Abatimentos: <b className="text-red-500">- R$ {totalAbatimentos(itens).toFixed(2)}</b>
          </span>
          <span className="text-sm text-ink/60">
            Taxas: <b className="text-ink/80">R$ {totalTaxas(itens).toFixed(2)}</b>
          </span>
          <span className="text-lg font-black text-primary-dark">
            Total: R$ {total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-primary-dark">Comissões</h2>
          <button
            type="button"
            onClick={() => setComissoes((lista) => [...lista, novaComissao()])}
            className={btnSecondary}
          >
            <Plus size={16} />
            Adicionar comissão
          </button>
        </div>
        <p className="text-xs text-ink/50">
          Cada comissão é calculada sobre o total líquido da venda. A soma dos
          percentuais não pode passar de 100%.
        </p>

        {comissoes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink/50">
            Nenhuma comissão lançada.
          </p>
        ) : (
          <div className="space-y-4">
            {comissoes.map((comissao) => (
              <ComissaoLinha
                key={comissao.id}
                comissao={comissao}
                totalVenda={total}
                totalPercentuais={somaPercentuais}
                onMudar={(nova) =>
                  setComissoes((lista) => lista.map((c) => (c.id === comissao.id ? nova : c)))
                }
                onRemover={() =>
                  setComissoes((lista) => lista.filter((c) => c.id !== comissao.id))
                }
              />
            ))}
          </div>
        )}

        <div className="ml-auto flex flex-col items-end gap-1 rounded-xl bg-accent/10 px-5 py-3">
          <span className="text-sm text-ink/60">
            Percentuais: <b className="text-ink/80">{somaPercentuais.toFixed(2)}%</b>
          </span>
          <span className="text-lg font-black text-primary-dark">
            Total comissões: R$ {totalComissaoValor.toFixed(2)}
          </span>
        </div>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-48">
            <label className={labelClass}>Forma de pagamento principal</label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className={inputClass}
            >
              <option value="">— Selecione —</option>
              {FORMAS_PAGAMENTO.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={marcarPago} className={btnSecondary}>
            <Banknote size={16} />
            Marcar como paga
          </button>
          <p className="text-sm text-ink/60">
            Total <b className="text-primary-dark">R$ {total.toFixed(2)}</b> · recebido{" "}
            <b className="text-emerald-700">R$ {valorPago.toFixed(2)}</b> · saldo{" "}
            <b className={saldo > 0 ? "text-accent" : "text-emerald-600"}>
              R$ {saldo.toFixed(2)}
            </b>
          </p>
        </div>

        <EntradasVenda
          entradas={entradas}
          contas={contas}
          saldo={saldo}
          onMudar={setEntradas}
          onStatusSugerido={(pago) => {
            if (status !== "cancelada") setStatus(statusSugerido(itens, pago));
          }}
        />
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-bold text-primary-dark">Observações</h2>
        <textarea
          rows={4}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Número de reserva, condições, combinados..."
        />
      </div>

      {erro && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {pending ? "Salvando..." : "Salvar venda"}
        </button>
        <a href={`/${lang}/admin/vendas`} className={btnSecondary}>
          Cancelar
        </a>
        {salvo && <span className="text-sm font-medium text-emerald-600">Salvo!</span>}
      </div>
    </form>
  );
}
