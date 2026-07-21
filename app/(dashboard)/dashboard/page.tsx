import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ListChecks,
  TrendingUp,
  Sparkles,
  ArrowRight,
  UploadCloud,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { StatCard } from "@/components/dashboard/StatCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stats = await getDashboardStats(user.id);
  const isPro = stats.plan === "pro";

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bienvenue — voici un aperçu de votre progression.
          </p>
        </div>
        <Link
          href="/documents"
          className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/20 shrink-0"
        >
          <UploadCloud size={15} />
          Uploader un cours
        </Link>
      </div>

      {/* Stat cards */}
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
          accent="violet"
        />
        <StatCard
          icon={ListChecks}
          label="Quiz complétés"
          value={`${stats.quizzesTaken}`}
          hint={stats.quizzesTaken === 0 ? "Commencez votre premier quiz" : undefined}
          accent="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Score moyen"
          value={stats.averageScore === null ? "—" : `${stats.averageScore}%`}
          hint={stats.quizzesTaken === 0 ? "Aucun quiz pour l'instant" : undefined}
          accent="emerald"
        />
        <StatCard
          icon={Sparkles}
          label="Plan actuel"
          value={isPro ? "Pro" : "Gratuit"}
          hint={isPro ? "Accès illimité" : "3 documents max"}
          accent="amber"
        />
      </div>

      {/* Empty state */}
      {stats.documentsCount === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
            <UploadCloud size={22} className="text-violet-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Aucun document pour l&apos;instant
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Uploadez votre premier cours pour générer résumés et quiz.
          </p>
          <Link
            href="/documents"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Uploader un cours
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Upgrade banner for free users */}
      {!isPro && (
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, #1E1B2E 0%, #2D1B4E 100%)",
          }}
        >
          <div>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={15} className="text-violet-400" />
              Passez au plan Pro
            </p>
            <p className="mt-0.5 text-xs text-violet-300/70">
              Documents illimités, résolution d&apos;exercices IA, support prioritaire.
            </p>
          </div>
          <Link
            href="/subscription"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-400"
          >
            Voir les tarifs
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

    </div>
  );
}
