import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/errors";
import { downgradeToFree } from "@/lib/subscriptions/repository";

export async function POST() {
  try {
    const user = await getCurrentUser();
    const subscription = await downgradeToFree(user.id);
    return Response.json(subscription);
  } catch (error) {
    return toErrorResponse(error);
  }
}
