"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

interface MessageItem {
  id: string; sender_id: string; type: string
  content?: string; file_url?: string; created_at: string
}

export default function ChatDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [msgs, setMsgs] = useState<MessageItem[]>([])
  const [input, setInput] = useState("")
  const [otherName, setOtherName] = useState("Chat")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const convId = id as string

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }, [])

  // Carrega mensagens iniciais
  useEffect(() => {
    if (!user || !convId) return
    api.chat.messages(convId).then((data: MessageItem[]) => {
      setMsgs(data)
      const otherId = data.find(m => m.sender_id !== user.id)?.sender_id
      if (otherId) api.users.get(otherId).then((p: any) => setOtherName(p.nome)).catch(() => {})
      scrollBottom()
    }).catch(() => {})
  }, [user, convId, scrollBottom])

  // Realtime — escuta novas mensagens via Supabase
  useEffect(() => {
    if (!convId) return

    const channel = supabase
      .channel(`chat:${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          const nova = payload.new as MessageItem
          setMsgs(prev => {
            // evita duplicata se a mensagem já foi adicionada otimisticamente
            if (prev.find(m => m.id === nova.id)) return prev
            return [...prev, nova]
          })
          scrollBottom()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [convId, scrollBottom])

  useEffect(() => { scrollBottom() }, [msgs, scrollBottom])

  const send = async () => {
    if (!input.trim() || !user || sending) return
    const content = input.trim()
    setInput("")
    setSending(true)

    // Otimista: mostra a mensagem imediatamente
    const temp: MessageItem = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      type: "text",
      content,
      created_at: new Date().toISOString(),
    }
    setMsgs(prev => [...prev, temp])
    scrollBottom()

    try {
      await api.chat.sendMessage({ conversation_id: convId, content })
    } catch {
      // Remove mensagem otimista em caso de erro
      setMsgs(prev => prev.filter(m => m.id !== temp.id))
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  const isMe = (senderId: string) => senderId === user?.id

  return (
    <>
      <Header title={otherName} backHref="/app/chat" />

      <div style={{
        padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, paddingBottom: 100,
        background: "linear-gradient(180deg, #0a0f1e 0%, #111827 100%)",
      }}>
        {msgs.map(msg => {
          const mine = isMe(msg.sender_id)
          return (
            <div key={msg.id} style={{
              display: "flex",
              justifyContent: mine ? "flex-end" : "flex-start",
              marginBottom: 2,
            }}>
              <div style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: mine ? "linear-gradient(135deg, var(--orange), var(--orange-hover))" : "#1e293b",
                color: mine ? "#fff" : "#f1f5f9",
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                opacity: msg.id.startsWith("temp-") ? 0.7 : 1,
              }}>
                {msg.type === "file" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>📎</span>
                    <span>{msg.file_url || msg.content}</span>
                  </div>
                ) : (
                  <p style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</p>
                )}
                <div style={{
                  fontSize: 10,
                  color: mine ? "rgba(255,255,255,0.6)" : "#64748b",
                  textAlign: "right",
                  marginTop: 4,
                }}>
                  {msg.id.startsWith("temp-") ? "enviando..." : fmt(msg.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{
        position: "fixed", bottom: 64, left: 0, right: 0,
        padding: "8px 16px", background: "#0f172a", borderTop: "1px solid #1e293b",
      }}>
        <div style={{
          display: "flex", gap: 8, alignItems: "center",
          background: "#1e293b", borderRadius: 24, padding: "4px 4px 4px 16px",
        }}>
          <input
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            disabled={sending}
            style={{
              flex: 1, border: "none", background: "transparent", color: "#f1f5f9",
              fontSize: 14, outline: "none", padding: "8px 0",
            }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            style={{
              width: 40, height: 40, borderRadius: "50%", border: "none",
              background: sending || !input.trim()
                ? "#334155"
                : "linear-gradient(135deg, var(--orange), var(--orange-hover))",
              color: "#fff", fontSize: 18, cursor: sending ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            ➤
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
