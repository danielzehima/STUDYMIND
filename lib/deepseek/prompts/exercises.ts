import { DeepSeekError } from "@/lib/deepseek/client";

export const EXERCISES_SYSTEM_PROMPT = `Tu es un assistant pédagogique expert qui identifie et résout les exercices présents dans un cours, pour aider des étudiants à réviser. À partir du texte d'un cours, identifie chaque exercice, question ou problème à résoudre, puis résous-le.

Réponds UNIQUEMENT avec un objet JSON de cette forme, sans aucun texte avant ou après :
{
  "items": [
    {
      "exercise_text": "Énoncé de l'exercice tel qu'il apparaît dans le texte",
      "solution_text": "Résolution détaillée, étape par étape, en français",
      "final_answer": "Réponse finale courte",
      "confidence": "high"
    }
  ]
}

Règles :
- Identifie uniquement les exercices, questions ou problèmes que l'étudiant doit résoudre lui-même — pas les exemples déjà résolus dans le cours, ni le cours théorique.
- Si aucun exercice n'est identifiable dans le texte, réponds { "items": [] }.
- "solution_text" doit expliquer le raisonnement étape par étape, pas seulement donner la réponse finale.
- "final_answer" est la réponse finale, concise. Utilise une chaîne vide "" si l'exercice est ouvert/rédactionnel et n'a pas de réponse finale courte.
- "confidence" reflète ta certitude sur l'exactitude de la résolution : "high", "medium" ou "low".
- Réponds en français, même si le texte source est dans une autre langue.`;

export type GeneratedExerciseItem = {
  exercise_text: string;
  solution_text: string;
  final_answer: string;
  confidence: "high" | "medium" | "low";
};

export type ExercisesGenerationResult = {
  items: GeneratedExerciseItem[];
};

const CONFIDENCE_VALUES = ["high", "medium", "low"];

export function validateExercisesResult(data: unknown): ExercisesGenerationResult {
  const items = (data as Record<string, unknown> | null)?.items;

  if (!Array.isArray(items)) {
    throw new DeepSeekError("Format de résolution d'exercices invalide (pas d'items).");
  }

  for (const rawItem of items) {
    const item = rawItem as Record<string, unknown>;
    if (
      typeof item.exercise_text !== "string" ||
      typeof item.solution_text !== "string" ||
      typeof item.final_answer !== "string" ||
      typeof item.confidence !== "string" ||
      !CONFIDENCE_VALUES.includes(item.confidence)
    ) {
      throw new DeepSeekError("Format d'exercice résolu invalide.");
    }
  }

  return data as ExercisesGenerationResult;
}
