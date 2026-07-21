import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer
      className="bg-[#0D0B1A]"
      style={{ borderTop: "1px solid rgba(139,92,246,0.15)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-10 sm:flex-row">
        <span className="flex items-center gap-2.5 text-sm font-extrabold text-white">
          <Logo size={24} />
          Study Mind
        </span>

        <div className="flex items-center gap-6 text-sm text-violet-400">
          <a href="#" className="transition hover:text-white">
            Mentions légales
          </a>
          <Link href="/contact" className="transition hover:text-white">
            Contact
          </Link>
          <a href="#tarifs" className="transition hover:text-white">
            Tarifs
          </a>
        </div>

        <span className="text-xs text-violet-600">
          © {new Date().getFullYear()} Study Mind. Tous droits réservés.{" "}
          <span aria-label="Côte d'Ivoire">🇨🇮</span>
        </span>
      </div>
    </footer>
  );
}
