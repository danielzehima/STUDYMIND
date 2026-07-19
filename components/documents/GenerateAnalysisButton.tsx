"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";

export function GenerateAnalysisButton({
  documentId,
  label = "Générer le résumé et le quiz",
}: {
  documentId: string;
  label?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/documents/${documentId}/quiz`, {
        method: "POST",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "La génération a échoué.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "La génération a échoué.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? <Spinner size={16} /> : <Sparkles size={16} />}
        {isLoading ? "Génération en cours (10-30s)..." : label}
      </button>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}
