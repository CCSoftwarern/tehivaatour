"use client";

import { useCallback, useRef, useState } from "react";
import type { ArtDesign } from "./tipos";

const LIMITE = 60;

function clone(d: ArtDesign): ArtDesign {
  return JSON.parse(JSON.stringify(d)) as ArtDesign;
}

export function useHistorico(inicial: ArtDesign) {
  const passado = useRef<ArtDesign[]>([]);
  const futuro = useRef<ArtDesign[]>([]);
  const estadoRef = useRef<ArtDesign>(inicial);
  const [estado, setEstado] = useState<ArtDesign>(inicial);
  const [pode, setPode] = useState({ desfazer: false, refazer: false });

  const marca = useCallback(() => {
    setPode({
      desfazer: passado.current.length > 0,
      refazer: futuro.current.length > 0,
    });
  }, []);

  const set = useCallback((n: ArtDesign) => {
    estadoRef.current = n;
    setEstado(n);
  }, []);

  const atualizar = useCallback(
    (n: ArtDesign) => {
      set(n);
    },
    [set],
  );

  const comitar = useCallback((snapshot: ArtDesign) => {
    passado.current.push(clone(snapshot));
    if (passado.current.length > LIMITE) passado.current.shift();
    futuro.current = [];
    marca();
  }, [marca]);

  const aplicar = useCallback(
    (mutator: (d: ArtDesign) => ArtDesign) => {
      passado.current.push(clone(estadoRef.current));
      if (passado.current.length > LIMITE) passado.current.shift();
      futuro.current = [];
      set(mutator(estadoRef.current));
      marca();
    },
    [set, marca],
  );

  const desfazer = useCallback(() => {
    const prev = passado.current.pop();
    if (!prev) return;
    futuro.current.push(clone(estadoRef.current));
    set(prev);
    marca();
  }, [set, marca]);

  const refazer = useCallback(() => {
    const next = futuro.current.pop();
    if (!next) return;
    passado.current.push(clone(estadoRef.current));
    set(next);
    marca();
  }, [set, marca]);

  return {
    estado,
    atualizar,
    comitar,
    aplicar,
    desfazer,
    refazer,
    podeDesfazer: pode.desfazer,
    podeRefazer: pode.refazer,
  };
}
