import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/errors";
import { getDocument } from "@/lib/documents/repository";
import { listAttemptsForDocument } from "@/lib/quizzes/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    await getDocument(user.id, id);
    const attempts = await listAttemptsForDocument(user.id, id);
    return Response.json(attempts);
  } catch (error) {
    return toErrorResponse(error);
  }
}
