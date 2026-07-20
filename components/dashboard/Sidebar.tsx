"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  History,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/documents", label: "Mes documents", icon: FileText },
  { href: "/history", label: "Historique", icon: History },
  { href: "/subscription", label: "Abonnement", icon: CreditCard },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

const ADMIN_LINK = {
  href: "/admin",
  label: "Administration",
  icon: ShieldCheck,
};

export function Sidebar({
  open,
  onClose,
  isAdmin = false,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const links = isAdmin ? [...LINKS, ADMIN_LINK] : LINKS;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Study Mind
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="text-slate-500 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
