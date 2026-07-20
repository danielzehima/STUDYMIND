import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Feedback</h1>
        <p className="mt-1 text-sm text-slate-500">
          Votre avis nous aide à améliorer Study Mind — dites-nous ce qui
          fonctionne, ce qui manque, ou ce qui vous bloque.
        </p>
      </div>
      <div className="max-w-xl">
        <FeedbackForm />
      </div>
    </div>
  );
}
