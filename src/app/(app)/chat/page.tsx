"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui";

type ChatItem = {
  matchId: string;
  conversationId: string | null;
  name: string;
  image: string | null;
  initials: string;
  grad: [string, string];
  lastMessage: string | null;
  lastMessageAt: string | null;
};

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/match/matches", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setChats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 mt-1">
        <h1 className="text-[22px] font-bold leading-tight">Conversas</h1>
        <p className="text-sm text-muted">Negocie e feche dentro da plataforma</p>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {loading && (
          <p className="self-center mt-8 text-xs text-dim">Carregando conversas...</p>
        )}
        {!loading && chats.length === 0 && (
          <div className="glass mt-6 flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
            <span className="text-4xl">💬</span>
            <h3 className="font-bold">Nenhuma conversa ainda</h3>
            <p className="max-w-[240px] text-sm text-muted">
              Quando você fizer um match, a conversa aparecerá aqui.
            </p>
            <Link href="/match" className="mt-2 rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted">
              Ir para Match
            </Link>
          </div>
        )}
        {chats.map((c) => (
          <Link
            key={c.matchId}
            href={c.conversationId ? `/chat/${c.conversationId}` : "#"}
            className="glass-soft flex items-center gap-3 rounded-2xl p-3 text-left"
          >
            <Avatar initials={c.initials} grad={c.grad} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold">{c.name}</span>
                <span className="shrink-0 text-[11px] text-dim">{timeAgo(c.lastMessageAt)}</span>
              </div>
              <span className="mt-0.5 block truncate text-xs text-muted">
                {c.lastMessage ?? "Nenhuma mensagem ainda"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
