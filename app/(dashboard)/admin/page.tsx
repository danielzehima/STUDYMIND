import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { listAllSubscriptions } from "@/lib/subscriptions/repository";
import { AdminSubscriptionsTable } from "@/components/admin/AdminSubscriptionsTable";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!(await isAdmin(user.id))) {
    redirect("/dashboard");
  }

  const subscriptions = await listAllSubscriptions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Administration
        </h1>
        <p className="text-sm text-slate-500">
          Gérez le plan de n&apos;importe quel utilisateur — utile pour
          tester le forfait Pro sans passer par le paiement.
        </p>
      </div>
      <AdminSubscriptionsTable subscriptions={subscriptions} />
    </div>
  );
}
