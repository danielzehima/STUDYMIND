"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer ce document ? Cette action est irréversible.")) {
      return;
    }

    setIsDeleting(true);
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.push("/documents");
      router.refresh();
    } else {
      setIsDeleting(false);
      alert("La suppression a échoué.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {isDeleting ? <Spinner size={16} /> : <Trash2 size={16} />}
      Supprimer
    </button>
  );
}
