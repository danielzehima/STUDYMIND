import Link from "next/link";
import { Check } from "lucide-react";

// Tarifs confirmés — voir architecture.md §4.2
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
      "Résolution complète d'exercices par IA",
      "Support prioritaire",
    ],
    cta: "Passer au niveau supérieur",
    href: "/signup",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="tarifs" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Un tarif simple, pensé pour les étudiants
          </h2>
          <p className="mt-4 text-slate-500">
            Commencez gratuitement, passez au niveau supérieur quand vous en
            avez besoin.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-indigo-600 bg-slate-900 shadow-xl shadow-indigo-600/10 hover:shadow-2xl"
                  : "border-slate-200 bg-white shadow-sm hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Le plus populaire
                </span>
              )}

              <h3
                className={`text-lg font-semibold ${
                  plan.highlighted ? "text-white" : "text-slate-900"
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`mt-2 text-sm ${
                  plan.highlighted ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span
                  className={`text-4xl font-bold ${
                    plan.highlighted ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={
                      plan.highlighted ? "text-slate-300" : "text-slate-500"
                    }
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check
                      size={18}
                      className={`shrink-0 ${
                        plan.highlighted ? "text-indigo-400" : "text-indigo-600"
                      }`}
                    />
                    <span
                      className={
                        plan.highlighted ? "text-slate-200" : "text-slate-600"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Option trimestrielle disponible : 7 500 FCFA / trimestre (≈ 2 500
          FCFA/mois).
        </p>
      </div>
    </section>
  );
}
