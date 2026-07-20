import { createClient } from "@/lib/supabase/server";
import { toErrorResponse, AppError } from "@/lib/errors";
import { createContactMessage } from "@/lib/contact/repository";

const MAX_MESSAGE_LENGTH = 4000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Formulaire public (/contact) — accessible sans connexion, donc pas de
// getCurrentUser() ici (il lèverait UnauthorizedError). Si un utilisateur
// connecté envoie le formulaire, on rattache quand même son user_id.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      throw new AppError("INVALID_CONTACT", "Tous les champs sont requis.", 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new AppError("INVALID_CONTACT", "Adresse email invalide.", 400);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new AppError(
        "INVALID_CONTACT",
        `Le message dépasse la longueur maximale (${MAX_MESSAGE_LENGTH} caractères).`,
        400
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const contactMessage = await createContactMessage({
      userId: user?.id ?? null,
      name,
      email,
      message,
    });

    return Response.json(contactMessage, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
