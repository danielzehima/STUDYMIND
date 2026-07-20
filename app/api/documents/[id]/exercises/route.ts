import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse, AppError } from "@/lib/errors";
import { requirePlan } from "@/lib/subscriptions/plan-limits";
import { getDocument } from "@/lib/documents/repository";
import {
  createResolution,
  markResolutionReady,
  markResolutionFailed,
  getLatestResolutionForDocument,
} from "@/lib/exercises/repository";
import { callDeepSeekJSON, DeepSeekError } from "@/lib/deepseek/client";
import {
  EXERCISES_SYSTEM_PROMPT,
  validateExercisesResult,
} from "@/lib/deepseek/prompts/exercises";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    await requirePlan(user.id, "pro");
    const { id } = await params;
    await getDocument(user.id, id);
    const resolution = await getLatestResolutionForDocument(user.id, id);
    return Response.json(resolution);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// Identifie et résout les exercices d'un document (Pro uniquement). Pipeline
// synchrone comme /api/documents/[id]/quiz (voir architecture.md §3.4) : un
// seul appel DeepSeek, pas de polling. Le statut sur exercise_resolutions
// sert surtout à garder une trace en cas d'échec.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string | undefined;
  let resolutionId: string | undefined;

  try {
    const user = await getCurrentUser();
    userId = user.id;
    await requirePlan(user.id, "pro");

    const { id } = await params;
    const document = await getDocument(user.id, id);

    const resolution = await createResolution(user.id, id);
    resolutionId = resolution.id;

    const result = await callDeepSeekJSON(
      EXERCISES_SYSTEM_PROMPT,
      document.extracted_text,
      validateExercisesResult
    );

    await markResolutionReady(user.id, resolution.id, result.items);

    const full = await getLatestResolutionForDocument(user.id, id);
    return Response.json(full, { status: 201 });
  } catch (error) {
    if (userId && resolutionId) {
      await markResolutionFailed(
        userId,
        resolutionId,
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
