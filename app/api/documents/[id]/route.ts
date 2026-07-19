import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/errors";
import { deleteDocument, getDocument } from "@/lib/documents/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const document = await getDocument(user.id, id);
    return Response.json(document);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    await deleteDocument(user.id, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
