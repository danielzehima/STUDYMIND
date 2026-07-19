import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ListChecks, TrendingUp, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { StatCard } from "@/components/dashboard/StatCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = await getDashboardStats(user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Bienvenue, voici un aperçu de votre progression.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Documents"
          value={
            stats.documentsLimit === null
              ? `${stats.documentsCount}`
              : `${stats.documentsCount} / ${stats.documentsLimit}`
          }
          hint={stats.documentsLimit === null ? "Illimité (Pro)" : "Plan Gratuit"}
        />
        <StatCard
          icon={ListChecks}
          label="Quiz complétés"
          value={`${stats.quizzesTaken}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Score moyen"
          value={stats.averageScore === null ? "—" : `${stats.averageScore}%`}
          hint={stats.quizzesTaken === 0 ? "Aucun quiz pour l'instant" : undefined}
        />
        <StatCard
          icon={Sparkles}
          label="Plan actuel"
          value={stats.plan === "pro" ? "Pro" : "Gratuit"}
        />
      </div>

      {stats.documentsCount === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Vous n&apos;avez pas encore de document.{" "}
            <Link href="/documents" className="font-medium text-indigo-600 underline">
              Uploadez votre premier cours
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
