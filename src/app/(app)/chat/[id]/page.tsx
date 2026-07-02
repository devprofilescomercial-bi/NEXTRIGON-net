"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar, IconCheck, IconClose } from "@/components/ui";

function Back() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function Paperclip() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
      <path d="M21 11l-8.5 8.5a4 4 0 01-6-6L14 5a2.6 2.6 0 014 4l-8.5 8.5a1.3 1.3 0 01-2-2L14 8" />
    </svg>
  );
}
function Send() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 11l18-8-8 18-2.5-7.5L3 11z" /></svg>
  );
}

type MsgType = { id: string; senderId: string; type: string; content: string | null; fileUrl: string | null; createdAt: string };
type ProposalStatus = "aguardando" | "aceito" | "recusado";
type ContactInfo = { name: string; initials: string; grad: [string, string] };

export default function ConversaPage() {
  const params = useParams();
  const convId = params.id as string;

  const [contact, setContact] = useState<ContactInfo>({ name: "...", initials: "?", grad: ["#3256a8", "#1e3a8a"] });
  const [myId, setMyId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<MsgType[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus>("aguardando");
  const [confirmando, setConfirmando] = useState<"aceitar" | "recusar" | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${convId}/messages`, { credentials: "include" });
      if (!res.ok) return;
      const data: MsgType[] = await res.json();
      setMessages(data);
    } catch {}
  }, [convId]);

  useEffect(() => {
    // Get current user ID from session
    fetch("/api/auth/get-session", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user?.id) setMyId(data.user.id); })
      .catch(() => {});

    // Get contact info from matches
    fetch("/api/match/matches", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then((matches: Array<{ conversationId: string | null; name: string; initials: string; grad: [string, string] }>) => {
        const found = matches.find(m => m.conversationId === convId);
        if (found) setContact({ name: found.name, initials: found.initials, grad: found.grad });
      })
      .catch(() => {});

    fetchMessages();
  }, [convId, fetchMessages]);

  useEffect(() => {
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  async function sendMessage(content?: string, fileUrl?: string, type = "text") {
    const body: Record<string, string> = { type };
    if (content) body.content = content;
    if (fileUrl) body.fileUrl = fileUrl;

    const optimistic: MsgType = {
      id: `opt-${Date.now()}`,
      senderId: myId ?? "__me__",
      type,
      content: content ?? null,
      fileUrl: fileUrl ?? null,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await fetch(`/api/chat/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      await fetchMessages();
    } catch {}
  }

  async function handleSend() {
    const text = msg.trim();
    if (!text || sending) return;
    setSending(true);
    setMsg("");
    await sendMessage(text);
    setSending(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
        const type = file.type.startsWith("image/") ? "avatar" : "doc";
        const res = await fetch(`/api/upload?type=${type}&ext=${ext}&filename=${encodeURIComponent(file.name)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ base64, filename: file.name, mimeType: file.type }),
        });
        if (res.ok) {
          const { url } = await res.json();
          await sendMessage(file.name, url, "file");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch { setUploading(false); }
    e.target.value = "";
  }

  function handleAceitar() {
    if (confirmando !== "aceitar") { setConfirmando("aceitar"); return; }
    setProposalStatus("aceito"); setConfirmando(null);
  }
  function handleRecusar() {
    if (confirmando !== "recusar") { setConfirmando("recusar"); return; }
    setProposalStatus("recusado"); setConfirmando(null);
  }

  const statusColors: Record<ProposalStatus, string> = {
    aguardando: "bg-brand/15 text-brand",
    aceito: "bg-success/20 text-success",
    recusado: "bg-danger/15 text-danger",
  };
  const statusLabels: Record<ProposalStatus, string> = { aguardando: "aguardando", aceito: "aceito", recusado: "recusado" };

  function isMe(senderId: string) {
    if (myId) return senderId === myId;
    return senderId === "__me__";
  }

  function renderMessage(m: MsgType) {
    const mine = isMe(m.senderId);
    if (m.type === "file" && m.fileUrl) {
      const name = m.content ?? "Arquivo";
      const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";
      return (
        <a
          key={m.id}
          href={m.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex max-w-[78%] items-center gap-3 rounded-2xl glass px-3.5 py-3 ${mine ? "self-end" : "self-start"}`}
        >
          <span className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white">{ext}</span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{name}</div>
            <div className="text-[11px] text-dim">Toque para abrir</div>
          </div>
        </a>
      );
    }
    return (
      <div
        key={m.id}
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${mine ? "self-end rounded-tr-md brand-gradient text-white" : "self-start rounded-tl-md glass-soft"}`}
      >
        {m.content}
      </div>
    );
  }

  return (
    <section className="-mx-5 flex min-h-0 flex-1 flex-col">
      {/* contact strip */}
      <div className="flex items-center gap-3 border-b border-line px-5 pb-3">
        <Link href="/chat" className="text-muted"><Back /></Link>
        <Avatar initials={contact.initials} grad={contact.grad} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold leading-tight">{contact.name}</div>
          <div className="text-[11px] text-success">online agora</div>
        </div>
      </div>

      {/* messages */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="self-center text-xs text-dim mt-8">Nenhuma mensagem ainda. Diga olá!</p>
        )}
        {messages.map(m => renderMessage(m))}

        {/* proposal card — demo */}
        {messages.length === 0 && (
          <div className="self-start w-full max-w-[88%] rounded-2xl glass p-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-brand">PROPOSTA DE PARCERIA</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[proposalStatus]}`}>
                {statusLabels[proposalStatus]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[11px] text-dim">Honorário</div><div className="font-semibold">R$ 4.500</div></div>
              <div><div className="text-[11px] text-dim">Prazo</div><div className="font-semibold">30 dias</div></div>
            </div>
            <div className="mt-2 text-xs text-muted">Escopo: elaboração de contrato social + acordo de sócios.</div>
            {proposalStatus === "aguardando" && (
              <div className="mt-4 flex gap-2.5">
                <button onClick={handleRecusar} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition ${confirmando === "recusar" ? "border-danger bg-danger text-white" : "border-line text-danger"}`}>
                  <IconClose className="h-4 w-4" />
                  {confirmando === "recusar" ? "Confirmar recusa" : "Recusar"}
                </button>
                <button onClick={handleAceitar} className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition ${confirmando === "aceitar" ? "bg-success/80 text-white scale-95" : "bg-success text-white"}`}>
                  <IconCheck className="h-4 w-4" />
                  {confirmando === "aceitar" ? "Confirmar aceite" : "Aceitar"}
                </button>
              </div>
            )}
            {confirmando && <button onClick={() => setConfirmando(null)} className="mt-2 w-full text-center text-[11px] text-dim">Cancelar</button>}
            {proposalStatus === "aceito" && <div className="mt-3 flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-sm font-semibold text-success"><IconCheck className="h-4 w-4" /> Proposta aceita! Agora é só começar.</div>}
            {proposalStatus === "recusado" && <div className="mt-3 rounded-xl bg-danger/10 px-3 py-2.5 text-sm font-semibold text-danger">Proposta recusada.</div>}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input bar */}
      <div className="flex items-center gap-2 border-t border-line px-5 pt-3 pb-2">
        <input ref={fileRef} type="file" accept="image/*,application/pdf,.doc,.docx" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} className={`text-dim transition ${uploading ? "opacity-40" : ""}`} disabled={uploading}>
          <Paperclip />
        </button>
        <input
          placeholder="Digite uma mensagem..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          className="glass-soft flex-1 rounded-full px-4 py-2.5 text-sm text-ink outline-none placeholder:text-dim"
        />
        <button
          onClick={handleSend}
          disabled={!msg.trim() || sending}
          className="brand-gradient glow-brand flex h-10 w-10 items-center justify-center rounded-full text-white disabled:opacity-50"
        >
          <Send />
        </button>
      </div>
    </section>
  );
}
