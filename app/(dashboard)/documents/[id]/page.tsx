import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/repository";
import { listQuizzesForDocument } from "@/lib/quizzes/repository";
import { StatusBadge } from "@/components/documents/StatusBadge";
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton";
import { GenerateAnalysisButton } from "@/components/documents/GenerateAnalysisButton";
import { NotFoundError } from "@/lib/errors";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let document;
  try {
    document = await getDocument(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const quizzes =
    document.status === "ready" ? await listQuizzesForDocument(user.id, id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {document.title}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {document.original_filename}
          </p>
        </div>
        <StatusBadge status={document.status} />
      </div>

      <div className="flex items-center gap-3">
        <DeleteDocumentButton documentId={document.id} />
      </div>

      {document.status === "failed" && document.error_message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {document.error_message}
        </div>
      )}

      {(document.status === "uploaded" || document.status === "failed") && (
        <GenerateAnalysisButton
          documentId={document.id}
          label={
            document.status === "failed"
              ? "Réessayer"
              : "Générer le résumé et le quiz"
          }
        />
      )}

      {document.status === "ready" && document.summary && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Résumé</h2>
          <p className="mt-3 text-sm text-slate-600">{document.summary}</p>

          {document.key_points && document.key_points.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {document.key_points.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {quizzes.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Quiz générés
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {quizzes.map((quiz) => (
              <li key={quiz.id}>
                <Link
                  href={`/documents/${id}/quiz/${quiz.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <ListChecks size={16} className="text-indigo-600" />
                    Quiz du{" "}
                    {new Date(quiz.created_at).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-indigo-600">Lancer →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {document.status === "ready" && (
        <GenerateAnalysisButton
          documentId={document.id}
          label="Générer un nouveau quiz"
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Texte extrait
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
          {document.extracted_text.slice(0, 2000)}
          {document.extracted_text.length > 2000 && "…"}
        </p>
      </div>
    </div>
  );
}
