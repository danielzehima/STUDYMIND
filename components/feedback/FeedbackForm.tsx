"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";

export function FeedbackForm() {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, rating }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "L'envoi a échoué.");
      }

      setSubmitted(true);
      setMessage("");
      setRating(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'envoi a échoué.");
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <CheckCircle2 size={32} className="text-emerald-600" />
        <p className="text-sm font-medium text-slate-900">
          Merci pour votre retour !
        </p>
        <p className="text-sm text-slate-500">
          Il nous aide directement à améliorer Study Mind.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
        >
          Envoyer un autre retour
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div>
        <label className="text-sm font-semibold text-slate-900">
          Comment évaluez-vous Study Mind ?
        </label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = (hoverRating ?? rating ?? 0) >= value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(null)}
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                className="p-1"
              >
                <Star
                  size={24}
                  className={active ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-message" className="text-sm font-semibold text-slate-900">
          Votre avis, suggestion ou problème rencontré
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={1}
          maxLength={2000}
          rows={5}
          placeholder="Qu'est-ce qui fonctionne bien ? Qu'est-ce qu'on pourrait améliorer ?"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {error && <ErrorBanner message={error} />}

      <button
        type="submit"
        disabled={isLoading || message.trim().length === 0}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading && <Spinner size={16} />}
        Envoyer mon retour
      </button>
    </form>
  );
}
