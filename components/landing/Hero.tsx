import Link from "next/link";

const CARD_ITEMS = [
  {
    icon: "📋",
    label: "Résumé",
    text: "Le premier principe établit la conservation de l'énergie dans un système fermé…",
    delay: "0.35s",
  },
  {
    icon: "🧠",
    label: "Quiz — 8 questions",
    text: "Quelle est l'expression du travail d'une machine thermique réversible ?",
    delay: "0.72s",
  },
  {
    icon: "✅",
    label: "Exercice résolu · Pro",
    text: "η = 1 − Q₂/Q₁ = 33,3 %",
    delay: "1.1s",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0D0B1A] pt-16">
      {/* Background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 8% 55%, rgba(124,58,237,0.32) 0%, transparent 100%), " +
            "radial-gradient(ellipse 45% 60% at 85% 25%, rgba(139,92,246,0.18) 0%, transparent 100%)",
        }}
      />
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(139,92,246,0.11) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left: copy */}
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-300 mb-7">
            <span className="animate-blink-dot w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
            IA pour étudiants
          </span>

          <p className="text-xs font-black tracking-[0.2em] uppercase text-violet-500 mb-4">
            Study Mind
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold leading-[1.07] tracking-[-0.03em] text-white mb-5">
            Tes cours<br />
            deviennent des<br />
            <span className="text-violet-400">fiches de révision</span><br />
            en secondes.
          </h1>

          <p className="text-base text-violet-200/70 leading-relaxed max-w-[42ch] mb-9">
            Upload un PDF ou docx — l&apos;IA génère résumé, quiz et exercices
            résolus avec explications. Gratuit pour commencer, sans carte bancaire.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-7">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-violet-700 rounded-xl transition hover:bg-violet-600 hover:shadow-xl hover:shadow-violet-600/40 hover:-translate-y-0.5"
            >
              Essayer gratuitement
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 transition hover:text-white"
            >
              Voir comment ça marche
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <p className="flex items-center gap-2 text-xs text-violet-500">
            <span aria-hidden="true">🇨🇮</span>
            Fait pour les étudiants ivoiriens
            <span className="w-1 h-1 rounded-full bg-violet-600 inline-block" aria-hidden="true" />
            Paiement mobile money
          </p>
        </div>

        {/* Right: glass card */}
        <div className="flex justify-center lg:justify-end">
          <div
            className="animate-float-hero w-full max-w-sm rounded-2xl border border-violet-500/20 p-5 backdrop-blur-2xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              boxShadow:
                "0 8px 40px rgba(109,40,217,0.28), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
            role="img"
            aria-label="Démonstration : document PDF transformé en fiche de révision"
          >
            {/* File header */}
            <div className="flex items-center gap-3 pb-4 border-b border-violet-500/15 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: "rgba(139,92,246,0.12)" }}
              >
                📄
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-snug">
                  Cours_Thermodynamique_S2.pdf
                </p>
                <p className="text-xs text-violet-400 mt-0.5">
                  Uploadé il y a 3 s · 42 pages
                </p>
              </div>
            </div>

            {/* AI label */}
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-widest text-violet-500 mb-3">
              <span className="flex-1 h-px bg-violet-500/20" />
              Généré par l&apos;IA
              <span className="flex-1 h-px bg-violet-500/20" />
            </div>

            {/* Output items */}
            <div className="flex flex-col gap-2 mb-4">
              {CARD_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="animate-reveal flex items-start gap-2.5 rounded-xl p-3"
                  style={{
                    background: "rgba(139,92,246,0.07)",
                    animationDelay: item.delay,
                  }}
                >
                  <span className="text-sm shrink-0 mt-0.5" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <span className="block text-[9.5px] font-bold uppercase tracking-widest text-violet-400 mb-0.5">
                      {item.label}
                    </span>
                    <span className="text-xs text-violet-200/80 leading-relaxed">
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer pills */}
            <div className="flex gap-2">
              {["📥 Fiche PDF", "⚡ 3 000 FCFA/mois"].map((pill) => (
                <div
                  key={pill}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-violet-500/20 py-2 text-xs font-semibold text-violet-300"
                  style={{ background: "rgba(139,92,246,0.10)" }}
                >
                  {pill}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
