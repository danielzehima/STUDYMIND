import { Star } from "lucide-react";
import type { FeedbackWithProfile } from "@/lib/feedback/repository";

export function FeedbackList({ feedback }: { feedback: FeedbackWithProfile[] }) {
  if (feedback.length === 0) {
    return (
      <p className="text-sm text-slate-500">Aucun retour pour le moment.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {feedback.map((f) => (
        <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {f.full_name || f.email}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(f.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
            {f.rating !== null && (
              <div className="flex shrink-0 gap-0.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    size={14}
                    className={
                      value <= f.rating!
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
            {f.message}
          </p>
        </div>
      ))}
    </div>
  );
}
