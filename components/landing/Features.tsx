import {
  BookOpenCheck,
  ListChecks,
  MessageCircleWarning,
  Calculator,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: "Résumés intelligents",
    description:
      "Obtenez la synthèse et les points clés de chaque cours, générés automatiquement.",
    premium: false,
  },
  {
    icon: ListChecks,
    title: "Quiz interactifs",
    description:
      "Des questions à choix multiples générées à partir de votre document, prêtes en quelques secondes.",
    premium: false,
  },
  {
    icon: MessageCircleWarning,
    title: "Feedback sur vos erreurs",
    description:
      "Une explication claire pour chaque bonne et mauvaise réponse, pour progresser vraiment.",
    premium: false,
  },
  {
    icon: Calculator,
    title: "Résolution d'exercices",
    description:
      "L'IA identifie et résout les exercices présents dans vos documents.",
    premium: true,
  },
];

export function Features() {
  return (
    <section id="fonctionnalites" className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tout ce qu&apos;il faut pour réviser efficacement
          </h2>
          <p className="mt-4 text-slate-500">
            Des outils pensés pour transformer un document brut en révision
            active.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {feature.premium && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <Lock size={12} />
                  Pro
                </span>
              )}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <feature.icon size={22} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
