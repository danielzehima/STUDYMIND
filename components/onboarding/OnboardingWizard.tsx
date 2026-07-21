"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const STEPS = [
  {
    id: "level",
    question: "Tu es à quel niveau d'études ?",
    subtitle: "Aide-nous à personnaliser ton expérience.",
    cols: 1,
    options: [
      { value: "lycee",    emoji: "📗", label: "Lycée / Terminale" },
      { value: "licence",  emoji: "📘", label: "Licence / BTS" },
      { value: "master",   emoji: "📙", label: "Master / Ingénieur" },
      { value: "doctorat", emoji: "🎓", label: "Doctorat ou autre" },
    ],
  },
  {
    id: "field",
    question: "Dans quel domaine tu étudies ?",
    subtitle: "Study Mind s'adapte à tous les cursus.",
    cols: 2,
    options: [
      { value: "sciences",  emoji: "🔬", label: "Sciences & Maths" },
      { value: "lettres",   emoji: "📖", label: "Lettres & Humanités" },
      { value: "commerce",  emoji: "💼", label: "Commerce & Gestion" },
      { value: "droit",     emoji: "⚖️",  label: "Droit" },
      { value: "medecine",  emoji: "🏥", label: "Médecine & Santé" },
      { value: "autre",     emoji: "✏️",  label: "Autre domaine" },
    ],
  },
  {
    id: "challenge",
    question: "Ton principal défi pour réviser ?",
    subtitle: "Sois honnête, c'est pour mieux t'aider.",
    cols: 1,
    options: [
      { value: "time",       emoji: "⏰", label: "Je manque de temps" },
      { value: "understand", emoji: "🤔", label: "Difficultés à comprendre mes cours" },
      { value: "exams",      emoji: "📝", label: "Préparer mes examens efficacement" },
      { value: "organize",   emoji: "📅", label: "Organiser mes révisions" },
    ],
  },
  {
    id: "source",
    question: "Comment tu as connu Study Mind ?",
    subtitle: "On est curieux de savoir !",
    cols: 2,
    options: [
      { value: "social",  emoji: "📱", label: "Réseaux sociaux" },
      { value: "friend",  emoji: "🤝", label: "Un(e) ami(e)" },
      { value: "google",  emoji: "🔍", label: "Recherche Google" },
      { value: "other",   emoji: "💬", label: "Autre" },
    ],
  },
];

type Answers = Record<string, string>;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone]       = useState(false);

  const current  = STEPS[step];
  const selected = answers[current.id];
  const isLast   = step === STEPS.length - 1;

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function handleNext() {
    if (!selected) return;
    if (isLast) {
      setDone(true);
      setTimeout(() => router.push("/signup"), 1800);
    } else {
      setStep((s) => s + 1);
    }
  }

  /* ── Success screen ── */
  if (done) {
    return (
      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-2xl shadow-violet-600/40 text-3xl">
          🎉
        </div>
        <h2 className="text-2xl font-extrabold text-white">Parfait !</h2>
        <p className="text-sm text-violet-300/70 max-w-xs leading-relaxed">
          On t&apos;amène vers la création de ton compte. C&apos;est parti !
        </p>
        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-7 rounded-full bg-violet-500 animate-pulse"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Wizard ── */
  return (
    <div className="relative z-10 w-full max-w-md flex flex-col gap-7">

      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5">
        <Logo size={26} />
        <span className="text-base font-extrabold text-white tracking-tight">
          Study Mind
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-violet-400">
          <span>
            Étape{" "}
            <span className="font-bold text-violet-300">{step + 1}</span>{" "}
            sur {STEPS.length}
          </span>
          <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
        </div>
        <div
          className="h-1 w-full rounded-full overflow-hidden"
          style={{ background: "rgba(139,92,246,0.2)" }}
        >
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="flex justify-center gap-2 pt-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? "20px" : "6px",
                height: "6px",
                background:
                  i < step
                    ? "#7C3AED"
                    : i === step
                      ? "#A78BFA"
                      : "rgba(139,92,246,0.25)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Question card — key forces remount for animation on step change */}
      <div
        key={step}
        className="animate-reveal rounded-2xl border border-violet-500/20 p-6"
        style={{
          background: "rgba(255,255,255,0.04)",
          boxShadow: "0 8px 32px rgba(109,40,217,0.15)",
          animationDuration: "0.32s",
          animationDelay: "0s",
        }}
      >
        <h2 className="text-lg font-extrabold text-white leading-snug mb-1">
          {current.question}
        </h2>
        <p className="text-xs text-violet-300/55 mb-5">{current.subtitle}</p>

        <div
          className={`grid gap-2 ${
            current.cols === 2 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {current.options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  isSelected
                    ? "border-violet-500 text-white"
                    : "border-violet-500/15 text-violet-300/65 hover:border-violet-500/40 hover:text-white"
                }`}
                style={
                  isSelected
                    ? { background: "rgba(124,58,237,0.22)" }
                    : { background: "rgba(255,255,255,0.02)" }
                }
              >
                <span className="text-base shrink-0">{opt.emoji}</span>
                <span className="flex-1 leading-snug">{opt.label}</span>
                {isSelected && (
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-violet-600">
                    <Check size={10} className="text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!selected}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-3.5 text-sm font-bold text-white transition hover:bg-violet-600 hover:shadow-xl hover:shadow-violet-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLast ? "Créer mon compte gratuit" : "Continuer"}
        <ArrowRight size={15} />
      </button>

      <p className="text-center text-xs text-violet-400/50">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="text-violet-400 hover:text-white underline underline-offset-2 transition"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
