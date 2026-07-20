import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  FileText,
  ListChecks,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
          <Sparkles size={16} />
          Propulsé par l&apos;IA DeepSeek
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          Transformez vos cours en{" "}
          <span className="bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent">
            réussite
          </span>{" "}
          : résumés, quiz et corrections en un clic.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-500">
          Uploadez vos documents et laissez notre IA générer l&apos;essentiel
          à retenir, des tests interactifs et la résolution de vos exercices.
          Révisez moins, retenez plus.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/30"
          >
            Créer mon compte gratuit
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Aucune carte de crédit requise
        </p>

        {/* Mockup du tableau de bord (recréé en HTML/CSS, pas une vraie
            capture d'écran, pour rester léger et ne jamais devenir obsolète) */}
        <div className="relative mt-16 w-full">
          <div className="absolute inset-0 -z-10 mx-auto h-full w-full max-w-3xl rounded-3xl bg-gradient-to-tr from-violet-200 via-violet-100 to-transparent blur-3xl" />
          <div className="mx-auto flex w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl shadow-slate-900/10">
            {/* Sidebar miniature */}
            <div className="hidden w-40 shrink-0 border-r border-slate-100 bg-slate-50 p-4 sm:block">
              <div className="mb-6 flex items-center gap-1.5">
                <Logo size={18} />
                <span className="text-xs font-bold text-slate-900">
                  Study Mind
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-medium text-violet-600">
                  <LayoutDashboard size={12} />
                  Tableau de bord
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                  <FileText size={12} />
                  Mes documents
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                  <ListChecks size={12} />
                  Historique
                </div>
              </div>
            </div>

            {/* Contenu principal miniature */}
            <div className="flex-1 bg-white p-5 sm:p-6">
              <p className="text-sm font-semibold text-slate-900 sm:text-base">
                Tableau de bord
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
                Bienvenue, voici un aperçu de votre progression.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <FileText size={14} className="text-violet-600" />
                  <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                    2/3
                  </p>
                  <p className="text-[10px] text-slate-400 sm:text-xs">
                    Documents
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <ListChecks size={14} className="text-violet-600" />
                  <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                    4
                  </p>
                  <p className="text-[10px] text-slate-400 sm:text-xs">
                    Quiz complétés
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <TrendingUp size={14} className="text-violet-600" />
                  <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                    86%
                  </p>
                  <p className="text-[10px] text-slate-400 sm:text-xs">
                    Score moyen
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-[11px] font-medium text-slate-600 sm:text-xs">
                    Chapitre 4 — Thermodynamique
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                    Prêt
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-[11px] font-medium text-slate-600 sm:text-xs">
                    Histoire — La Révolution française
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                    Prêt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
