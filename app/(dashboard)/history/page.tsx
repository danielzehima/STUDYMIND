import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listAllAttempts } from "@/lib/quizzes/repository";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const attempts = await listAllAttempts(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Historique</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vos tentatives de quiz, tous documents confondus.
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Aucune tentative pour l&apos;instant.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {attempts.map((attempt) => (
            <li
              key={attempt.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                {attempt.document_id ? (
                  <Link
                    href={`/documents/${attempt.document_id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
                  >
                    {attempt.document_title}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-slate-900">
                    {attempt.document_title}
                  </span>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(attempt.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className="text-sm font-semibold text-indigo-600">
                {attempt.score} / {attempt.total_questions}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
