"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          Révision<span className="text-indigo-600">IA</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md"
          >
            Commencer gratuitement
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="text-slate-700 md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-600"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-slate-200" />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-600"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
