import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/errors";
import { getQuizForPlay } from "@/lib/quizzes/repository";

// Quiz à jouer : correct_index/explanation volontairement absents de la
// réponse — ne jamais faire confiance au client pour la correction.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { quizId } = await params;
    const quiz = await getQuizForPlay(user.id, quizId);
    return Response.json(quiz);
  } catch (error) {
    return toErrorResponse(error);
  }
}
