import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse, AppError } from "@/lib/errors";
import { getQuizWithAnswers, createAttempt } from "@/lib/quizzes/repository";
import { gradeAnswers } from "@/lib/quizzes/grading";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { quizId } = await params;
    const body = await request.json().catch(() => null);

    if (!body || !Array.isArray(body.answers)) {
      throw new AppError("INVALID_ANSWERS", "Réponses invalides.", 400);
    }

    const questions = await getQuizWithAnswers(user.id, quizId);
    const { results, score } = gradeAnswers(questions, body.answers);

    const attempt = await createAttempt(
      user.id,
      quizId,
      results.map((r) => ({
        question_id: r.question_id,
        selected_index: r.selected_index,
        is_correct: r.is_correct,
      })),
      score
    );

    return Response.json({
      attempt_id: attempt.id,
      score,
      total_questions: questions.length,
      results,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
