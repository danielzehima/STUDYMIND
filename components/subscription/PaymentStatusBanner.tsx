"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~1 minute

// Après redirection depuis le checkout GeniusPay, le webhook qui active
// réellement le plan Pro peut arriver quelques secondes après que le
// navigateur revienne sur /subscription — on affiche un état "en attente"
// et on sonde /api/subscription jusqu'à ce que le plan passe à "pro".
export function PaymentStatusBanner({ plan }: { plan: "free" | "pro" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const payment = searchParams.get("payment");

  const [attempts, setAttempts] = useState(0);
  const hasCleanedUrl = useRef(false);

  useEffect(() => {
    if (payment === "pending" && plan === "pro" && !hasCleanedUrl.current) {
      hasCleanedUrl.current = true;
      router.replace(pathname);
    }
  }, [payment, plan, pathname, router]);

  useEffect(() => {
    if (payment !== "pending" || plan === "pro") return;
    if (attempts >= MAX_POLLS) return;

    const timer = setTimeout(() => {
      setAttempts((n) => n + 1);
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [payment, plan, attempts, router]);

  if (payment === "pending" && plan !== "pro") {
    const timedOut = attempts >= MAX_POLLS;
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {!timedOut && <Spinner size={16} />}
        <span>
          {timedOut
            ? "La confirmation du paiement prend plus de temps que prévu. Si le montant a bien été débité, rafraîchissez cette page dans quelques instants."
            : "Paiement en cours de confirmation, cette page se mettra à jour automatiquement..."}
        </span>
      </div>
    );
  }

  if (payment === "pending" && plan === "pro") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 size={18} />
        <span>Paiement confirmé, votre plan Pro est actif !</span>
      </div>
    );
  }

  if (payment === "error") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle size={18} />
        <span>Le paiement a échoué ou a été annulé. Vous pouvez réessayer.</span>
      </div>
    );
  }

  return null;
}
