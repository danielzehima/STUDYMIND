import { UploadCloud, BrainCircuit, ListChecks } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Uploadez votre cours",
    description:
      "PDF, Word ou texte — glissez simplement votre document de cours ou d'exercices.",
  },
  {
    icon: BrainCircuit,
    title: "L'IA analyse et extrait",
    description:
      "DeepSeek lit votre document et en extrait les grandes lignes et points essentiels.",
  },
  {
    icon: ListChecks,
    title: "Testez et corrigez",
    description:
      "Passez un quiz généré automatiquement et obtenez la résolution de vos exercices.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-slate-500">
            Trois étapes simples entre votre cours et une révision efficace.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                <step.icon size={26} />
              </div>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-violet-600">
                Étape {index + 1}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
