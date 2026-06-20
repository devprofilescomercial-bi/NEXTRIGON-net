import Link from "next/link";
import { Avatar } from "@/components/ui";

const CHATS = [
  { id: "1", name: "Dra. Marina Alves", last: "Claro. Segue a proposta para análise.", time: "09:42", unread: 2, initials: "MA", grad: ["#fb923c", "#ea580c"] as [string, string] },
  { id: "2", name: "Dr. Rafael Costa", last: "Podemos fechar a parceria tributária?", time: "08:15", unread: 0, initials: "RC", grad: ["#60a5fa", "#2563eb"] as [string, string] },
  { id: "3", name: "Dra. Helena Dias", last: "Documento enviado, qualquer coisa avise.", time: "Ontem", unread: 0, initials: "HD", grad: ["#34d399", "#059669"] as [string, string] },
  { id: "4", name: "Dr. Bruno Tavares", last: "Excelente! Vou avaliar e te retorno.", time: "Ter", unread: 0, initials: "BT", grad: ["#c084fc", "#7c3aed"] as [string, string] },
];

export default function ChatPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 mt-1">
        <h1 className="text-[22px] font-bold leading-tight">Conversas</h1>
        <p className="text-sm text-muted">Negocie e feche dentro da plataforma</p>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {CHATS.map((c) => (
          <Link key={c.id} href={`/chat/${c.id}`} className="glass-soft flex items-center gap-3 rounded-2xl p-3 text-left">
            <Avatar initials={c.initials} grad={c.grad} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold">{c.name}</span>
                <span className="shrink-0 text-[11px] text-dim">{c.time}</span>
              </div>
              <span className="mt-0.5 block truncate text-xs text-muted">{c.last}</span>
            </div>
            {c.unread > 0 && (
              <span className="brand-gradient ml-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white">
                {c.unread}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
