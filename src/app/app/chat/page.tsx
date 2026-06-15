"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

interface ChatItem {
  conversation_id: string; match_id: string; other_user_id: string
  last_message: string; last_time: string; nome?: string
}

export default function ChatListPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState<ChatItem[]>([])

  useEffect(() => {
    if (!user) return
    api.chat.conversations(user.id).then(async (data) => {
      const enriched = await Promise.all(
        data.map(async (c: any) => {
          try { const p = await api.users.get(c.other_user_id); return { ...c, nome: p.nome } }
          catch { return { ...c, nome: "Usuário" } }
        })
      )
      setChats(enriched)
    }).catch(() => {})
  }, [user])

  const fmt = (iso: string) => iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""

  return (
    <>
      <Header title="Chat" />

      <div style={{ padding: "8px 16px" }}>
        {chats.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40 }}>
            Nenhuma conversa ainda
          </p>
        )}
        {chats.map(chat => (
          <Link key={chat.conversation_id} href={`/app/chat/${chat.conversation_id}`}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>
            <div className="avatar">{chat.nome?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>{chat.nome}</span>
                <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{fmt(chat.last_time)}</span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {chat.last_message || "Clique para conversar"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <BottomNav />
    </>
  )
}
