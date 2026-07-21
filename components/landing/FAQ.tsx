"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    question: "Comment fonctionne Study Mind ?",
    answer:
      "Vous uploadez un document (PDF, Word ou texte), et notre IA analyse le contenu pour générer automatiquement un résumé, des points clés et un quiz interactif. Sur le plan Pro, elle identifie et résout aussi les exercices présents dans le document.",
  },
  {
    question: "Quels types de fichiers sont acceptés ?",
    answer:
      "Study Mind accepte les fichiers PDF (.pdf), Word (.docx) et texte brut (.txt). La taille maximale par document est de 10 Mo.",
  },
  {
    question: "Le plan Gratuit est-il vraiment gratuit ?",
    answer:
      "Oui, sans carte bancaire ni engagement. Vous pouvez uploader jusqu'à 3 documents, générer des résumés et passer des quiz illimités. Vous passez au Pro uniquement si vous avez besoin de plus.",
  },
  {
    question: "Comment payer le plan Pro en Côte d'Ivoire ?",
    answer:
      "Nous acceptons Mobile Money (MTN MoMo, Orange Money, Wave) ainsi que les cartes bancaires via notre partenaire de paiement GeniusPay. Le paiement est 100 % sécurisé.",
  },
  {
    question: "Puis-je annuler mon abonnement Pro à tout moment ?",
    answer:
      "Oui, vous pouvez annuler depuis votre espace abonnement sans frais ni préavis. Votre accès Pro reste actif jusqu'à la fin de la période en cours.",
  },
  {
    question: "La résolution d'exercices est-elle toujours correcte ?",
    answer:
      "L'IA fournit un niveau de confiance pour chaque résolution et détaille les étapes de calcul. Comme tout outil IA, elle peut commettre des erreurs sur des problèmes très complexes — utilisez-la comme aide à la compréhension, pas comme correction définitive.",
  },
  {
    question: "Mes documents sont-ils confidentiels ?",
    answer:
      "Vos fichiers sont stockés de façon sécurisée et ne sont jamais partagés avec d'autres utilisateurs. Seule l'IA les analyse pour générer votre contenu de révision.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border border-violet-500/15 transition hover:border-violet-500/25"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-sm font-semibold text-white leading-snug">
          {question}
        </span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-violet-400 transition mt-0.5"
          style={{ background: "rgba(139,92,246,0.12)" }}
        >
          {open ? <Minus size={13} /> : <Plus size={13} />}
        </span>
      </button>

      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-violet-300/65 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <section
      id="faq"
      className="relative bg-[#0D0B1A] px-6 py-28 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-xs font-black tracking-[0.18em] uppercase text-violet-500 mb-3">
            FAQ
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-sm text-violet-300/60 leading-relaxed">
            Tout ce que vous devez savoir avant de commencer.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
