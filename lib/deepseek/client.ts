import "server-only";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// deepseek-chat/deepseek-reasoner sont dépréciés le 24/07/2026 (voir
// architecture.md §4.3) — on utilise directement le nouvel identifiant.
const MODEL = "deepseek-v4-flash";

export class DeepSeekError extends Error {}

async function callOnce(
  systemPrompt: string,
  userContent: string,
  temperature: number
): Promise<unknown> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new DeepSeekError(
      `Erreur API DeepSeek (${response.status}): ${text.slice(0, 300)}`
    );
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new DeepSeekError("Réponse DeepSeek invalide (pas de contenu).");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new DeepSeekError("Réponse DeepSeek invalide (JSON non parsable).");
  }
}

// Appel générique JSON avec retry unique à température 0 si le premier
// essai échoue (erreur réseau, JSON invalide, ou forme inattendue via
// `validate`) — voir architecture.md §"Module IA (DeepSeek)".
export async function callDeepSeekJSON<T>(
  systemPrompt: string,
  userContent: string,
  validate: (data: unknown) => T
): Promise<T> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new DeepSeekError("DEEPSEEK_API_KEY manquant côté serveur.");
  }

  try {
    const raw = await callOnce(systemPrompt, userContent, 0.3);
    return validate(raw);
  } catch (firstError) {
    console.error(
      "[deepseek] première tentative échouée, nouvelle tentative à température 0",
      firstError
    );
    const raw = await callOnce(systemPrompt, userContent, 0);
    return validate(raw);
  }
}
