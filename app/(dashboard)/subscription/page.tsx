import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getSubscription } from "@/lib/subscriptions/repository";
import { PlanComparisonTable } from "@/components/subscription/PlanComparisonTable";
import { PaymentStatusBanner } from "@/components/subscription/PaymentStatusBanner";

export default async function SubscriptionPage() {
  const user = await getCurrentUser();
  const subscription = await getSubscription(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Abonnement</h1>
        <p className="text-sm text-slate-500">
          Gérez votre plan Study Mind.
        </p>
      </div>
      <Suspense fallback={null}>
        <PaymentStatusBanner plan={subscription.plan} />
      </Suspense>
      <PlanComparisonTable subscription={subscription} />
    </div>
  );
}
