import "server-only";
import PDFDocument from "pdfkit";

const PERIOD_LABEL: Record<"monthly" | "quarterly", string> = {
  monthly: "Abonnement Pro — 1 mois",
  quarterly: "Abonnement Pro — 1 trimestre",
};

// toLocaleString("fr-FR") sépare les milliers avec un espace fine
// insécable (U+202F), absent du WinAnsiEncoding des polices standard de
// pdfkit — le caractère ne s'affiche pas correctement dans le PDF. On
// formate donc les montants manuellement avec un espace normal.
function formatFcfa(amount: number): string {
  const raw = Math.round(amount).toString();
  const groups: string[] = [];
  let remaining = raw;
  while (remaining.length > 3) {
    groups.unshift(remaining.slice(-3));
    remaining = remaining.slice(0, -3);
  }
  groups.unshift(remaining);
  return `${groups.join(" ")} FCFA`;
}

// Facture PDF simple générée à la volée (jamais stockée en base, seules les
// métadonnées le sont — voir lib/invoices/repository.ts). Même approche que
// lib/documents/export.ts (pdfkit, pas de dépendance native — voir
// next.config.ts serverExternalPackages).
export function buildInvoicePdf(input: {
  invoiceId: string;
  reference: string;
  amount: number;
  period: "monthly" | "quarterly";
  customerEmail: string;
  issuedAt: Date;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text("Study Mind");
    doc.fontSize(10).font("Helvetica").fillColor("#666666").text("Reçu de paiement");
    doc.fillColor("#000000");
    doc.moveDown(1.5);

    doc.fontSize(14).font("Helvetica-Bold").text(`Facture n° ${input.invoiceId.slice(0, 8).toUpperCase()}`);
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Date : ${input.issuedAt.toLocaleDateString("fr-FR")}`);
    doc.text(`Client : ${input.customerEmail}`);
    doc.text(`Référence de paiement : ${input.reference}`);
    doc.moveDown(1.5);

    const tableTop = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Description", 50, tableTop);
    doc.text("Montant", 400, tableTop);
    doc.moveDown(0.5);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#dddddd")
      .stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica");
    const rowY = doc.y;
    doc.text(PERIOD_LABEL[input.period], 50, rowY);
    doc.text(formatFcfa(input.amount), 400, rowY);
    doc.moveDown(1);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#dddddd")
      .stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold");
    doc.text("Total payé", 50, doc.y);
    doc.text(formatFcfa(input.amount), 400, doc.y);
    doc.moveDown(2);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#666666")
      .text(
        "Paiement traité par GeniusPay (mobile money / carte). Ce document tient lieu de reçu de paiement."
      );

    doc.end();
  });
}
