const STATUS_STYLES: Record<string, string> = {
  uploaded: "bg-slate-100 text-slate-600",
  processing: "bg-amber-100 text-amber-700",
  ready: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Uploadé",
  processing: "Traitement...",
  ready: "Prêt",
  failed: "Échec",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
