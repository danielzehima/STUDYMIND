import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell
      email={user.email ?? ""}
      plan={(profile?.plan as "free" | "pro") ?? "free"}
      isAdmin={profile?.is_admin ?? false}
    >
      {children}
    </DashboardShell>
  );
}
