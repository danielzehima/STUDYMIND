import "server-only";

type GradableQuestion = {
  id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

type SubmittedAnswer = {
  question_id: string;
  selected_index: number | null;
};

// Correction toujours faite côté serveur par correspondance exacte
// d'index — ne jamais faire confiance à un score envoyé par le client.
export function gradeAnswers(
  questions: GradableQuestion[],
  submittedAnswers: SubmittedAnswer[]
) {
  const selectedByQuestionId = new Map(
    submittedAnswers.map((a) => [a.question_id, a.selected_index])
  );

  const results = questions.map((q) => {
    const selectedIndex = selectedByQuestionId.get(q.id) ?? null;
    const isCorrect = selectedIndex === q.correct_index;
    return {
      question_id: q.id,
      question_text: q.question_text,
      options: q.options,
      selected_index: selectedIndex,
      correct_index: q.correct_index,
      is_correct: isCorrect,
      explanation: q.explanation,
    };
  });

  const score = results.filter((r) => r.is_correct).length;

  return { results, score };
}
