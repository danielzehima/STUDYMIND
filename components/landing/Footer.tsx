import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Logo size={24} />
          Study Mind
        </span>

        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="#" className="transition hover:text-slate-900">
            Mentions légales
          </a>
          <Link href="/contact" className="transition hover:text-slate-900">
            Contact
          </Link>
        </div>

        <span className="text-sm text-slate-400">
          © {new Date().getFullYear()} Study Mind. Tous droits réservés.
        </span>
      </div>
    </footer>
  );
}
