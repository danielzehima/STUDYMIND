import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminRequiredError } from "@/lib/errors";

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  return profile?.is_admin ?? false;
}

// À appeler en tête de toute route réservée aux administrateurs
// (voir app/api/admin/**).
export async function requireAdmin(userId: string): Promise<void> {
  if (!(await isAdmin(userId))) {
    throw new AdminRequiredError();
  }
}
