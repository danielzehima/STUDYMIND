"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";

type Question = {
  id: string;
  order_index: number;
  question_text: string;
  options: string[];
};

type ResultItem = {
  question_id: string;
  question_text: string;
  options: string[];
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
};

type SubmitResult = {
  score: number;
  total_questions: number;
  results: ResultItem[];
};

/* ── Score circle ── */
function ScoreCircle({ score, total }: { score: number; total: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? score / total : 0;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circumference * (1 - percentage)), 120);
    return () => clearTimeout(t);
  }, [circumference, percentage]);

  const stroke =
    percentage >= 0.8 ? "#10B981" : percentage >= 0.5 ? "#7C3AED" : "#F59E0B";

  const label =
    percentage >= 0.8
      ? "Excellent !"
      : percentage >= 0.5
        ? "Bien joué !"
        : "Continuez à réviser";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
        {/* track */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="#F1F5F9" strokeWidth="10"
        />
        {/* progress */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text
          x="70" y="64"
          textAnchor="middle"
          fontSize="28"
          fontWeight="900"
          fill="#0F172A"
          fontFamily="inherit"
        >
          {score}
        </text>
        <text
          x="70" y="82"
          textAnchor="middle"
          fontSize="12"
          fill="#94A3B8"
          fontFamily="inherit"
        >
          sur {total}
        </text>
      </svg>
      <p className="text-sm font-bold" style={{ color: stroke }}>{label}</p>
    </div>
  );
}

/* ── Results view ── */
function ResultsView({
  result,
  onRetry,
}: {
  result: SubmitResult;
  onRetry: () => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Score card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
          Résultat du quiz
        </p>
        <ScoreCircle score={result.score} total={result.total_questions} />
        <p className="mt-5 text-xs text-slate-400">
          {result.score} bonne{result.score > 1 ? "s" : ""} réponse{result.score > 1 ? "s" : ""} sur {result.total_questions}
        </p>
      </div>

      {/* Per-question review */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
          Détail des réponses
        </p>
        {result.results.map((r, index) => (
          <div
            key={r.question_id}
            className="rounded-2xl border bg-white overflow-hidden"
            style={{
              borderColor: r.is_correct
                ? "rgba(16,185,129,0.3)"
                : "rgba(239,68,68,0.3)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-start gap-3 px-5 py-4 text-left"
            >
              {r.is_correct ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
              ) : (
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              )}
              <span className="flex-1 text-sm font-semibold text-slate-800 leading-snug">
                {index + 1}. {r.question_text}
              </span>
              <ChevronRight
                size={16}
                className={`mt-0.5 shrink-0 text-slate-400 transition-transform ${
                  openIndex === index ? "rotate-90" : ""
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="px-5 pb-4 border-t border-slate-100">
                <ul className="mt-3 flex flex-col gap-1.5">
                  {r.options.map((option, optIndex) => {
                    const isCorrect = optIndex === r.correct_index;
                    const isWrong =
                      optIndex === r.selected_index && !r.is_correct;
                    return (
                      <li
                        key={optIndex}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                          isCorrect
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : isWrong
                              ? "bg-red-50 text-red-700"
                              : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isCorrect
                              ? "bg-emerald-500 text-white"
                              : isWrong
                                ? "bg-red-400 text-white"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        {option}
                      </li>
                    );
                  })}
                </ul>
                {r.explanation && (
                  <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    💡 {r.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-600"
        >
          <RotateCcw size={14} />
          Recommencer
        </button>
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
        >
          Retour aux documents
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/* ── Main player ── */
export function QuizPlayer({
  quizId,
  questions,
}: {
  quizId: string;
  questions: Question[];
}) {
  const [phase, setPhase] = useState<"playing" | "submitting" | "results">(
    "playing"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  function handleRetry() {
    setPhase("playing");
    setCurrentIndex(0);
    setAnswers({});
    setError(null);
    setResult(null);
  }

  async function handleSubmit() {
    setError(null);
    setPhase("submitting");
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((q) => ({
            question_id: q.id,
            selected_index: answers[q.id] ?? null,
          })),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "La soumission a échoué.");
      }
      const data = await response.json();
      setResult(data);
      setPhase("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "La soumission a échoué.");
      setPhase("playing");
    }
  }

  if (phase === "results" && result) {
    return <ResultsView result={result} onRetry={handleRetry} />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Progress bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>
            Question <span className="font-semibold text-slate-600">{currentIndex + 1}</span>{" "}
            sur {questions.length}
          </span>
          <span>{progressPct}% complété</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all duration-500"
            style={{ width: `${((currentIndex + (hasAnsweredCurrent ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="inline-block mb-4 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
          Question {currentIndex + 1}
        </span>

        <p className="text-base font-semibold text-slate-900 leading-relaxed">
          {currentQuestion.question_text}
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {currentQuestion.options.map((option, optIndex) => {
            const isSelected = answers[currentQuestion.id] === optIndex;
            return (
              <button
                key={optIndex}
                type="button"
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: optIndex,
                  }))
                }
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm text-left transition ${
                  isSelected
                    ? "border-violet-500 bg-violet-50 text-violet-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/40"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                    isSelected
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border border-slate-300 text-slate-400"
                  }`}
                >
                  {String.fromCharCode(65 + optIndex)}
                </span>
                <span className="leading-snug">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {answeredCount} / {questions.length} réponse{answeredCount > 1 ? "s" : ""}
        </span>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAnsweredCurrent || phase === "submitting"}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 hover:shadow-md hover:shadow-violet-600/20 disabled:opacity-50"
          >
            {phase === "submitting" && <Spinner size={15} />}
            {phase === "submitting" ? "Correction en cours…" : "Valider mes réponses"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={!hasAnsweredCurrent}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
          >
            Question suivante
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
