import Image from "next/image";

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
  // Dimensions intrinsèques réelles de public/logo-mark.png, pour que
  // next/image calcule le bon ratio ; la taille affichée reste pilotée par
  // le wrapper (overflow-hidden + w-full).
  const naturalWidth = 784;
  const naturalHeight = 1168;

  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-lg ${className}`}
      style={{ width: size, height }}
    >
      <Image
        src="/logo-mark.png"
        alt="Study Mind"
        width={naturalWidth}
        height={naturalHeight}
        className="h-auto w-full"
      />
    </span>
  );
}
