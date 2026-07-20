import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ContactMessage = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export async function createContactMessage(input: {
  userId: string | null;
  name: string;
  email: string;
  message: string;
}): Promise<ContactMessage> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      user_id: input.userId,
      name: input.name,
      email: input.email,
      message: input.message,
    })
    .select("id, user_id, name, email, message, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function listContactMessages(limit = 100): Promise<ContactMessage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, user_id, name, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
