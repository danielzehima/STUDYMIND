import "server-only";
import PDFDocument from "pdfkit";

type QuizQuestionForExport = {
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

type ExerciseItemForExport = {
  exercise_text: string;
  solution_text: string;
  final_answer: string | null;
};

const OPTION_LETTERS = ["A", "B", "C", "D"];

// Génère la "fiche de révision" PDF d'un document : résumé, points clés,
// quiz (avec bonnes réponses/explications) et, si fournis, les exercices
// résolus (Pro). pdfkit n'a pas de dépendance native (contrairement à
// pdfjs-dist, voir next.config.ts) — pas de souci de file tracing Vercel.
export function buildStudySheetPdf(input: {
  title: string;
  summary: string | null;
  keyPoints: string[] | null;
  quizQuestions: QuizQuestionForExport[];
  exerciseItems: ExerciseItemForExport[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text(input.title);
    doc.moveDown();
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Fiche de révision générée par Study Mind");
    doc.fillColor("#000000");
    doc.moveDown(1.5);

    if (input.summary) {
      doc.fontSize(14).font("Helvetica-Bold").text("Résumé");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica").text(input.summary, { align: "justify" });
      doc.moveDown();
    }

    if (input.keyPoints && input.keyPoints.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Points clés");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica");
      for (const point of input.keyPoints) {
        doc.text(`-  ${point}`);
      }
      doc.moveDown();
    }

    if (input.quizQuestions.length > 0) {
      doc.addPage();
      doc.fontSize(14).font("Helvetica-Bold").text("Quiz");
      doc.moveDown(0.5);

      input.quizQuestions.forEach((q, index) => {
        doc.fontSize(11).font("Helvetica-Bold").text(`${index + 1}. ${q.question_text}`);
        doc.moveDown(0.2);
        doc.font("Helvetica").fontSize(10);
        q.options.forEach((option, i) => {
          const letter = OPTION_LETTERS[i] ?? `${i + 1}`;
          const suffix = i === q.correct_index ? "  (bonne réponse)" : "";
          doc.text(`   ${letter}. ${option}${suffix}`);
        });
        if (q.explanation) {
          doc.moveDown(0.2);
          doc
            .font("Helvetica-Oblique")
            .fontSize(9)
            .text(`   Explication : ${q.explanation}`);
        }
        doc.moveDown();
      });
    }

    if (input.exerciseItems.length > 0) {
      doc.addPage();
      doc.fontSize(14).font("Helvetica-Bold").text("Exercices résolus");
      doc.moveDown(0.5);

      input.exerciseItems.forEach((item, index) => {
        doc.fontSize(11).font("Helvetica-Bold").text(`Exercice ${index + 1}`);
        doc.moveDown(0.2);
        doc.font("Helvetica").fontSize(10).text(item.exercise_text);
        doc.moveDown(0.3);
        doc.font("Helvetica-Bold").fontSize(10).text("Résolution :");
        doc.font("Helvetica").fontSize(10).text(item.solution_text);
        if (item.final_answer) {
          doc.moveDown(0.2);
          doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(`Réponse finale : ${item.final_answer}`);
        }
        doc.moveDown();
      });
    }

    doc.end();
  });
}
