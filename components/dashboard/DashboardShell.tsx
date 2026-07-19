"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { PlanBadge } from "./PlanBadge";
import { logout } from "@/app/actions/auth";

export function DashboardShell({
  email,
  plan,
  children,
}: {
  email: string;
  plan: "free" | "pro";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="text-slate-600 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <PlanBadge plan={plan} />
            <span className="hidden text-sm text-slate-500 sm:inline">
              {email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
