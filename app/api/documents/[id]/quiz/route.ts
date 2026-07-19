import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse, AppError } from "@/lib/errors";
import {
  getDocument,
  updateDocumentAnalysis,
  updateDocumentStatus,
} from "@/lib/documents/repository";
import { createQuiz, listQuizzesForDocument } from "@/lib/quizzes/repository";
import { callDeepSeekJSON, DeepSeekError } from "@/lib/deepseek/client";
import {
  SUMMARY_SYSTEM_PROMPT,
  validateSummaryResult,
} from "@/lib/deepseek/prompts/summary";
import {
  QUIZ_SYSTEM_PROMPT,
  validateQuizResult,
} from "@/lib/deepseek/prompts/quiz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    await getDocument(user.id, id);
    const quizzes = await listQuizzesForDocument(user.id, id);
    return Response.json(quizzes);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// Déclenche le pipeline IA complet pour un document : génère le résumé +
// points clés (mis à jour sur documents) ET un nouveau quiz. Un seul
// appel synchrone (voir architecture.md §2.2 — Route Handler avec UI de
// chargement côté client, pas de polling nécessaire).
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string | undefined;
  let documentId: string | undefined;

  try {
    const user = await getCurrentUser();
    userId = user.id;
    const { id } = await params;
    documentId = id;

    const document = await getDocument(user.id, id);

    await updateDocumentStatus(user.id, id, "processing");

    const summary = await callDeepSeekJSON(
      SUMMARY_SYSTEM_PROMPT,
      document.extracted_text,
      validateSummaryResult
    );

    const quizData = await callDeepSeekJSON(
      QUIZ_SYSTEM_PROMPT,
      document.extracted_text,
      validateQuizResult
    );

    await updateDocumentAnalysis(user.id, id, {
      summary: summary.summary,
      keyPoints: summary.key_points,
    });

    const quiz = await createQuiz(user.id, id, quizData.questions);

    await updateDocumentStatus(user.id, id, "ready");

    return Response.json(quiz, { status: 201 });
  } catch (error) {
    if (userId && documentId) {
      await updateDocumentStatus(
        userId,
        documentId,
        "failed",
        error instanceof Error ? error.message : "Erreur inconnue"
      ).catch(() => {});
    }

    if (error instanceof DeepSeekError) {
      return toErrorResponse(
        new AppError("DEEPSEEK_INVALID_RESPONSE", error.message, 502)
      );
    }

    return toErrorResponse(error);
  }
}
