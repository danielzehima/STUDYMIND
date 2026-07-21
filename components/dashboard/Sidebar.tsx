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
  { href: "/dashboard",     label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/documents",     label: "Mes documents",   icon: FileText        },
  { href: "/history",       label: "Historique",       icon: History         },
  { href: "/subscription",  label: "Abonnement",       icon: CreditCard      },
  { href: "/feedback",      label: "Feedback",          icon: MessageSquare   },
];

const ADMIN_LINK = { href: "/admin", label: "Administration", icon: ShieldCheck };

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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#1E1B2E", borderRight: "1px solid rgba(139,92,246,0.15)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-extrabold tracking-tight text-white">
              Study Mind
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="text-violet-400 hover:text-white transition lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav label */}
        <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(139,92,246,0.5)" }}>
          Menu
        </p>

        {/* Links */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                    : "text-violet-200/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <link.icon size={17} className={active ? "text-white" : "text-violet-400"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom divider */}
        <div className="mx-5 mb-5 mt-2 rounded-xl p-3"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs font-semibold text-violet-300">Study Mind</p>
          <p className="text-[10px] text-violet-400/60 mt-0.5">Révise plus vite avec l&apos;IA</p>
        </div>
      </aside>
    </>
  );
}
