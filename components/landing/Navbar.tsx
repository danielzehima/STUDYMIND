"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const NAV_LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={`flex items-center justify-between px-6 lg:px-12 h-16 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#0D0B1A]/85 backdrop-blur-xl border-violet-500/20"
            : "bg-transparent border-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo size={28} />
          <span className="text-base font-extrabold tracking-tight text-white">
            Study Mind
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block px-3 py-1.5 text-sm font-medium text-violet-300 rounded-lg transition hover:text-white hover:bg-violet-500/10"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="px-3 py-1.5 text-sm font-semibold text-violet-300 rounded-lg transition hover:text-white hover:bg-violet-500/10"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-violet-700 rounded-lg transition hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-600/30 hover:-translate-y-px"
          >
            Commencer gratuit
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="flex items-center justify-center w-9 h-9 text-violet-300 md:hidden rounded-lg hover:bg-violet-500/10 transition"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#0D0B1A] border-b border-violet-500/20 px-6 py-4">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-violet-300 rounded-lg hover:text-white hover:bg-violet-500/10 transition"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-violet-500/20 my-2" />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-violet-300 rounded-lg hover:text-white hover:bg-violet-500/10 transition"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 mt-1 text-sm font-bold text-white bg-violet-700 rounded-lg hover:bg-violet-600 transition"
            >
              Commencer gratuit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
