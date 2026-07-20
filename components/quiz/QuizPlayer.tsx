"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
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

export function QuizPlayer({
  quizId,
  questions,
}: {
  quizId: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "La soumission a échoué.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-slate-500">Votre score</p>
          <p className="mt-1 text-4xl font-bold text-violet-600">
            {result.score} / {result.total_questions}
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {result.results.map((r, index) => (
            <li
              key={r.question_id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start gap-2">
                {r.is_correct ? (
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                ) : (
                  <XCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
                )}
                <p className="text-sm font-semibold text-slate-900">
                  {index + 1}. {r.question_text}
                </p>
              </div>

              <ul className="mt-3 flex flex-col gap-1.5 pl-7">
                {r.options.map((option, optIndex) => {
                  const isCorrectOption = optIndex === r.correct_index;
                  const isSelected = optIndex === r.selected_index;
                  return (
                    <li
                      key={optIndex}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        isCorrectOption
                          ? "bg-emerald-50 text-emerald-700"
                          : isSelected
                            ? "bg-red-50 text-red-700"
                            : "text-slate-600"
                      }`}
                    >
                      {option}
                    </li>
                  );
                })}
              </ul>

              <p className="mt-3 pl-7 text-sm text-slate-500">{r.explanation}</p>
            </li>
          ))}
        </ul>

        <Link
          href="/documents"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Retour aux documents
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {questions.map((q, index) => (
          <li key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">
              {index + 1}. {q.question_text}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {q.options.map((option, optIndex) => (
                <label
                  key={optIndex}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    answers[q.id] === optIndex
                      ? "border-violet-600 bg-violet-50 text-violet-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="accent-violet-600"
                    checked={answers[q.id] === optIndex}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: optIndex }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {error && <ErrorBanner message={error} />}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || isSubmitting}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {isSubmitting && <Spinner size={16} />}
        {isSubmitting ? "Correction en cours..." : "Valider mes réponses"}
      </button>
    </div>
  );
}
