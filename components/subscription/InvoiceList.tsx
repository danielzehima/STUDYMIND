import { Download } from "lucide-react";
import type { Invoice } from "@/lib/invoices/repository";

const PERIOD_LABEL: Record<"monthly" | "quarterly", string> = {
  monthly: "1 mois",
  quarterly: "1 trimestre",
};

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-900">
        Historique de facturation
      </h2>
      <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {PERIOD_LABEL[invoice.period]} — {invoice.amount.toLocaleString("fr-FR")} FCFA
              </p>
              <p className="text-xs text-slate-400">
                {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Download size={14} />
              Facture
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
