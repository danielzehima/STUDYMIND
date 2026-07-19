export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <span className="text-sm font-semibold text-slate-900">
          Révision<span className="text-indigo-600">IA</span>
        </span>

        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="#" className="transition hover:text-slate-900">
            Mentions légales
          </a>
          <a href="#" className="transition hover:text-slate-900">
            Contact
          </a>
        </div>

        <span className="text-sm text-slate-400">
          © {new Date().getFullYear()} Révision Intelligente. Tous droits
          réservés.
        </span>
      </div>
    </footer>
  );
}
