import { DeepSeekError } from "@/lib/deepseek/client";

export const QUIZ_SYSTEM_PROMPT = `Tu es un assistant pédagogique expert qui crée des quiz de révision pour des étudiants. À partir du texte d'un cours, génère un quiz à choix multiples en français.

Réponds UNIQUEMENT avec un objet JSON de cette forme, sans aucun texte avant ou après :
{
  "questions": [
    {
      "question_text": "Texte de la question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Explication de pourquoi cette réponse est correcte."
    }
  ]
}

Règles :
- Génère entre 5 et 10 questions.
- Chaque question a exactement 4 options.
- "correct_index" est l'index (0 à 3) de la bonne réponse dans "options".
- "explanation" doit expliquer la bonne réponse en 1-2 phrases, utile même pour quelqu'un qui s'est trompé.
- Les questions doivent couvrir les points importants du texte, pas des détails triviaux.
- Réponds en français, même si le texte source est dans une autre langue.`;

export type QuizGenerationResult = {
  questions: Array<{
    question_text: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }>;
};

export function validateQuizResult(data: unknown): QuizGenerationResult {
  const questions = (data as Record<string, unknown> | null)?.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new DeepSeekError("Format de quiz invalide (pas de questions).");
  }

  for (const q of questions) {
    const question = q as Record<string, unknown>;
    if (
      typeof question.question_text !== "string" ||
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      !question.options.every((o: unknown) => typeof o === "string") ||
      typeof question.correct_index !== "number" ||
      question.correct_index < 0 ||
      question.correct_index > 3 ||
      typeof question.explanation !== "string"
    ) {
      throw new DeepSeekError("Format de question de quiz invalide.");
    }
  }

  return data as QuizGenerationResult;
}
