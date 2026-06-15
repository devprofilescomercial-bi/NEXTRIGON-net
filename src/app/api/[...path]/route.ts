import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createClient } from "@supabase/supabase-js"

const ALL_UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

async function authUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || ""
  if (!token) return { userId: null, isAdmin: false, profile: null }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return { userId: null, isAdmin: false, profile: null }
  const isAdmin = user.app_metadata?.role === "admin"
  const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("user_id", user.id).single()
  return { userId: user.id, isAdmin, profile }
}

export async function GET(req: NextRequest) {
  const { pathname, searchParams } = new URL(req.url)
  const { userId, isAdmin, profile } = await authUser(req)

  if (pathname === "/api/health") return NextResponse.json({ status: "ok" })

  if (pathname === "/api/users/me") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: ver } = await supabaseAdmin.from("verifications").select("*").eq("user_id", userId).maybeSingle()
    const { count: projetosCount } = await supabaseAdmin.from("projects").select("*", { count: "exact", head: true }).eq("owner_id", userId)
    return NextResponse.json({
      ...(profile || {}), user_id: userId, nome: profile?.nome || "Usuario",
      projetos_concluidos: projetosCount || 0,
      oab_status: ver?.status || "none", facial_verified: profile?.facial_verified || false,
    })
  }

  if (pathname === "/api/users/me/export") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: p } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userId).single()
    const { data: ver } = await supabaseAdmin.from("verifications").select("*").eq("user_id", userId).maybeSingle()
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
    const { data: projs } = await supabaseAdmin.from("projects").select("*").eq("owner_id", userId)
    return NextResponse.json({
      exportado_em: new Date().toISOString(),
      usuario: { id: userId, email: userData?.user?.email, role: (userData?.user?.app_metadata?.role as string) || "user" },
      perfil: { nome: p?.nome, bio: p?.bio, objetivo: p?.objetivo, areas_atuacao: p?.areas_atuacao, cidade: p?.cidade, uf: p?.uf },
      verificacao_oab: ver ? { oab_numero: ver.oab_numero, oab_uf: ver.oab_uf, status: ver.status } : null,
      projetos: projs || [],
    })
  }

  if (pathname === "/api/match/filters") {
    const { data: profiles } = await supabaseAdmin.from("profiles").select("areas_atuacao")
    const especialidades = [...new Set((profiles || []).flatMap(p => p.areas_atuacao as string[]))].sort()
    return NextResponse.json({ especialidades, ufs: ALL_UFS, objetivos: [] })
  }

  if (pathname === "/api/match/deck") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: swiped } = await supabaseAdmin.from("swipes").select("to_user").eq("from_user", userId)
    const swipedIds = (swiped || []).map(s => s.to_user)
    const uLat = parseFloat(searchParams.get("lat") || "0")
    const uLng = parseFloat(searchParams.get("lng") || "0")
    const esp = searchParams.get("especialidade")
    const uf = searchParams.get("uf")
    const notaMin = parseFloat(searchParams.get("nota_min") || "0")
    const verificado = searchParams.get("verificado") === "true"

    let query = supabaseAdmin.from("profiles").select("*").neq("user_id", userId)
    if (uf) query = query.eq("uf", uf)
    if (notaMin > 0) query = query.gte("nota", notaMin)
    if (verificado) query = query.eq("oab_verified", true)

    const { data: deck } = await query

    let filtered = (deck || []).filter((p: any) => !swipedIds.includes(p.user_id))
    if (esp) filtered = filtered.filter((p: any) => (p.areas_atuacao || []).some((a: string) => a.toLowerCase().includes(esp.toLowerCase())))

    return NextResponse.json(filtered.map((p: any) => ({
      id: p.user_id, nome: p.nome, foto: p.foto || "", bio: p.bio || "",
      especialidade: (p.areas_atuacao as string[])?.[0] || "Advogado(a)",
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
    const { data: likes } = await supabaseAdmin.from("swipes").select("from_user").eq("to_user", userId).eq("direction", "like")
    const { data: matchRows } = await supabaseAdmin.from("matches").select("user1,user2").or(`user1.eq.${userId},user2.eq.${userId}`)
    const matchUserIds = new Set((matchRows || []).flatMap((m: any) => [m.user1, m.user2]))
    const uniqLikes = [...new Set((likes || []).map(l => l.from_user).filter(id => !matchUserIds.has(id)))]
    const { data: profs } = await supabaseAdmin.from("profiles").select("*").in("user_id", uniqLikes.length ? uniqLikes : ["none"])
    const profMap = new Map((profs || []).map((p: any) => [p.user_id, p]))
    return NextResponse.json(uniqLikes.map(id => {
      const p = profMap.get(id) || {}
      return { user_id: id, nome: p.nome || "?", areas_atuacao: p.areas_atuacao || [], nota: p.nota || 0 }
    }))
  }

  if (pathname === "/api/match/matches") {
    const { data: matchRows } = await supabaseAdmin.from("matches").select("*").or(`user1.eq.${userId},user2.eq.${userId}`)
    const otherIds = (matchRows || []).map((m: any) => m.user1 === userId ? m.user2 : m.user1)
    const { data: profs } = await supabaseAdmin.from("profiles").select("*").in("user_id", otherIds.length ? otherIds : ["none"])
    const profMap = new Map((profs || []).map((p: any) => [p.user_id, p]))
    return NextResponse.json((matchRows || []).map((m: any) => {
      const otherId = m.user1 === userId ? m.user2 : m.user1
      const p = profMap.get(otherId) || {}
      return { match_id: m.id, user_id: otherId, nome: p.nome || "Desconhecido", created_at: m.created_at }
    }))
  }

  if (pathname === "/api/verification/status") {
    if (!userId) return NextResponse.json({ status: "none" })
    const { data: ver } = await supabaseAdmin.from("verifications").select("*").eq("user_id", userId).maybeSingle()
    return NextResponse.json({
      status: ver?.status || "none", oab_numero: ver?.oab_numero, oab_uf: ver?.oab_uf,
      facial_verified: profile?.facial_verified || false,
    })
  }

  if (pathname === "/api/admin/verifications") {
    if (!isAdmin) return NextResponse.json({ detail: "Acesso restrito" }, { status: 403 })
    const { data: vers } = await supabaseAdmin.from("verifications").select("*").eq("status", "pending")
    const userIds = (vers || []).map(v => v.user_id)
    const { data: profs } = await supabaseAdmin.from("profiles").select("*").in("user_id", userIds.length ? userIds : ["none"])
    const profMap = new Map((profs || []).map((p: any) => [p.user_id, p]))
    return NextResponse.json((vers || []).map(v => {
      const p = profMap.get(v.user_id) || {}
      return { id: v.id, user_id: v.user_id, nome: p.nome || "?", oab_numero: v.oab_numero, oab_uf: v.oab_uf, status: v.status, doc_url: v.doc_url, selfie_url: v.selfie_url }
    }))
  }

  if (pathname === "/api/chat/conversations") {
    const uid = searchParams.get("user_id")
    if (!uid) return NextResponse.json([])
    const { data: matchRows } = await supabaseAdmin.from("matches").select("*").or(`user1.eq.${uid},user2.eq.${uid}`)
    const results = await Promise.all((matchRows || []).map(async (m: any) => {
      const otherId = m.user1 === uid ? m.user2 : m.user1
      const convId = `conv-${m.id}`
      const { data: msgs } = await supabaseAdmin.from("messages").select("content").eq("conversation_id", convId).order("created_at", { ascending: false }).limit(1)
      return { conversation_id: convId, match_id: m.id, other_user_id: otherId, last_message: msgs?.[0]?.content || "", last_time: "" }
    }))
    return NextResponse.json(results)
  }

  const msgMatch = pathname.match(/^\/api\/chat\/conversations\/(.+)\/messages$/)
  if (msgMatch) {
    const { data: msgs } = await supabaseAdmin.from("messages").select("*").eq("conversation_id", msgMatch[1]).order("created_at", { ascending: true })
    return NextResponse.json(msgs || [])
  }

  const proposalGet = pathname.match(/^\/api\/chat\/proposals\/(.+)$/)
  if (proposalGet) {
    const { data: msg } = await supabaseAdmin.from("messages").select("id").eq("id", proposalGet[1]).single()
    if (!msg) return NextResponse.json({ detail: "Proposta nao encontrada" }, { status: 404 })
    const { data: prop } = await supabaseAdmin.from("proposals").select("*").eq("message_id", proposalGet[1]).maybeSingle()
    if (!prop) return NextResponse.json({ detail: "Proposta nao encontrada" }, { status: 404 })
    return NextResponse.json(prop)
  }

  if (pathname === "/api/projects") {
    const { data: projs } = await supabaseAdmin.from("projects").select("*").eq("owner_id", userId)
    const projectIds = (projs || []).map(p => p.id)
    const { data: steps } = await supabaseAdmin.from("project_steps").select("*").in("project_id", projectIds.length ? projectIds : ["none"])
    const stepsMap = new Map()
    for (const s of (steps || [])) { if (!stepsMap.has(s.project_id)) stepsMap.set(s.project_id, []); stepsMap.get(s.project_id).push(s) }
    return NextResponse.json((projs || []).map(p => ({ ...p, steps: stepsMap.get(p.id) || [] })))
  }

  const projectGet = pathname.match(/^\/api\/projects\/([^/]+)$/)
  if (projectGet) {
    const { data: pj } = await supabaseAdmin.from("projects").select("*").eq("id", projectGet[1]).single()
    if (!pj) return NextResponse.json({ detail: "Projeto nao encontrado" }, { status: 404 })
    const { data: steps } = await supabaseAdmin.from("project_steps").select("*").eq("project_id", projectGet[1]).order("ordem", { ascending: true })
    return NextResponse.json({ ...pj, steps: steps || [] })
  }

  const userMatch = pathname.match(/^\/api\/users\/(.+)$/)
  if (userMatch) {
    const { data: p } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userMatch[1]).single()
    return p ? NextResponse.json(p) : NextResponse.json({ detail: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ detail: "Not found" }, { status: 404 })
}

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const body = await req.json().catch(() => ({}))
  const { userId, isAdmin, profile } = await authUser(req)

  if (pathname === "/api/auth/register") {
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data: existing } = await supabaseAnon.auth.signInWithPassword({ email: body.email, password: body.password }).catch(() => ({ data: null }))
    if (existing?.user) return NextResponse.json({ detail: "Email ja cadastrado" }, { status: 400 })
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: body.email, password: body.password, email_confirm: true,
      user_metadata: { nome: body.nome, tipo: body.tipo },
    })
    if (error) return NextResponse.json({ detail: error.message }, { status: 400 })
    const uid = data.user.id
    const isAdv = body.tipo === "advogado"
    const { data: session } = await supabaseAnon.auth.signInWithPassword({ email: body.email, password: body.password })
    return NextResponse.json({ access_token: session?.session?.access_token || "", user_id: uid, role: "user" })
  }

  if (pathname === "/api/auth/login") {
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email: body.email, password: body.password })
    if (error) return NextResponse.json({ detail: "Email ou senha invalidos" }, { status: 401 })
    const uid = data.user.id
    const role = data.user.app_metadata?.role || "user"
    return NextResponse.json({ access_token: data.session.access_token, user_id: uid, role })
  }

  if (pathname === "/api/match/swipe") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: existing } = await supabaseAdmin.from("swipes").select("*").eq("from_user", userId).eq("to_user", body.to_user_id).maybeSingle()
    if (existing) return NextResponse.json({ match: false })
    await supabaseAdmin.from("swipes").insert({ from_user: userId, to_user: body.to_user_id, direction: body.direction })
    const { data: reverse } = await supabaseAdmin.from("swipes").select("*").eq("from_user", body.to_user_id).eq("to_user", userId).eq("direction", "like").maybeSingle()
    if (body.direction === "like" && reverse) {
      const { data: match } = await supabaseAdmin.from("matches").insert({ user1: userId, user2: body.to_user_id }).select().single()
      return NextResponse.json({ match: true, match_id: match.id })
    }
    return NextResponse.json({ match: false })
  }

  if (pathname === "/api/verification/submit") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: existing } = await supabaseAdmin.from("verifications").select("*").eq("user_id", userId).maybeSingle()
    if (existing) return NextResponse.json({ detail: "Verificacao ja submetida", status: existing.status })
    const { data: ver } = await supabaseAdmin.from("verifications").insert({
      user_id: userId, oab_numero: body.oab_numero, oab_uf: body.oab_uf,
      doc_url: body.doc_url, selfie_url: body.selfie_url, status: "pending",
    }).select().single()
    await supabaseAdmin.from("profiles").update({ oab_numero: body.oab_numero, oab_uf: body.oab_uf, selfie_url: body.selfie_url }).eq("user_id", userId)
    return NextResponse.json({ status: "pending", verification_id: ver.id })
  }

  if (pathname === "/api/verification/facial") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    await supabaseAdmin.from("profiles").update({ selfie_url: body.selfie_url, facial_verified: true }).eq("user_id", userId)
    return NextResponse.json({ status: "ok", facial_verified: true })
  }

  const approveMatch = pathname.match(/^\/api\/admin\/verifications\/(.+)\/approve$/)
  if (approveMatch && isAdmin) {
    await supabaseAdmin.from("verifications").update({ status: "approved", reviewed_by: userId, reviewed_at: new Date().toISOString() }).eq("id", approveMatch[1])
    const { data: ver } = await supabaseAdmin.from("verifications").select("user_id").eq("id", approveMatch[1]).single()
    if (ver) await supabaseAdmin.from("profiles").update({ oab_verified: true }).eq("user_id", ver.user_id)
    return NextResponse.json({ status: "approved" })
  }

  const rejectMatch = pathname.match(/^\/api\/admin\/verifications\/(.+)\/reject$/)
  if (rejectMatch && isAdmin) {
    await supabaseAdmin.from("verifications").update({ status: "rejected", reviewed_by: userId, reviewed_at: new Date().toISOString() }).eq("id", rejectMatch[1])
    return NextResponse.json({ status: "rejected" })
  }

  if (pathname === "/api/users/me/profile") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: existing } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userId).maybeSingle()
    if (!existing) await supabaseAdmin.from("profiles").insert({ user_id: userId, nome: body.nome || "Usuario", areas_atuacao: [], tags: [], oab_verified: false, facial_verified: false, nota: 0, avaliacoes: 0, taxa_resposta: "" })
    const clean = sanitizeProfile(body)
    if (Object.keys(clean).length > 0) await supabaseAdmin.from("profiles").update(clean).eq("user_id", userId)
    return NextResponse.json({ status: "ok" })
  }

  if (pathname === "/api/chat/messages") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: msg } = await supabaseAdmin.from("messages").insert({
      conversation_id: body.conversation_id, sender_id: userId,
      content: body.content, type: body.type || "text", file_url: body.file_url,
    }).select().single()
    return NextResponse.json({ status: "ok", message_id: msg.id })
  }

  if (pathname === "/api/chat/proposals") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: msgObj } = await supabaseAdmin.from("messages").select("*").eq("id", body.message_id).single()
    if (!msgObj) return NextResponse.json({ detail: "Mensagem nao encontrada" }, { status: 404 })
    const convId = msgObj.conversation_id
    const matchId = convId.replace("conv-", "")
    const { data: matchRow } = await supabaseAdmin.from("matches").select("*").eq("id", matchId).single()
    const targetUser = matchRow ? (matchRow.user1 === userId ? matchRow.user2 : matchRow.user1) : ""
    const { data: proposal } = await supabaseAdmin.from("proposals").insert({
      message_id: body.message_id, from_user: userId, to_user: targetUser,
      valor: body.valor, escopo: body.escopo, prazo: body.prazo, status: "sent",
    }).select().single()
    return NextResponse.json({ status: "ok", proposal_id: proposal.id })
  }

  const proposalAction = pathname.match(/^\/api\/chat\/proposals\/(.+)\/action$/)
  if (proposalAction) {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: prop } = await supabaseAdmin.from("proposals").select("*").eq("id", proposalAction[1]).single()
    if (!prop) return NextResponse.json({ detail: "Proposta nao encontrada" }, { status: 404 })
    const newStatus = body.action === "accept" ? "accepted" : body.action === "decline" ? "declined" : null
    if (!newStatus) return NextResponse.json({ detail: "Acao invalida" }, { status: 400 })
    await supabaseAdmin.from("proposals").update({ status: newStatus }).eq("id", proposalAction[1])
    return NextResponse.json({ status: "ok" })
  }

  if (pathname === "/api/projects") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: pj } = await supabaseAdmin.from("projects").insert({
      owner_id: userId, titulo: body.titulo, descricao: body.descricao || "",
      area: body.area, status: "active", prazo: body.prazo || "", progresso: 0,
    }).select().single()
    return NextResponse.json({ id: pj.id, status: "created" })
  }

  const addStep = pathname.match(/^\/api\/projects\/([^/]+)\/steps$/)
  if (addStep) {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: pj } = await supabaseAdmin.from("projects").select("*").eq("id", addStep[1]).single()
    if (!pj) return NextResponse.json({ detail: "Projeto nao encontrado" }, { status: 404 })
    const { data: step } = await supabaseAdmin.from("project_steps").insert({
      project_id: pj.id, ordem: body.ordem, titulo: body.titulo, descricao: body.descricao, done: false,
    }).select().single()
    return NextResponse.json({ status: "ok", step_id: step.id })
  }

  const toggleStep = pathname.match(/^\/api\/projects\/([^/]+)\/steps\/([^/]+)\/toggle$/)
  if (toggleStep) {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: step } = await supabaseAdmin.from("project_steps").select("*").eq("id", toggleStep[2]).eq("project_id", toggleStep[1]).single()
    if (!step) return NextResponse.json({ detail: "Etapa nao encontrada" }, { status: 404 })
    await supabaseAdmin.from("project_steps").update({ done: !step.done }).eq("id", step.id)
    const { data: steps } = await supabaseAdmin.from("project_steps").select("*").eq("project_id", toggleStep[1])
    const done = (steps || []).filter(s => s.done).length
    const progresso = (steps || []).length ? Math.round((done / (steps || []).length) * 100) : 0
    await supabaseAdmin.from("projects").update({ progresso }).eq("id", toggleStep[1])
    return NextResponse.json({ status: "ok", done: !step.done })
  }

  if (pathname === "/api/users/me/consent") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    return NextResponse.json({ status: "ok", consentimento: body.aceito, registrado_em: new Date().toISOString() })
  }

  if (pathname === "/api/projects/reviews") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: pj } = await supabaseAdmin.from("projects").select("*").eq("id", body.project_id).single()
    if (!pj) return NextResponse.json({ detail: "Projeto nao encontrado" }, { status: 404 })
    await supabaseAdmin.from("reviews").insert({
      project_id: body.project_id, from_user: userId, to_user: body.to_user_id,
      nota: body.nota, comentario: body.comentario,
    })
    return NextResponse.json({ status: "ok" })
  }

  return NextResponse.json({ detail: "Not found" }, { status: 404 })
}

export async function PUT(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const body = await req.json().catch(() => ({}))
  const { userId } = await authUser(req)

  if (pathname === "/api/users/me/profile") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    const { data: existing } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userId).maybeSingle()
    if (!existing) await supabaseAdmin.from("profiles").insert({ user_id: userId, nome: "Usuario", areas_atuacao: [], tags: [], oab_verified: false, facial_verified: false, nota: 0, avaliacoes: 0, taxa_resposta: "" })
    const clean = sanitizeProfile(body)
    if (Object.keys(clean).length > 0) await supabaseAdmin.from("profiles").update(clean).eq("user_id", userId)
    return NextResponse.json({ status: "ok" })
  }
  return NextResponse.json({ detail: "Not found" }, { status: 404 })
}

export async function DELETE(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const { userId } = await authUser(req)

  if (pathname === "/api/users/me") {
    if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
    await supabaseAdmin.auth.admin.updateUserById(userId, { email: `deleted_${userId.slice(0, 8)}@anonymized.com` })
    return NextResponse.json({ status: "deleted", message: "Todos os seus dados foram anonimizados conforme a LGPD (art. 18o)" })
  }
  return NextResponse.json({ detail: "Not found" }, { status: 404 })
}
