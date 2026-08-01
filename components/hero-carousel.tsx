"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  imagens: string[];
  children: React.ReactNode;
  intervaloMs?: number;
};

export function HeroCarousel({ imagens, children, intervaloMs = 6000 }: Props) {
  const [index, setIndex] = useState(0);
  const total = imagens.length;

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, intervaloMs);
    return () => clearInterval(id);
  }, [total, intervaloMs]);

  return (
    <section className="relative overflow-hidden text-white">
      {imagens.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover"
          />
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,36,71,0.55) 0%, rgba(11,36,71,0.65) 55%, var(--cor-primaria-escura) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 text-center">
        {children}
      </div>

      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {imagens.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
