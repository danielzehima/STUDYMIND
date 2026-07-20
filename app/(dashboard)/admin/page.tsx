import { redirect } from "next/navigation";
import {
  Users,
  Crown,
  Wallet,
  FileText,
  ListChecks,
  PenTool,
  MessageSquare,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { listAllSubscriptions } from "@/lib/subscriptions/repository";
import { listAllFeedback } from "@/lib/feedback/repository";
import { getAdminStats } from "@/lib/admin/stats";
import { AdminSubscriptionsTable } from "@/components/admin/AdminSubscriptionsTable";
import { FeedbackList } from "@/components/admin/FeedbackList";
import { StatCard } from "@/components/dashboard/StatCard";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!(await isAdmin(user.id))) {
    redirect("/dashboard");
  }

  const [subscriptions, feedback, stats] = await Promise.all([
    listAllSubscriptions(),
    listAllFeedback(),
    getAdminStats(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Administration
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue d&apos;ensemble de la plateforme et gestion des abonnements.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Abonnements
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Utilisateurs"
            value={`${stats.totalUsers}`}
            hint={`${stats.freeUsers} gratuit${stats.freeUsers > 1 ? "s" : ""}`}
          />
          <StatCard
            icon={Crown}
            label="Comptes Pro"
            value={`${stats.proUsers}`}
            hint={
              stats.totalUsers > 0
                ? `${Math.round((stats.proUsers / stats.totalUsers) * 100)}% des utilisateurs`
                : undefined
            }
          />
          <StatCard
            icon={Wallet}
            label="MRR estimé"
            value={`${stats.estimatedMrrFcfa.toLocaleString("fr-FR")} FCFA`}
            hint="Basé sur 3 000 FCFA/mois par compte Pro"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Usage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Documents uploadés"
            value={`${stats.documentsCount}`}
          />
          <StatCard
            icon={ListChecks}
            label="Quiz complétés"
            value={`${stats.quizAttemptsCount}`}
          />
          <StatCard
            icon={PenTool}
            label="Exercices résolus"
            value={`${stats.exercisesResolvedCount}`}
          />
          <StatCard
            icon={MessageSquare}
            label="Retours utilisateurs"
            value={`${stats.feedbackCount}`}
            hint={
              stats.averageRating !== null
                ? `Note moyenne : ${stats.averageRating}/5`
                : undefined
            }
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Gestion des abonnements
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Changez le plan de n&apos;importe quel utilisateur — utile pour
            tester le forfait Pro sans passer par le paiement.
          </p>
        </div>
        <AdminSubscriptionsTable subscriptions={subscriptions} />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Retours utilisateurs
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Avis et suggestions envoyés depuis la page Feedback de l&apos;app.
          </p>
        </div>
        <FeedbackList feedback={feedback} />
      </section>
    </div>
  );
}
