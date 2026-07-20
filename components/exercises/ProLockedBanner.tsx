import Link from "next/link";
import { Lock } from "lucide-react";

export function ProLockedBanner() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-6">
      <span className="flex items-center gap-2 text-sm font-semibold text-violet-900">
        <Lock size={16} />
        Fonctionnalité Pro
      </span>
      <p className="text-sm text-violet-800">
        La résolution automatique des exercices avec explication détaillée
        est réservée au plan Pro.
      </p>
      <Link
        href="/subscription"
        className="inline-flex w-fit items-center rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Passer au plan Pro
      </Link>
    </div>
  );
}
