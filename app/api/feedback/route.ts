import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse, AppError } from "@/lib/errors";
import { createFeedback } from "@/lib/feedback/repository";

const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => null);

    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      throw new AppError("INVALID_FEEDBACK", "Le message ne peut pas être vide.", 400);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new AppError(
        "INVALID_FEEDBACK",
        `Le message dépasse la longueur maximale (${MAX_MESSAGE_LENGTH} caractères).`,
        400
      );
    }

    const rawRating = body?.rating;
    let rating: number | null = null;
    if (rawRating !== undefined && rawRating !== null) {
      if (
        typeof rawRating !== "number" ||
        !Number.isInteger(rawRating) ||
        rawRating < 1 ||
        rawRating > 5
      ) {
        throw new AppError("INVALID_FEEDBACK", "La note doit être un entier entre 1 et 5.", 400);
      }
      rating = rawRating;
    }

    const feedback = await createFeedback(user.id, message, rating);
    return Response.json(feedback, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
