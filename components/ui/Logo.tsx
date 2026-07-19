// Affiche uniquement la partie icône du logo source (public/logo-mark.png,
// qui contient le pictogramme + le texte "Study Mind" empilés verticalement)
// via un recadrage CSS (overflow-hidden + image mise à l'échelle par la
// largeur) — évite une dépendance d'édition d'image côté build.
export function Logo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const height = Math.round(size * 1.18);

  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-lg ${className}`}
      style={{ width: size, height }}
    >
      <img
        src="/logo-mark.png"
        alt="Study Mind"
        className="h-auto w-full"
        style={{ display: "block" }}
      />
    </span>
  );
}
