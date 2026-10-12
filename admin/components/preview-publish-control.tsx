"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PreviewPublishControl({ isDraft }: { isDraft: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function publish() {
    if (!window.confirm("Diesen in der Vorschau geprüften Entwurf jetzt öffentlich veröffentlichen?")) return;

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/content/publish", { method: "POST" });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Veröffentlichung fehlgeschlagen.");
      }

      setMessage("Vorschau veröffentlicht. Die öffentliche Website zeigt jetzt diesen Stand.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Veröffentlichung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {isDraft ? (
        <button
          className="rounded-sm border border-cyan-400/40 bg-cyan-400 px-3 py-1.5 font-semibold text-slate-950 disabled:cursor-wait disabled:opacity-60"
          type="button"
          disabled={busy}
          onClick={publish}
        >
          {busy ? "Veröffentliche …" : "Jetzt veröffentlichen"}
        </button>
      ) : (
        <span className="text-slate-400">Live-Stand</span>
      )}
      {message && <span role="status" aria-live="polite" className="max-w-72 text-xs text-cyan-100">{message}</span>}
    </div>
  );
}
