import * as Minio from "minio"

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "nextrigon-minio.ybgdt8.easypanel.host",
  port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 443,
  useSSL: process.env.MINIO_USE_SSL !== "false",
  accessKey: process.env.MINIO_ACCESS_KEY || "nextrigon",
  secretKey: process.env.MINIO_SECRET_KEY || "Nextrigon2024",
})

export const BUCKETS = {
  avatars: "nextrigon-avatars",
  docs: "nextrigon-docs",
  selfies: "nextrigon-selfies",
}

export async function uploadBase64(
  bucket: string,
  objectName: string,
  base64: string,
  contentType: string
): Promise<string> {
  const base64Data = base64.replace(/^data:[^;]+;base64,/, "")
  const buffer = Buffer.from(base64Data, "base64")
  await minioClient.putObject(bucket, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
  })
  const endpoint = process.env.MINIO_ENDPOINT || "nextrigon-minio.ybgdt8.easypanel.host"
  return `https://${endpoint}/${bucket}/${objectName}`
}

export async function uploadBuffer(
  bucket: string,
  objectName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await minioClient.putObject(bucket, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
  })
  const endpoint = process.env.MINIO_ENDPOINT || "nextrigon-minio.ybgdt8.easypanel.host"
  return `https://${endpoint}/${bucket}/${objectName}`
}

export async function getPresignedUrl(bucket: string, objectName: string, expiry = 3600): Promise<string> {
  return minioClient.presignedGetObject(bucket, objectName, expiry)
}

export default minioClient
