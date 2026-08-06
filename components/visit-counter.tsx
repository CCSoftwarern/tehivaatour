"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function VisitCounter() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("tehiva_visitado")) return;
    sessionStorage.setItem("tehiva_visitado", "1");
    void (async () => {
      try {
        await createClient().rpc("incrementar_visita", { p_chave: "visitas" });
      } catch {
        // ignora falhas de contagem
      }
    })();
  }, []);

  return null;
}
