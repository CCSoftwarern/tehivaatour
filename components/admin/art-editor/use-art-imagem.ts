"use client";

import { useEffect, useState } from "react";

const cache = new Map<string, HTMLImageElement>();
const promessas = new Map<string, Promise<HTMLImageElement>>();

function carregarComoImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
    img.src = src;
  });
}

function carregar(url: string): Promise<HTMLImageElement> {
  const pronto = cache.get(url);
  if (pronto) return Promise.resolve(pronto);
  const pendente = promessas.get(url);
  if (pendente) return pendente;

  const p = (async () => {
    try {
      const resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error("http");
      const blob = await resp.blob();
      const objUrl = URL.createObjectURL(blob);
      const img = await carregarComoImagem(objUrl);
      cache.set(url, img);
      return img;
    } catch {
      const img = await carregarComoImagem(url);
      cache.set(url, img);
      return img;
    } finally {
      promessas.delete(url);
    }
  })();
  promessas.set(url, p);
  return p;
}

export function getImagemCarregada(url: string | null | undefined): HTMLImageElement | null {
  if (!url) return null;
  return cache.get(url) ?? null;
}

export function useArtImagem(url: string | null | undefined): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(() =>
    url ? getImagemCarregada(url) : null,
  );

  useEffect(() => {
    if (!url) return;
    let ativo = true;
    carregar(url)
      .then((i) => {
        if (ativo) setImg(i);
      })
      .catch(() => {
        if (ativo) setImg(null);
      });
    return () => {
      ativo = false;
    };
  }, [url]);

  return img;
}
