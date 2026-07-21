import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Gratuit",
    price: "0 FCFA",
    period: "",
    description: "Pour découvrir la plateforme et réviser vos premiers cours.",
    features: [
      "3 documents inclus",
      "Résumés générés par IA",
      "Quiz interactifs illimités",
      "Feedback détaillé sur vos réponses",
      "Export fiche PDF",
    ],
    cta: "Commencer",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "3 000 FCFA",
    period: "/mois",
    description:
      "Pour les étudiants qui veulent réviser sans limites, examens compris.",
    features: [
      "Documents illimités",
      "Tout le plan Gratuit",
      "Résolution complète d'exercices IA",
      "Explications pas à pas",
      "Support prioritaire",
    ],
    cta: "Passer au Pro",
    href: "/signup",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section
      id="tarifs"
      className="relative bg-[#0D0B1A] px-6 py-28 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 100%, rgba(124,58,237,0.2) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center mb-16">
          <p className="text-xs font-black tracking-[0.18em] uppercase text-violet-500 mb-3">
            Tarifs
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Un tarif simple, pensé pour les étudiants
          </h2>
          <p className="mt-4 text-sm text-violet-300/60 leading-relaxed">
            Commencez gratuitement, passez au Pro quand vous en avez besoin.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition ${
                plan.highlighted
                  ? "border-violet-500/40 backdrop-blur-md"
                  : "border-violet-500/15"
              }`}
              style={
                plan.highlighted
                  ? {
                      background: "rgba(255,255,255,0.06)",
                      boxShadow: "0 0 60px rgba(109,40,217,0.2)",
                    }
                  : { background: "rgba(255,255,255,0.03)" }
              }
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-violet-600/30">
                  Le plus populaire
                </span>
              )}

              <h3 className="text-base font-bold text-white">{plan.name}</h3>
              <p className="mt-1.5 text-xs text-violet-300/55 leading-relaxed">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-black tracking-tight text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-violet-400">{plan.period}</span>
                )}
              </div>

              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check
                      size={15}
                      className={`shrink-0 ${
                        plan.highlighted ? "text-violet-400" : "text-violet-500"
                      }`}
                    />
                    <span className="text-violet-200/75">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition ${
                  plan.highlighted
                    ? "bg-violet-600 text-white hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-600/30"
                    : "text-white hover:bg-white/10"
                }`}
                style={!plan.highlighted ? { background: "rgba(255,255,255,0.08)" } : undefined}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-violet-500">
          Option trimestrielle disponible : 7 500 FCFA / trimestre (≈ 2 500 FCFA/mois).
        </p>
      </div>
    </section>
  );
}
