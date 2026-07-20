"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";
import type { Subscription } from "@/lib/subscriptions/repository";

const FEATURES: Record<"free" | "pro", string[]> = {
  free: [
    "3 documents inclus",
    "Résumés générés par IA",
    "Quiz interactifs illimités",
    "Feedback détaillé sur vos réponses",
  ],
  pro: [
    "Documents illimités",
    "Tout le plan Gratuit",
    "Résolution complète d'exercices par IA",
    "Support prioritaire",
  ],
};

export function PlanComparisonTable({
  subscription,
}: {
  subscription: Subscription;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: "upgrade" | "downgrade") {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/subscription/${action}`, {
        method: "POST",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "L'opération a échoué.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'opération a échoué.");
    } finally {
      setIsLoading(false);
    }
  }

  const periodEndLabel = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("fr-FR")
    : null;

  return (
    <div className="flex flex-col gap-4">
      {subscription.plan === "pro" && periodEndLabel && (
        <p className="text-sm text-slate-500">
          Votre plan Pro est actif jusqu&apos;au {periodEndLabel}.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div
          className={`flex flex-col rounded-2xl border p-6 ${
            subscription.plan === "free"
              ? "border-indigo-600 shadow-sm"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Gratuit</h3>
            {subscription.plan === "free" && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                Plan actuel
              </span>
            )}
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">0 FCFA</p>
          <ul className="mt-6 flex flex-1 flex-col gap-3">
            {FEATURES.free.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <Check size={18} className="mt-0.5 shrink-0 text-indigo-600" />
                {feature}
              </li>
            ))}
          </ul>
          {subscription.plan === "pro" && (
            <button
              type="button"
              onClick={() => handleAction("downgrade")}
              disabled={isLoading}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isLoading && <Spinner size={16} />}
              Revenir au plan Gratuit
            </button>
          )}
        </div>

        <div
          className={`flex flex-col rounded-2xl border p-6 ${
            subscription.plan === "pro"
              ? "border-indigo-600 shadow-sm"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
            {subscription.plan === "pro" && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                Plan actuel
              </span>
            )}
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">
              3 000 FCFA
            </span>
            <span className="text-slate-500">/mois</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            ou 7 500 FCFA / trimestre
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-3">
            {FEATURES.pro.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <Check size={18} className="mt-0.5 shrink-0 text-indigo-600" />
                {feature}
              </li>
            ))}
          </ul>
          {subscription.plan === "free" && (
            <button
              type="button"
              onClick={() => handleAction("upgrade")}
              disabled={isLoading}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading && <Spinner size={16} />}
              Passer au plan Pro
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Le paiement en ligne (mobile money / carte) n&apos;est pas encore
        branché — ce bouton active le plan Pro directement pour la phase de
        test.
      </p>

      {error && <ErrorBanner message={error} />}
    </div>
  );
}
