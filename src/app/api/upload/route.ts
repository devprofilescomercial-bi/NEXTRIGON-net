import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadBase64, BUCKETS } from "@/lib/minio"

async function authUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  return session?.user ?? null
}

export async function POST(req: NextRequest) {
  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

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
    objectName = `${user.id}/avatar_${timestamp}.${ext}`
    url = await uploadBase64(bucket, objectName, base64, contentType)
  } else if (type === "selfie") {
    bucket = BUCKETS.selfies
    objectName = `${user.id}/selfie_${timestamp}.${ext}`
    url = await uploadBase64(bucket, objectName, base64, contentType)
  } else if (type === "doc") {
    bucket = BUCKETS.docs
    objectName = `${user.id}/doc_${timestamp}.${ext}`
    url = await uploadBase64(bucket, objectName, base64, contentType)
  } else {
    return NextResponse.json({ detail: "type invalido. Use: avatar, selfie, doc" }, { status: 400 })
  }

  return NextResponse.json({ url, bucket, objectName })
}
