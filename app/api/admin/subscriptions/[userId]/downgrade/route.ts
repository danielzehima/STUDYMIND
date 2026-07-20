import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/admin";
import { toErrorResponse } from "@/lib/errors";
import { downgradeToFree } from "@/lib/subscriptions/repository";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getCurrentUser();
    await requireAdmin(admin.id);
    const { userId } = await params;
    const subscription = await downgradeToFree(userId);
    return Response.json(subscription);
  } catch (error) {
    return toErrorResponse(error);
  }
}
