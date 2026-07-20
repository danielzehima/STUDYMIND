import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "@/lib/documents/repository";
import { getSubscription } from "@/lib/subscriptions/repository";
import { getLatestResolutionForDocument } from "@/lib/exercises/repository";
import { ProLockedBanner } from "@/components/exercises/ProLockedBanner";
import { GenerateExercisesButton } from "@/components/exercises/GenerateExercisesButton";
import { ExerciseSolutionCard } from "@/components/exercises/ExerciseSolutionCard";
import { NotFoundError } from "@/lib/errors";

export default async function DocumentExercisesPage({
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

  const subscription = await getSubscription(user.id);
  const isPro = subscription.plan === "pro";

  const resolution = isPro
    ? await getLatestResolutionForDocument(user.id, id)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/documents/${id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-600"
        >
          <ArrowLeft size={14} />
          Retour au document
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Résolution d&apos;exercices
        </h1>
        <p className="mt-1 text-sm text-slate-500">{document.title}</p>
      </div>

      {!isPro && <ProLockedBanner />}

      {isPro && (
        <>
          <GenerateExercisesButton
            documentId={id}
            label={
              resolution ? "Relancer la résolution" : "Résoudre les exercices"
            }
          />

          {resolution?.status === "failed" && resolution.error_message && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {resolution.error_message}
            </div>
          )}

          {resolution?.status === "ready" && resolution.items.length === 0 && (
            <p className="text-sm text-slate-500">
              Aucun exercice n&apos;a été identifié dans ce document.
            </p>
          )}

          {resolution?.status === "ready" &&
            resolution.items.map((item, index) => (
              <ExerciseSolutionCard
                key={item.id}
                index={index}
                exerciseText={item.exercise_text}
                solutionText={item.solution_text}
                finalAnswer={item.final_answer}
                confidence={item.confidence}
              />
            ))}
        </>
      )}
    </div>
  );
}
