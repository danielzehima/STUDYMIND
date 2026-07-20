import type { ContactMessage } from "@/lib/contact/repository";

export function ContactMessagesList({ messages }: { messages: ContactMessage[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-slate-500">Aucun message pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => (
        <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">{m.name}</p>
              <a
                href={`mailto:${m.email}`}
                className="text-xs text-indigo-600 hover:underline"
              >
                {m.email}
              </a>
            </div>
            <p className="shrink-0 text-xs text-slate-400">
              {new Date(m.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
            {m.message}
          </p>
        </div>
      ))}
    </div>
  );
}
