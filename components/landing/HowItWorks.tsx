import { UploadCloud, BrainCircuit, ListChecks } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    step: "01",
    title: "Uploadez votre cours",
    description:
      "PDF, Word ou texte — glissez votre document de cours ou d'exercices en quelques secondes.",
  },
  {
    icon: BrainCircuit,
    step: "02",
    title: "L'IA analyse et génère",
    description:
      "DeepSeek lit votre document et produit résumé, points clés et quiz en quelques secondes.",
  },
  {
    icon: ListChecks,
    step: "03",
    title: "Testez et corrigez",
    description:
      "Passez le quiz généré automatiquement et obtenez la résolution complète de vos exercices.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="relative bg-[#0D0B1A] px-6 py-28 overflow-hidden"
    >
      {/* top fade divider */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 50%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center mb-16">
          <p className="text-xs font-black tracking-[0.18em] uppercase text-violet-500 mb-3">
            Comment ça marche
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            De votre cours à la révision en 3 étapes
          </h2>
          <p className="mt-4 text-sm text-violet-300/60 leading-relaxed">
            Trois étapes simples entre votre document et une révision efficace.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.step}
              className="group relative flex flex-col rounded-2xl border border-violet-500/15 p-7 backdrop-blur-sm transition hover:border-violet-500/30"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-5xl font-black leading-none mb-4 select-none text-violet-500/15">
                {step.step}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20 mb-5 transition group-hover:bg-violet-500">
                <step.icon size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-violet-300/60 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
