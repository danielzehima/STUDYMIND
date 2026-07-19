import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuizForPlay } from "@/lib/quizzes/repository";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { NotFoundError } from "@/lib/errors";

export default async function QuizPlayPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { quizId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let quiz;
  try {
    quiz = await getQuizForPlay(user.id, quizId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900">Quiz</h1>
      <QuizPlayer quizId={quiz.id} questions={quiz.questions} />
    </div>
  );
}
