import Link from "next/link";
import { Sparkles, ArrowRight, LayoutDashboard } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <Sparkles size={16} />
          Propulsé par l&apos;IA DeepSeek
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          Transformez vos cours en{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
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
            className="group inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30"
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

        {/* Placeholder visuel — capture d'écran réelle du dashboard à intégrer plus tard */}
        <div className="relative mt-16 w-full">
          <div className="absolute inset-0 -z-10 mx-auto h-full w-full max-w-3xl rounded-3xl bg-gradient-to-tr from-indigo-200 via-violet-100 to-transparent blur-3xl" />
          <div className="mx-auto flex aspect-video w-full max-w-4xl items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <LayoutDashboard size={48} strokeWidth={1.5} />
              <span className="text-sm font-medium text-slate-400">
                Aperçu du tableau de bord
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
