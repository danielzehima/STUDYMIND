import {
  BookOpenCheck,
  ListChecks,
  MessageCircleWarning,
  Calculator,
  FileDown,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: "Résumés intelligents",
    description:
      "Synthèse et points clés de chaque cours, générés automatiquement par l'IA.",
    premium: false,
  },
  {
    icon: ListChecks,
    title: "Quiz interactifs",
    description:
      "Questions à choix multiples générées à partir de votre document, prêtes en secondes.",
    premium: false,
  },
  {
    icon: MessageCircleWarning,
    title: "Feedback sur les erreurs",
    description:
      "Explication claire pour chaque bonne et mauvaise réponse — progressez vraiment.",
    premium: false,
  },
  {
    icon: Calculator,
    title: "Résolution d'exercices",
    description:
      "L'IA identifie et résout les exercices de vos documents avec étapes détaillées.",
    premium: true,
  },
  {
    icon: FileDown,
    title: "Export fiche PDF",
    description:
      "Téléchargez votre résumé, quiz et exercices en PDF propre depuis chaque document.",
    premium: false,
  },
];

export function Features() {
  return (
    <section
      id="fonctionnalites"
      className="relative px-6 py-28 overflow-hidden"
      style={{ background: "#0F0D20" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 80% 80%, rgba(124,58,237,0.12) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center mb-16">
          <p className="text-xs font-black tracking-[0.18em] uppercase text-violet-500 mb-3">
            Fonctionnalités
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Tout ce qu&apos;il faut pour réviser efficacement
          </h2>
          <p className="mt-4 text-sm text-violet-300/60 leading-relaxed">
            Des outils pensés pour transformer un document brut en révision active.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative flex flex-col rounded-2xl border border-violet-500/15 p-6 backdrop-blur-sm transition hover:border-violet-500/30 hover:-translate-y-0.5"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {feature.premium && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-400/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-400"
                  style={{ background: "rgba(251,191,36,0.1)" }}
                >
                  <Lock size={9} />
                  Pro
                </span>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-violet-400 mb-5 transition group-hover:bg-violet-600 group-hover:text-white"
                style={{ background: "rgba(139,92,246,0.15)" }}
              >
                <feature.icon size={18} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-violet-300/60 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
