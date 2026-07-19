import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError } from "@/lib/errors";

export type GeneratedQuestion = {
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export async function createQuiz(
  userId: string,
  documentId: string,
  questions: GeneratedQuestion[]
) {
  const supabase = createAdminClient();

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({ user_id: userId, document_id: documentId })
    .select("id, document_id, created_at")
    .single();

  if (quizError) throw quizError;

  const { data: insertedQuestions, error: questionsError } = await supabase
    .from("quiz_questions")
    .insert(
      questions.map((q, index) => ({
        quiz_id: quiz.id,
        user_id: userId,
        order_index: index,
        question_text: q.question_text,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
      }))
    )
    .select("id, order_index, question_text, options, correct_index, explanation");

  if (questionsError) throw questionsError;

  return { ...quiz, questions: insertedQuestions };
}

export async function listQuizzesForDocument(userId: string, documentId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, created_at")
    .eq("user_id", userId)
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getQuizForPlay(userId: string, quizId: string) {
  const supabase = createAdminClient();
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("id, document_id")
    .eq("id", quizId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!quiz) throw new NotFoundError("Quiz introuvable.");

  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("id, order_index, question_text, options")
    .eq("quiz_id", quizId)
    .order("order_index");

  if (qError) throw qError;

  return { ...quiz, questions: questions ?? [] };
}

export async function getQuizWithAnswers(userId: string, quizId: string) {
  const supabase = createAdminClient();
  const { data: questions, error } = await supabase
    .from("quiz_questions")
    .select("id, order_index, question_text, options, correct_index, explanation")
    .eq("quiz_id", quizId)
    .eq("user_id", userId)
    .order("order_index");

  if (error) throw error;
  if (!questions || questions.length === 0) {
    throw new NotFoundError("Quiz introuvable.");
  }
  return questions;
}

export async function createAttempt(
  userId: string,
  quizId: string,
  answers: Array<{
    question_id: string;
    selected_index: number | null;
    is_correct: boolean;
  }>,
  score: number
) {
  const supabase = createAdminClient();

  const { data: attempt, error } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      user_id: userId,
      score,
      total_questions: answers.length,
    })
    .select("id, created_at")
    .single();

  if (error) throw error;

  const { error: answersError } = await supabase.from("quiz_attempt_answers").insert(
    answers.map((a) => ({
      attempt_id: attempt.id,
      question_id: a.question_id,
      user_id: userId,
      selected_index: a.selected_index,
      is_correct: a.is_correct,
    }))
  );

  if (answersError) throw answersError;

  return attempt;
}

export async function listAttemptsForDocument(userId: string, documentId: string) {
  const supabase = createAdminClient();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id")
    .eq("user_id", userId)
    .eq("document_id", documentId);

  const quizIds = (quizzes ?? []).map((q) => q.id);
  if (quizIds.length === 0) return [];

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_id, score, total_questions, created_at")
    .eq("user_id", userId)
    .in("quiz_id", quizIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function listAllAttempts(userId: string) {
  const supabase = createAdminClient();

  const { data: attempts, error } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_id, score, total_questions, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!attempts || attempts.length === 0) return [];

  const quizIds = [...new Set(attempts.map((a) => a.quiz_id))];
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, document_id")
    .in("id", quizIds);

  const documentIds = [...new Set((quizzes ?? []).map((q) => q.document_id))];
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", documentIds);

  const quizToDocument = new Map((quizzes ?? []).map((q) => [q.id, q.document_id]));
  const documentTitles = new Map((documents ?? []).map((d) => [d.id, d.title]));

  return attempts.map((a) => {
    const documentId = quizToDocument.get(a.quiz_id) ?? null;
    return {
      ...a,
      document_id: documentId,
      document_title: documentId
        ? (documentTitles.get(documentId) ?? "Document supprimé")
        : "Document supprimé",
    };
  });
}
