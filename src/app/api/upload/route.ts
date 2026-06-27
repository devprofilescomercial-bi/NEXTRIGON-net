import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { uploadBase64, BUCKETS } from "@/lib/minio"
import { randomUUID } from "crypto"

async function authUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || ""
  if (!token) return null
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user.id
}

export async function POST(req: NextRequest) {
  const userId = await authUser(req)
  if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { type, data: base64, mime } = body

  if (!type || !base64) {
    return NextResponse.json({ detail: "Campos obrigatorios: type, data" }, { status: 400 })
  }

  const contentType = mime || "image/jpeg"
  const ext = contentType.split("/")[1] || "jpg"
  const timestamp = Date.now()

  let url: string
  let bucket: string
  let objectName: string

  if (type === "avatar") {
    bucket = BUCKETS.avatars
    objectName = `${userId}/avatar_${timestamp}.${ext}`
    url = await uploadBase64(bucket, objectName, base64, contentType)
    await supabaseAdmin.from("profiles").update({ foto: url }).eq("user_id", userId)
  } else if (type === "selfie") {
    bucket = BUCKETS.selfies
    objectName = `${userId}/selfie_${timestamp}.${ext}`
    url = await uploadBase64(bucket, objectName, base64, contentType)
    await supabaseAdmin.from("profiles").update({ selfie_url: url }).eq("user_id", userId)
  } else if (type === "doc") {
    bucket = BUCKETS.docs
    objectName = `${userId}/doc_${timestamp}.${ext}`
    url = await uploadBase64(bucket, objectName, base64, contentType)
  } else {
    return NextResponse.json({ detail: "type invalido. Use: avatar, selfie, doc" }, { status: 400 })
  }

  return NextResponse.json({ url, bucket, objectName })
}
