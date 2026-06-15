export interface AuthResponse {
  access_token: string
  user_id: string
  role?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nome: string
  tipo?: string
  telefone?: string
}

export interface ProfileData {
  id?: string
  user_id: string
  nome: string
  foto?: string
  bio?: string
  objetivo?: string
  areas_atuacao: string[]
  tags: string[]
  cidade?: string
  uf?: string
  lat?: number
  lng?: number
  nota?: number
  projetos_concluidos?: number
  taxa_resposta?: string
  oab_status?: string
  oab_numero?: string
  oab_uf?: string
  facial_verified?: boolean
}

export interface DeckProfile {
  id: string
  nome: string
  foto: string
  bio: string
  especialidade: string
  cidade: string
  uf: string
  tags: string[]
  nota?: number
  avaliacoes?: number
  oab_verified?: boolean
  taxa_resposta?: string
  distancia?: string
  lat?: number
  lng?: number
  objetivo?: string
}

export interface SwipeResponse {
  match: boolean
  match_id?: string
}

export interface LikeUser {
  user_id: string
  nome: string
  areas_atuacao: string[]
  nota: number
}

export interface MatchUser {
  match_id: string
  user_id: string
  nome: string
  created_at: string
}

export interface Conversation {
  conversation_id: string
  match_id: string
  other_user_id: string
  last_message: string
  last_time: string
}

export interface MessageData {
  id: string
  sender_id: string
  type: string
  content?: string
  file_url?: string
  created_at: string
}

export interface ProjectData {
  id: string
  owner_id?: string
  titulo: string
  descricao: string
  area?: string
  status: string
  prazo?: string
  progresso: number
  steps?: ProjectStep[]
}

export interface ProjectStep {
  id: string
  project_id: string
  ordem: number
  titulo: string
  descricao?: string
  done: boolean
}

export interface ReviewData {
  id: string
  project_id: string
  from_user: string
  to_user: string
  nota: number
  comentario?: string
  created_at: string
}

export interface VerificationStatus {
  status: string
  oab_numero?: string
  oab_uf?: string
  facial_verified: boolean
}

export interface VerificationSubmitResponse {
  status: string
  verification_id: string
}

export interface AdminVerification {
  id: string
  user_id: string
  nome: string
  oab_numero: string
  oab_uf: string
  status: string
  doc_url?: string
  selfie_url?: string
}

export interface MatchFilters {
  especialidades: string[]
  ufs: string[]
  objetivos: string[]
}
