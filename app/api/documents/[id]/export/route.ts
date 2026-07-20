import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse, AppError } from "@/lib/errors";
import { getDocument } from "@/lib/documents/repository";
import {
  listQuizzesForDocument,
  getQuizWithAnswers,
} from "@/lib/quizzes/repository";
import { getSubscription } from "@/lib/subscriptions/repository";
import { getLatestResolutionForDocument } from "@/lib/exercises/repository";
import { buildStudySheetPdf } from "@/lib/documents/export";

function sanitizeFilename(title: string): string {
  return (
    title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "document"
  );
}

// Disponible sur les deux forfaits (Free/Pro) une fois l'analyse générée.
// Section "Exercices résolus" incluse seulement si l'utilisateur est
// actuellement Pro et qu'une résolution existe (même logique de gating que
// la page /documents/[id]/exercises).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const document = await getDocument(user.id, id);

    if (document.status !== "ready") {
      throw new AppError(
        "EXPORT_NOT_READY",
        "Aucune analyse disponible pour ce document pour l'instant.",
        409
      );
    }

    const quizzes = await listQuizzesForDocument(user.id, id);
    const latestQuiz = quizzes[0];
    const quizQuestions = latestQuiz
      ? await getQuizWithAnswers(user.id, latestQuiz.id)
      : [];

    const subscription = await getSubscription(user.id);
    let exerciseItems: Array<{
      exercise_text: string;
      solution_text: string;
      final_answer: string | null;
    }> = [];

    if (subscription.plan === "pro") {
      const resolution = await getLatestResolutionForDocument(user.id, id);
      if (resolution?.status === "ready") {
        exerciseItems = resolution.items;
      }
    }

    const pdfBuffer = await buildStudySheetPdf({
      title: document.title,
      summary: document.summary,
      keyPoints: document.key_points,
      quizQuestions,
      exerciseItems,
    });

    const filename = `${sanitizeFilename(document.title)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
