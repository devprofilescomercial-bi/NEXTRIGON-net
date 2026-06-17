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

// Planos e assinaturas
export interface PlanFeature {
  id: string
  nome: string
  preco: number
  matches_mensais: number
  boosts_mensais: number
  pode_ver_quem_curtiu: boolean
  chat_ilimitado: boolean
  primeira_impressao: boolean
  perfil_verificado: boolean
  ranking_premium: boolean
  relatorios: string
  destaque_nacional: boolean
  selo_autoridade: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  boosts_remaining: number
  matches_used_this_month: number
  cancel_at_period_end: boolean
}

export interface DashboardCounters {
  oportunidades_semana: number
  interesses_recebidos: number
  visualizacoes_perfil: number
  matches_restantes: number
  plan_id: string
  plan_nome: string
}

export interface BoostOption {
  quantidade: number
  preco: number
  label: string
}

export interface BoostStatus {
  active: boolean
  expires_at: string | null
  boosts_remaining: number
}

export interface UserNotification {
  id: string
  type: string
  title: string
  message: string
  cta_text: string | null
  cta_link: string | null
  read: boolean
  created_at: string
}

export interface FinancialStat {
  mes: number
  ano: number
  conexoes: number
  parcerias_fechadas: number
  honorarios_receita: number
  oportunidades_recebidas: number
  valor_negociacao: number
}

export interface SwipeWithMessage {
  to_user_id: string
  direction: string
  message?: string
}
