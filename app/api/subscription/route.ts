import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/errors";
import { getSubscription } from "@/lib/subscriptions/repository";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const subscription = await getSubscription(user.id);
    return Response.json(subscription);
  } catch (error) {
    return toErrorResponse(error);
  }
}
