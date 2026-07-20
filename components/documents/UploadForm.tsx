"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";

export function UploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "L'upload a échoué.");
      }

      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'upload a échoué.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <UploadCloud size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Uploader un document
          </p>
          <p className="text-xs text-slate-500">
            PDF, Word (.docx) ou texte — 10 Mo max.
          </p>
        </div>
      </div>

      <input
        type="file"
        name="file"
        accept=".pdf,.docx,.txt"
        required
        className="text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
      />

      <input
        type="text"
        name="title"
        placeholder="Titre (optionnel)"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      {error && <ErrorBanner message={error} />}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {isLoading && <Spinner size={16} />}
        {isLoading ? "Envoi en cours..." : "Uploader"}
      </button>
    </form>
  );
}
