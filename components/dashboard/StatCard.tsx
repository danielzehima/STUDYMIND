import type { LucideIcon } from "lucide-react";

type Accent = "violet" | "emerald" | "amber" | "blue";

const ACCENT_STYLES: Record<Accent, { bar: string; iconBg: string; iconText: string }> = {
  violet: { bar: "bg-violet-500",  iconBg: "bg-violet-50",  iconText: "text-violet-600" },
  emerald: { bar: "bg-emerald-500", iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
  amber:   { bar: "bg-amber-400",   iconBg: "bg-amber-50",   iconText: "text-amber-600"  },
  blue:    { bar: "bg-blue-500",    iconBg: "bg-blue-50",    iconText: "text-blue-600"   },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "violet",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: Accent;
}) {
  const c = ACCENT_STYLES[accent];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* accent bar */}
      <div className={`absolute inset-x-0 top-0 h-[3px] ${c.bar}`} />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.iconBg} ${c.iconText}`}>
          <Icon size={16} />
        </div>
      </div>

      <p className="mt-4 text-4xl font-black tracking-tight text-slate-900 leading-none">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-xs font-medium text-slate-400">{hint}</p>
      )}
    </div>
  );
}
