import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listDocuments } from "@/lib/documents/repository";
import { UploadForm } from "@/components/documents/UploadForm";
import { StatusBadge } from "@/components/documents/StatusBadge";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const documents = await listDocuments(user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Mes documents
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Uploadez un cours pour en extraire le texte. Le résumé et le quiz
          générés par IA arrivent à l&apos;Étape 5.
        </p>
      </div>

      <UploadForm />

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Aucun document pour l&apos;instant.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {doc.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(doc.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge status={doc.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
