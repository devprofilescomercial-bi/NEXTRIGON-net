"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

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
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !id) return
    api.chat.messages(id as string).then(data => {
      setMsgs(data)
      const otherId = data.find((m: MessageItem) => m.sender_id !== user.id)?.sender_id
      if (otherId) api.users.get(otherId).then(p => setOtherName(p.nome)).catch(() => {})
    }).catch(() => {})
  }, [user, id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  const send = async () => {
    if (!input.trim() || !user) return
    try {
      await api.chat.sendMessage({ conversation_id: id as string, content: input })
      setInput("")
      const data = await api.chat.messages(id as string)
      setMsgs(data)
    } catch {}
  }

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  return (
    <>
      <Header title={otherName} backHref="/app/chat" />

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 100 }}>
        {msgs.map(msg => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_id === user?.id ? "flex-end" : "flex-start" }}>
            <div className={`chat-bubble ${msg.sender_id === user?.id ? "me" : "them"}`}>
              {msg.type === "file" ? (
                <div className="filebox" style={{ background: "transparent", padding: 0 }}>
                  <span>📎</span>
                  <span>{msg.file_url || msg.content}</span>
                </div>
              ) : (
                <p style={{ margin: 0 }}>{msg.content}</p>
              )}
              <div className="time">{fmt(msg.created_at)}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{
        position: "fixed", bottom: 64, left: 0, right: 0,
        padding: "8px 16px", background: "var(--bg)", borderTop: "1px solid var(--border)",
      }}>
        <div className="messagebar">
          <input placeholder="Digite sua mensagem..." value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()} />
          <button onClick={send}>➤</button>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
