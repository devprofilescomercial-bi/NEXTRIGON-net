import type {
  AuthResponse, RegisterRequest, LoginRequest,
  ProfileData, DeckProfile, SwipeResponse, LikeUser, MatchUser,
  Conversation, MessageData, ProjectData, ProjectStep, ReviewData,
  VerificationStatus, VerificationSubmitResponse, AdminVerification, MatchFilters,
} from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Erro ${res.status}`)
  }
  return res.json()
}

export const api = {
  auth: {
    register: (data: RegisterRequest) =>
      request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: LoginRequest) =>
      request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  },
  users: {
    me: () => request<ProfileData>("/api/users/me"),
    updateProfile: (data: Partial<ProfileData>) =>
      request<{ status: string }>("/api/users/me/profile", { method: "PUT", body: JSON.stringify(data) }),
    get: (id: string) => request<ProfileData>(`/api/users/${id}`),
  },
  match: {
    deck: () => request<DeckProfile[]>("/api/match/deck"),
    deckParams: (params: string) => request<DeckProfile[]>(`/api/match/deck?${params}`),
    swipe: (to_user_id: string, direction: string) =>
      request<SwipeResponse>("/api/match/swipe", { method: "POST", body: JSON.stringify({ to_user_id, direction }) }),
    matches: () => request<MatchUser[]>("/api/match/matches"),
    likes: () => request<LikeUser[]>("/api/match/likes"),
    filters: () => request<MatchFilters>("/api/match/filters"),
  },
  verification: {
    status: () => request<VerificationStatus>("/api/verification/status"),
    submit: (data: { oab_numero: string; oab_uf: string; doc_url?: string; selfie_url?: string }) =>
      request<VerificationSubmitResponse>("/api/verification/submit", { method: "POST", body: JSON.stringify(data) }),
    facial: (data: { selfie_url: string }) =>
      request<{ status: string; facial_verified: boolean }>("/api/verification/facial", { method: "POST", body: JSON.stringify(data) }),
  },
  chat: {
    conversations: (userId: string) => request<Conversation[]>(`/api/chat/conversations?user_id=${userId}`),
    messages: (convId: string) => request<MessageData[]>(`/api/chat/conversations/${convId}/messages`),
    sendMessage: (data: { conversation_id: string; content: string; type?: string }) =>
      request<{ status: string; message_id: string }>("/api/chat/messages", { method: "POST", body: JSON.stringify(data) }),
    getProposal: (messageId: string) => request<{ id: string; message_id: string; valor: number; escopo: string; prazo: string; status: string }>(`/api/chat/proposals/${messageId}`),
    actionProposal: (proposalId: string, action: string) =>
      request<{ status: string }>(`/api/chat/proposals/${proposalId}/action`, { method: "POST", body: JSON.stringify({ action }) }),
  },
  projects: {
    list: () => request<ProjectData[]>("/api/projects"),
    create: (data: { titulo: string; descricao?: string; area?: string; prazo?: string }) =>
      request<{ id: string; status: string }>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string) => request<ProjectData>(`/api/projects/${id}`),
    addStep: (projectId: string, data: { titulo: string; descricao?: string; ordem: number }) =>
      request<{ status: string; step_id: string }>(`/api/projects/${projectId}/steps`, { method: "POST", body: JSON.stringify(data) }),
    toggleStep: (projectId: string, stepId: string) =>
      request<{ status: string; done: boolean }>(`/api/projects/${projectId}/steps/${stepId}/toggle`, { method: "POST" }),
    createReview: (data: { project_id: string; to_user_id: string; nota: number; comentario?: string }) =>
      request<{ status: string }>("/api/projects/reviews", { method: "POST", body: JSON.stringify(data) }),
  },
  admin: {
    verifications: () => request<AdminVerification[]>("/api/admin/verifications"),
    approveVerification: (id: string) => request<{ status: string }>(`/api/admin/verifications/${id}/approve`, { method: "POST" }),
    rejectVerification: (id: string) => request<{ status: string }>(`/api/admin/verifications/${id}/reject`, { method: "POST" }),
  },
}
