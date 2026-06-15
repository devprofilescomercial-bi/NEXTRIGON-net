import { NextRequest, NextResponse } from "next/server"

interface User { id: string; email: string; password_hash: string; nome: string; role: string }
interface Profile {
  user_id: string; nome: string; foto?: string; bio?: string; objetivo?: string
  areas_atuacao: string[]; tags: string[]; cidade?: string; uf?: string
  lat?: number; lng?: number
  oab_verified: boolean; oab_numero?: string; oab_uf?: string
  facial_verified: boolean; selfie_url?: string
  nota: number; avaliacoes: number; taxa_resposta: string
}
interface SwipeR { from: string; to: string; direction: string }
interface MatchR { id: string; users: string[] }
interface MessageR { id: string; conversation_id: string; sender_id: string; content: string; type: string; file_url?: string; created_at: string }
interface ProposalR { id: string; message_id: string; from_user: string; to_user: string; valor: number; escopo: string; prazo: string; status: string }
interface ProjectR { id: string; owner_id: string; titulo: string; descricao: string; area?: string; status: string; prazo: string; progresso: number }
interface ProjectStepR { id: string; project_id: string; ordem: number; titulo: string; descricao?: string; done: boolean }
interface ReviewR { id: string; project_id: string; from_user: string; to_user: string; nota: number; comentario?: string; created_at: string }
interface VerificationR { id: string; user_id: string; oab_numero: string; oab_uf: string; doc_url?: string; selfie_url?: string; status: string; reviewed_by?: string | null; reviewed_at?: string | null }

const users: User[] = []
const profiles: Profile[] = []
const swipes: SwipeR[] = []
const matches: MatchR[] = []
const messages: MessageR[] = []
const proposals: ProposalR[] = []
const projects: ProjectR[] = []
const projectSteps: ProjectStepR[] = []
const reviews: ReviewR[] = []
const verifications: VerificationR[] = []

let matchCounter = 0
function uid() { return Math.random().toString(36).slice(2, 10) }

function simpleHash(s: string): string {
  let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
  return h.toString(36)
}

function mockToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 28800000 }))
  const signature = simpleHash(header + "." + body)
  return header + "." + body + "." + signature
}

function decodeMockToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const body = JSON.parse(atob(parts[1]))
    if (body.exp && body.exp < Date.now()) return null
    return body
  } catch { return null }
}

const ALL_UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const ALLOWED_PROFILE_FIELDS = new Set([
  "nome", "bio", "objetivo", "areas_atuacao", "tags", "cidade", "uf", "lat", "lng", "foto",
])

function sanitizeProfile(body: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  for (const key of Object.keys(body)) {
    if (ALLOWED_PROFILE_FIELDS.has(key)) clean[key] = body[key]
  }
  return clean
}

;(() => {
  const data: Array<{
    nome: string; email: string; bio: string; areas: string[]; tags: string[]
    cidade: string; uf: string; lat: number; lng: number
    nota: number; av: number; ver: boolean; oabn?: string; resp: string
  }> = [
    { nome:"Dr. Carlos Mendes", email:"carlos@adv.com", bio:"Especialista em Direito Penal com 15 anos.", areas:["Direito Penal"], tags:["Tribunal do Júri","Recursos"], cidade:"São Paulo", uf:"SP", lat:-23.55, lng:-46.63, nota:4.9, av:27, ver:true, oabn:"123456/SP", resp:"< 2h" },
    { nome:"Dra. Ana Oliveira", email:"ana@adv.com", bio:"Trabalhista há 12 anos. Defesa de empresas.", areas:["Direito Trabalhista"], tags:["Reclamação Trabalhista","Acordos"], cidade:"Rio de Janeiro", uf:"RJ", lat:-22.90, lng:-43.17, nota:4.8, av:34, ver:true, oabn:"234567/RJ", resp:"< 1h" },
    { nome:"Dr. Roberto Lima", email:"roberto@adv.com", bio:"Tributarista. Consultoria para médio porte.", areas:["Direito Tributário"], tags:["Planejamento Fiscal","Contencioso"], cidade:"Belo Horizonte", uf:"MG", lat:-19.91, lng:-43.93, nota:4.7, av:19, ver:false, resp:"< 3h" },
    { nome:"Dra. Juliana Costa", email:"juliana@adv.com", bio:"Cível e contratual. Sócia do Costa & Advogados.", areas:["Direito Cível"], tags:["Contratos","Responsabilidade Civil"], cidade:"Brasília", uf:"DF", lat:-15.79, lng:-47.88, nota:4.9, av:42, ver:true, oabn:"345678/DF", resp:"< 1h" },
    { nome:"Dr. Marcelo Souza", email:"marcelo@adv.com", bio:"Empresarial e societário. Startups e PMEs.", areas:["Direito Empresarial"], tags:["Contratos Empresariais","Societário"], cidade:"Curitiba", uf:"PR", lat:-25.42, lng:-49.27, nota:4.5, av:15, ver:true, oabn:"456789/PR", resp:"< 4h" },
    { nome:"Dra. Fernanda Rocha", email:"fernanda@adv.com", bio:"Consumidor e direito digital.", areas:["Direito do Consumidor"], tags:["CDC","Direito Digital"], cidade:"Salvador", uf:"BA", lat:-12.97, lng:-38.50, nota:4.6, av:23, ver:false, resp:"< 2h" },
    { nome:"Dr. Gustavo Santos", email:"gustavo@adv.com", bio:"Imobiliário e registral.", areas:["Direito Imobiliário"], tags:["Regularização","Locação"], cidade:"Porto Alegre", uf:"RS", lat:-30.03, lng:-51.23, nota:4.4, av:11, ver:true, oabn:"567890/RS", resp:"< 3h" },
    { nome:"Dra. Patrícia Almeida", email:"patricia@adv.com", bio:"Família e sucessões. Mediação.", areas:["Direito de Família"], tags:["Divórcio","Guarda"], cidade:"Fortaleza", uf:"CE", lat:-3.73, lng:-38.52, nota:4.3, av:8, ver:false, resp:"< 5h" },
    { nome:"Dr. Ricardo Barbosa", email:"ricardo@adv.com", bio:"Previdenciário. Aposentadorias e benefícios.", areas:["Direito Previdenciário"], tags:["Aposentadoria","INSS","Benefícios"], cidade:"Recife", uf:"PE", lat:-8.05, lng:-34.88, nota:4.7, av:31, ver:true, oabn:"678901/PE", resp:"< 2h" },
    { nome:"Dra. Camila Torres", email:"camila@adv.com", bio:"Ambiental e licenciamento.", areas:["Direito Ambiental"], tags:["Licenciamento","Sustentabilidade"], cidade:"Manaus", uf:"AM", lat:-3.11, lng:-60.02, nota:4.5, av:17, ver:false, resp:"< 3h" },
    { nome:"Dr. Paulo Henrique", email:"paulo@adv.com", bio:"Direito marítimo e portuário.", areas:["Direito Marítimo"], tags:["Portos","Navegação","Comércio Marítimo"], cidade:"Santos", uf:"SP", lat:-23.96, lng:-46.33, nota:4.6, av:14, ver:true, oabn:"789012/SP", resp:"< 4h" },
    { nome:"Dra. Luciana Martins", email:"luciana@adv.com", bio:"Direito médico e responsabilidade civil na saúde.", areas:["Direito da Saúde"], tags:["Responsabilidade Civil","Planos de Saúde","Erro Médico"], cidade:"Ribeirão Preto", uf:"SP", lat:-21.17, lng:-47.81, nota:4.8, av:25, ver:false, resp:"< 2h" },
  ]
  for (const a of data) {
    const id = uid()
    users.push({ id, email: a.email, password_hash: simpleHash("123456"), nome: a.nome, role: "user" })
    profiles.push({ user_id: id, nome: a.nome, bio: a.bio, areas_atuacao: a.areas, tags: a.tags, cidade: a.cidade, uf: a.uf, lat: a.lat, lng: a.lng, oab_verified: a.ver, oab_numero: a.oabn, oab_uf: a.uf, facial_verified: a.ver, nota: a.nota, avaliacoes: a.av, taxa_resposta: a.resp })
    if (a.oabn) verifications.push({ id: uid(), user_id: id, oab_numero: a.oabn, oab_uf: a.uf, status: a.ver ? "approved" : "pending" })
  }
  const clienteId = uid()
  users.push({ id: clienteId, email: "cliente@teste.com", password_hash: simpleHash("123456"), nome: "João Cliente", role: "user" })
  profiles.push({ user_id: clienteId, nome: "João Cliente", bio: "Preciso de advogado para meu caso.", areas_atuacao: [], tags: [], cidade: "São Paulo", uf: "SP", lat: -23.55, lng: -46.63, oab_verified: false, facial_verified: true, nota: 0, avaliacoes: 0, taxa_resposta: "" })

  const adminId = uid()
  users.push({ id: adminId, email: "admin@nextrigon.com", password_hash: simpleHash("admin123"), nome: "Admin Nextrigon", role: "admin" })
  profiles.push({ user_id: adminId, nome: "Admin Nextrigon", areas_atuacao: [], tags: [], oab_verified: false, facial_verified: true, nota: 0, avaliacoes: 0, taxa_resposta: "" })

  // pre-match between cliente and first lawyer (Juliana)
  const juliana = profiles.find(p => p.nome === "Dra. Juliana Costa")
  if (juliana) {
    swipes.push({ from: clienteId, to: juliana.user_id, direction: "like" })
    swipes.push({ from: juliana.user_id, to: clienteId, direction: "like" })
    const matchId = `match-premade-1`
    matches.push({ id: matchId, users: [clienteId, juliana.user_id] })
  }

  // seed projects for cliente
  const pj1 = uid(); const pj2 = uid()
  projects.push({ id: pj1, owner_id: clienteId, titulo: "Acao Civil - Plano de saude", descricao: "Revisao de negativa de cobertura", area: "Direito da Saude", status: "active", prazo: "30/06/2025", progresso: 70 })
  projects.push({ id: pj2, owner_id: clienteId, titulo: "Defesa Criminal - Inquerito 4587/24", descricao: "Acompanhamento processual", area: "Direito Penal", status: "active", prazo: "15/07/2025", progresso: 20 })
  projectSteps.push({ id: uid(), project_id: pj1, ordem: 1, titulo: "Diagnostico inicial", descricao: "Entendimento das necessidades", done: true })
  projectSteps.push({ id: uid(), project_id: pj1, ordem: 2, titulo: "Analise de documentacao", descricao: "Revisao de documentos", done: true })
  projectSteps.push({ id: uid(), project_id: pj1, ordem: 3, titulo: "Elaboracao de defesa", descricao: "Producao de pecas juridicas", done: false })
  projectSteps.push({ id: uid(), project_id: pj2, ordem: 1, titulo: "Levantamento de provas", descricao: "Coleta de evidencias", done: true })
  projectSteps.push({ id: uid(), project_id: pj2, ordem: 2, titulo: "Acompanhamento", descricao: "Aguardando audiencia", done: false })
})()

function getProfile(pid: string) { return profiles.find(x => x.user_id === pid) }
function getUser(id: string) { return users.find(u => u.id === id) }

function authUser(req: NextRequest): { user: User | null; profile: Profile | null } {
  const payload = decodeMockToken(req.headers.get("authorization")?.replace("Bearer ", "") || "")
  if (!payload?.sub) return { user: null, profile: null }
  const user = getUser(payload.sub as string)
  return { user: user || null, profile: user ? getProfile(user.id) || null : null }
}

export async function GET(req: NextRequest) {
  const { pathname, searchParams } = new URL(req.url)
  const { user, profile } = authUser(req)
  const userId = user?.id || null
  const isAdmin = user?.role === "admin"

  if (pathname === "/api/health") return NextResponse.json({ status: "ok" })

  if (pathname === "/api/users/me") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const ver = verifications.find(v => v.user_id === userId)
    return NextResponse.json({
      ...(profile || {}), user_id: userId, nome: profile?.nome || "Usuário", projetos_concluidos: projects.filter(p => p.owner_id === userId).length,
      oab_status: ver?.status || "none", facial_verified: profile?.facial_verified || false,
    })
  }

  if (pathname === "/api/users/me/export") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const p = getProfile(userId)
    const ver = verifications.find(v => v.user_id === userId)
    return NextResponse.json({
      exportado_em: new Date().toISOString(),
      usuario: { id: userId, email: user?.email, role: user?.role },
      perfil: { nome: p?.nome, bio: p?.bio, objetivo: p?.objetivo, areas_atuacao: p?.areas_atuacao, cidade: p?.cidade, uf: p?.uf },
      verificacao_oab: ver ? { oab_numero: ver.oab_numero, oab_uf: ver.oab_uf, status: ver.status } : null,
      projetos: projects.filter(pr => pr.owner_id === userId),
    })
  }

  if (pathname === "/api/match/filters") {
    const especialidades = [...new Set(profiles.flatMap(p => p.areas_atuacao))].sort()
    return NextResponse.json({ especialidades, ufs: ALL_UFS, objetivos: [] })
  }

  if (pathname === "/api/match/deck") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const swipedIds = swipes.filter(s => s.from === userId).map(s => s.to)
    const uLat = parseFloat(searchParams.get("lat") || "0")
    const uLng = parseFloat(searchParams.get("lng") || "0")
    const esp = searchParams.get("especialidade")
    const uf = searchParams.get("uf")
    const notaMin = parseFloat(searchParams.get("nota_min") || "0")
    const verificado = searchParams.get("verificado") === "true"

    let deck = profiles.filter(p => p.user_id !== userId && !swipedIds.includes(p.user_id))
    if (esp) deck = deck.filter(p => p.areas_atuacao.some(a => a.toLowerCase().includes(esp.toLowerCase())))
    if (uf) deck = deck.filter(p => p.uf === uf)
    if (notaMin > 0) deck = deck.filter(p => p.nota >= notaMin)
    if (verificado) deck = deck.filter(p => p.oab_verified)

    return NextResponse.json(deck.map(p => ({
      id: p.user_id, nome: p.nome, foto: p.foto || "", bio: p.bio || "",
      especialidade: p.areas_atuacao[0] || "Advogado(a)",
      cidade: p.cidade || "", uf: p.uf || "", tags: p.tags || [],
      nota: p.nota, avaliacoes: p.avaliacoes,
      oab_verified: p.oab_verified,
      taxa_resposta: p.taxa_resposta,
      distancia: (uLat && uLng && p.lat && p.lng) ? `${haversine(uLat, uLng, p.lat, p.lng)} km` : p.cidade || "",
      lat: p.lat, lng: p.lng,
    })))
  }

  if (pathname === "/api/match/likes") {
    if (!userId) return NextResponse.json([], { status: 200 })
    const likes = swipes.filter(s => s.to === userId && s.direction === "like")
    const matchIds = new Set(matches.filter(m => m.users.includes(userId)).flatMap(m => m.users))
    return NextResponse.json(likes.filter(s => !matchIds.has(s.from)).map(s => {
      const p = getProfile(s.from); return { user_id: s.from, nome: p?.nome || "?", areas_atuacao: p?.areas_atuacao || [], nota: p?.nota || 0 }
    }))
  }

  if (pathname === "/api/match/matches") {
    return NextResponse.json(matches.filter(m => m.users.includes(userId || "")).map(m => {
      const otherId = m.users.find(id => id !== userId) || ""
      const p = getProfile(otherId)
      return { match_id: m.id, user_id: otherId, nome: p?.nome || "Desconhecido", created_at: new Date().toISOString() }
    }))
  }

  if (pathname === "/api/verification/status") {
    if (!userId) return NextResponse.json({ status: "none" })
    const ver = verifications.find(v => v.user_id === userId)
    return NextResponse.json({ status: ver?.status || "none", oab_numero: ver?.oab_numero, oab_uf: ver?.oab_uf, facial_verified: profile?.facial_verified || false })
  }

  if (pathname === "/api/admin/verifications") {
    if (!isAdmin) return NextResponse.json({ detail: "Acesso restrito" }, { status: 403 })
    return NextResponse.json(verifications.filter(v => v.status === "pending").map(v => {
      const p = getProfile(v.user_id)
      return { id: v.id, user_id: v.user_id, nome: p?.nome || "?", oab_numero: v.oab_numero, oab_uf: v.oab_uf, status: v.status, doc_url: v.doc_url, selfie_url: v.selfie_url }
    }))
  }

  if (pathname === "/api/chat/conversations") {
    const uid = searchParams.get("user_id")
    if (!uid) return NextResponse.json([])
    return NextResponse.json(matches.filter(m => m.users.includes(uid)).map(m => {
      const otherId = m.users.find(id => id !== uid) || ""
      const convId = `conv-${m.id}`
      return { conversation_id: convId, match_id: m.id, other_user_id: otherId, last_message: messages.filter(x => x.conversation_id === convId).pop()?.content || "", last_time: "" }
    }))
  }

  const msgMatch = pathname.match(/^\/api\/chat\/conversations\/(.+)\/messages$/)
  if (msgMatch) return NextResponse.json(messages.filter(m => m.conversation_id === msgMatch[1]))

  const proposalGet = pathname.match(/^\/api\/chat\/proposals\/(.+)$/)
  if (proposalGet) {
    const proposal = proposals.find(p => p.message_id === proposalGet[1])
    if (!proposal) return NextResponse.json({ detail: "Proposta não encontrada" }, { status: 404 })
    return NextResponse.json(proposal)
  }

  if (pathname === "/api/projects") return NextResponse.json(projects.filter(p => p.owner_id === userId).map(p => ({
    ...p, steps: projectSteps.filter(s => s.project_id === p.id),
  })))

  const projectGet = pathname.match(/^\/api\/projects\/([^/]+)$/)
  if (projectGet) {
    const pj = projects.find(p => p.id === projectGet[1])
    if (!pj) return NextResponse.json({ detail: "Projeto não encontrado" }, { status: 404 })
    return NextResponse.json({ ...pj, steps: projectSteps.filter(s => s.project_id === pj.id).sort((a, b) => a.ordem - b.ordem) })
  }

  const userMatch = pathname.match(/^\/api\/users\/(.+)$/)
  if (userMatch) { const p = getProfile(userMatch[1]); return p ? NextResponse.json(p) : NextResponse.json({ detail: "Not found" }, { status: 404 }) }

  return NextResponse.json({ detail: "Not found" }, { status: 404 })
}

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const body = await req.json().catch(() => ({}))
  const { user, profile } = authUser(req)
  const userId = user?.id || null
  const isAdmin = user?.role === "admin"

  if (pathname === "/api/auth/register") {
    if (users.find(u => u.email === body.email)) return NextResponse.json({ detail: "Email já cadastrado" }, { status: 400 })
    const id = uid()
    const isAdv = body.tipo === "advogado"
    users.push({ id, email: body.email, password_hash: simpleHash(body.password), nome: body.nome, role: "user" })
    profiles.push({ user_id: id, nome: body.nome, bio: isAdv ? "Advogado(a) na Nextrigon" : "", areas_atuacao: [], tags: [], oab_verified: false, facial_verified: false, nota: 0, avaliacoes: 0, taxa_resposta: isAdv ? "< 24h" : "" })
    return NextResponse.json({ access_token: mockToken({ sub: id }), user_id: id, role: "user" })
  }

  if (pathname === "/api/auth/login") {
    const u = users.find(x => x.email === body.email && x.password_hash === simpleHash(body.password))
    if (!u) return NextResponse.json({ detail: "Email ou senha inválidos" }, { status: 401 })
    return NextResponse.json({ access_token: mockToken({ sub: u.id }), user_id: u.id, role: u.role })
  }

  if (pathname === "/api/match/swipe") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const existing = swipes.find(s => s.from === userId && s.to === body.to_user_id)
    if (existing) return NextResponse.json({ match: false })
    swipes.push({ from: userId, to: body.to_user_id, direction: body.direction })
    const reverse = swipes.find(s => s.from === body.to_user_id && s.to === userId && s.direction === "like")
    if (body.direction === "like" && reverse) {
      const matchId = `match-${matchCounter++}`
      matches.push({ id: matchId, users: [userId, body.to_user_id] })
      return NextResponse.json({ match: true, match_id: matchId })
    }
    return NextResponse.json({ match: false })
  }

  if (pathname === "/api/verification/submit") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const existing = verifications.find(v => v.user_id === userId)
    if (existing) return NextResponse.json({ detail: "Verificação já submetida", status: existing.status })
    const ver: VerificationR = {
      id: uid(), user_id: userId, oab_numero: body.oab_numero, oab_uf: body.oab_uf,
      doc_url: body.doc_url, selfie_url: body.selfie_url, status: "pending",
    }
    verifications.push(ver)
    const p = getProfile(userId)
    if (p) { p.oab_numero = body.oab_numero; p.oab_uf = body.oab_uf; p.selfie_url = body.selfie_url }
    return NextResponse.json({ status: "pending", verification_id: ver.id })
  }

  if (pathname === "/api/verification/facial") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const p = getProfile(userId)
    if (p) { p.selfie_url = body.selfie_url; p.facial_verified = true }
    return NextResponse.json({ status: "ok", facial_verified: true })
  }

  const approveMatch = pathname.match(/^\/api\/admin\/verifications\/(.+)\/approve$/)
  if (approveMatch && isAdmin) {
    const ver = verifications.find(v => v.id === approveMatch[1])
    if (ver) { ver.status = "approved"; ver.reviewed_by = userId; ver.reviewed_at = new Date().toISOString(); const p = getProfile(ver.user_id); if (p) p.oab_verified = true }
    return NextResponse.json({ status: "approved" })
  }

  const rejectMatch = pathname.match(/^\/api\/admin\/verifications\/(.+)\/reject$/)
  if (rejectMatch && isAdmin) {
    const ver = verifications.find(v => v.id === rejectMatch[1])
    if (ver) { ver.status = "rejected"; ver.reviewed_by = userId; ver.reviewed_at = new Date().toISOString() }
    return NextResponse.json({ status: "rejected" })
  }

  if (pathname === "/api/users/me/profile") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    let p = getProfile(userId)
    if (!p) { p = { user_id: userId, nome: body.nome || "Usuário", areas_atuacao: [], tags: [], oab_verified: false, facial_verified: false, nota: 0, avaliacoes: 0, taxa_resposta: "" }; profiles.push(p) }
    Object.assign(p, sanitizeProfile(body))
    return NextResponse.json({ status: "ok" })
  }

  if (pathname === "/api/chat/messages") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const msg: MessageR = { id: uid(), conversation_id: body.conversation_id, sender_id: userId, content: body.content, type: body.type || "text", file_url: body.file_url, created_at: new Date().toISOString() }
    messages.push(msg)
    return NextResponse.json({ status: "ok", message_id: msg.id })
  }

  if (pathname === "/api/chat/proposals") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const msgObj = messages.find(m => m.id === body.message_id)
    if (!msgObj) return NextResponse.json({ detail: "Mensagem não encontrada" }, { status: 404 })
    const convId = msgObj.conversation_id
    const participants = matches.filter(m => matches.some(x => x.id === convId.replace("conv-", "")))
    const targetUser = participants.length > 0 ? participants[0].users.find(u => u !== userId) : null
    const proposal: ProposalR = { id: uid(), message_id: body.message_id, from_user: userId, to_user: targetUser || "", valor: body.valor, escopo: body.escopo, prazo: body.prazo, status: "sent" }
    proposals.push(proposal)
    return NextResponse.json({ status: "ok", proposal_id: proposal.id })
  }

  const proposalAction = pathname.match(/^\/api\/chat\/proposals\/(.+)\/action$/)
  if (proposalAction) {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const prop = proposals.find(p => p.id === proposalAction[1])
    if (!prop) return NextResponse.json({ detail: "Proposta não encontrada" }, { status: 404 })
    if (body.action === "accept") prop.status = "accepted"
    else if (body.action === "decline") prop.status = "declined"
    else return NextResponse.json({ detail: "Ação inválida" }, { status: 400 })
    return NextResponse.json({ status: "ok" })
  }

  if (pathname === "/api/projects") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const pj: ProjectR = { id: uid(), owner_id: userId, titulo: body.titulo, descricao: body.descricao || "", area: body.area, status: "active", prazo: body.prazo || "", progresso: 0 }
    projects.push(pj)
    return NextResponse.json({ id: pj.id, status: "created" })
  }

  const addStep = pathname.match(/^\/api\/projects\/([^/]+)\/steps$/)
  if (addStep) {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const pj = projects.find(p => p.id === addStep[1])
    if (!pj) return NextResponse.json({ detail: "Projeto não encontrado" }, { status: 404 })
    const step: ProjectStepR = { id: uid(), project_id: pj.id, ordem: body.ordem, titulo: body.titulo, descricao: body.descricao, done: false }
    projectSteps.push(step)
    return NextResponse.json({ status: "ok", step_id: step.id })
  }

  const toggleStep = pathname.match(/^\/api\/projects\/([^/]+)\/steps\/([^/]+)\/toggle$/)
  if (toggleStep) {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const step = projectSteps.find(s => s.id === toggleStep[2] && s.project_id === toggleStep[1])
    if (!step) return NextResponse.json({ detail: "Etapa não encontrada" }, { status: 404 })
    step.done = !step.done
    const pj = projects.find(p => p.id === toggleStep[1])
    if (pj) {
      const steps = projectSteps.filter(s => s.project_id === pj.id)
      pj.progresso = steps.length ? Math.round((steps.filter(s => s.done).length / steps.length) * 100) : 0
    }
    return NextResponse.json({ status: "ok", done: step.done })
  }

  if (pathname === "/api/users/me/consent") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    return NextResponse.json({ status: "ok", consentimento: body.aceito, registrado_em: new Date().toISOString() })
  }

  if (pathname === "/api/projects/reviews") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const pj = projects.find(p => p.id === body.project_id)
    if (!pj) return NextResponse.json({ detail: "Projeto não encontrado" }, { status: 404 })
    const review: ReviewR = { id: uid(), project_id: body.project_id, from_user: userId, to_user: body.to_user_id, nota: body.nota, comentario: body.comentario, created_at: new Date().toISOString() }
    reviews.push(review)
    return NextResponse.json({ status: "ok" })
  }

  return NextResponse.json({ detail: "Not found" }, { status: 404 })
}

export async function PUT(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const body = await req.json().catch(() => ({}))
  const { user } = authUser(req)
  const userId = user?.id || null

  if (pathname === "/api/users/me/profile") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    let p = getProfile(userId)
    if (!p) { p = { user_id: userId, nome: "Usuário", areas_atuacao: [], tags: [], oab_verified: false, facial_verified: false, nota: 0, avaliacoes: 0, taxa_resposta: "" }; profiles.push(p) }
    Object.assign(p, sanitizeProfile(body))
    return NextResponse.json({ status: "ok" })
  }
  return NextResponse.json({ detail: "Not found" }, { status: 404 })
}

export async function DELETE(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const { user } = authUser(req)
  const userId = user?.id || null

  if (pathname === "/api/users/me") {
    if (!userId) return NextResponse.json({ detail: "Não autenticado" }, { status: 401 })
    const idx = users.findIndex(u => u.id === userId)
    if (idx >= 0) {
      users[idx].email = `deleted_${userId.slice(0, 8)}@anonymized.com`
      users[idx].password_hash = "ANONYMIZED"
    }
    return NextResponse.json({ status: "deleted", message: "Todos os seus dados foram anonimizados conforme a LGPD (art. 18º)" })
  }
  return NextResponse.json({ detail: "Not found" }, { status: 404 })
}
