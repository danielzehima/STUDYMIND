const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-red-100 text-red-700",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "Fiabilité élevée",
  medium: "Fiabilité moyenne",
  low: "Fiabilité faible",
};

export function ExerciseSolutionCard({
  index,
  exerciseText,
  solutionText,
  finalAnswer,
  confidence,
}: {
  index: number;
  exerciseText: string;
  solutionText: string;
  finalAnswer: string | null;
  confidence: "high" | "medium" | "low" | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Exercice {index + 1}
        </h3>
        {confidence && (
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              CONFIDENCE_STYLES[confidence] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {CONFIDENCE_LABELS[confidence] ?? confidence}
          </span>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
        {exerciseText}
      </p>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Résolution
        </h4>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {solutionText}
        </p>
      </div>

      {finalAnswer && (
        <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-violet-500">
            Réponse finale
          </span>
          <p className="mt-1 text-sm font-medium text-violet-900">
            {finalAnswer}
          </p>
        </div>
      )}
    </div>
  );
}
