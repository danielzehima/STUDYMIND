import { DeepSeekError } from "@/lib/deepseek/client";

export const SUMMARY_SYSTEM_PROMPT = `Tu es un assistant pédagogique expert qui aide des étudiants à réviser. À partir du texte d'un cours, tu dois produire un résumé structuré en français.

Réponds UNIQUEMENT avec un objet JSON de cette forme, sans aucun texte avant ou après :
{
  "summary": "Un résumé synthétique du cours en 3 à 6 phrases.",
  "key_points": ["Point clé 1", "Point clé 2"]
}

Règles :
- "summary" doit être un résumé fluide et clair, pas une liste.
- "key_points" doit contenir entre 4 et 8 points essentiels à retenir, formulés de façon concise.
- Reste factuel, base-toi uniquement sur le contenu du texte fourni.
- Réponds en français, même si le texte source est dans une autre langue.`;

export type SummaryResult = {
  summary: string;
  key_points: string[];
};

export function validateSummaryResult(data: unknown): SummaryResult {
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as Record<string, unknown>).summary !== "string" ||
    !Array.isArray((data as Record<string, unknown>).key_points) ||
    !((data as Record<string, unknown>).key_points as unknown[]).every(
      (k) => typeof k === "string"
    )
  ) {
    throw new DeepSeekError("Format de résumé invalide.");
  }

  return data as SummaryResult;
}
