import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse, NotFoundError } from "@/lib/errors";
import { getInvoice } from "@/lib/invoices/repository";
import { buildInvoicePdf } from "@/lib/invoices/export";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const invoice = await getInvoice(user.id, id);
    if (!invoice) throw new NotFoundError("Facture introuvable.");

    const pdf = await buildInvoicePdf({
      invoiceId: invoice.id,
      reference: invoice.reference,
      amount: invoice.amount,
      period: invoice.period,
      customerEmail: user.email ?? "",
      issuedAt: new Date(invoice.created_at),
    });

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-${invoice.reference}.pdf"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
