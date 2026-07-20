"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";
import { PlanBadge } from "@/components/dashboard/PlanBadge";
import type { SubscriptionWithProfile } from "@/lib/subscriptions/repository";

export function AdminSubscriptionsTable({
  subscriptions,
}: {
  subscriptions: SubscriptionWithProfile[];
}) {
  const router = useRouter();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        (s.full_name ?? "").toLowerCase().includes(q)
    );
  }, [subscriptions, query]);

  async function handleAction(
    userId: string,
    action: "upgrade" | "downgrade"
  ) {
    setError(null);
    setLoadingUserId(userId);

    try {
      const response = await fetch(
        `/api/admin/subscriptions/${userId}/${action}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "L'opération a échoué.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'opération a échoué.");
    } finally {
      setLoadingUserId(null);
    }
  }

  if (subscriptions.length === 0) {
    return <p className="text-sm text-slate-500">Aucun utilisateur pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}

      <div className="relative w-full max-w-xs">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full rounded-full border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucun utilisateur ne correspond à &quot;{query}&quot;.
        </p>
      ) : (
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Plan
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Statut
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Fin de période
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => {
              const isLoading = loadingUserId === s.user_id;
              const periodEndLabel = s.current_period_end
                ? new Date(s.current_period_end).toLocaleDateString("fr-FR")
                : "—";

              return (
                <tr key={s.user_id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {s.full_name || s.email}
                    </div>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={s.plan} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.status}</td>
                  <td className="px-4 py-3 text-slate-600">{periodEndLabel}</td>
                  <td className="px-4 py-3 text-right">
                    {s.plan === "free" ? (
                      <button
                        type="button"
                        onClick={() => handleAction(s.user_id, "upgrade")}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                      >
                        {isLoading && <Spinner size={12} />}
                        Passer en Pro
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(s.user_id, "downgrade")}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        {isLoading && <Spinner size={12} />}
                        Repasser en Gratuit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
