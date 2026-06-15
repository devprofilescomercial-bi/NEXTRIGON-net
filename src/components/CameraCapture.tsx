"use client"

import { useRef, useState, useCallback } from "react"

interface Props {
  onCapture: (dataUrl: string) => void
  onClose?: () => void
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [error, setError] = useState("")

  const startCam = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 320 } })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch {
      setError("Permita acesso à câmera nas configurações do navegador.")
    }
  }, [])

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth || 320; c.height = v.videoHeight || 320
    c.getContext("2d")!.drawImage(v, 0, 0)
    const dataUrl = c.toDataURL("image/jpeg", 0.8)
    setCaptured(dataUrl)
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    onCapture(dataUrl)
  }

  const retake = () => { setCaptured(null); setStream(null); startCam() }

  if (error) return <div style={{ padding: 20, textAlign: "center", color: "var(--red)", fontSize: 14 }}>{error}</div>

  if (captured) {
    return (
      <div style={{ textAlign: "center" }}>
        <img src={captured} alt="Selfie" style={{ width: 200, height: 200, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--green)" }} />
        <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, marginTop: 8 }}>✓ Foto capturada</p>
        <button onClick={retake} className="btn-outline" style={{ marginTop: 8, fontSize: 13, padding: "8px 0" }}>Tirar novamente</button>
      </div>
    )
  }

  if (!stream) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>Precisamos de uma selfie para verificação de identidade.</p>
        <button onClick={startCam} className="btn-fill" style={{ fontSize: 14, padding: "12px 0" }}>Abrir câmera</button>
        {onClose && <button onClick={onClose} className="btn-outline" style={{ marginTop: 8, fontSize: 14, padding: "12px 0" }}>Pular por enquanto</button>}
      </div>
    )
  }

  return (
    <div style={{ textAlign: "center" }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: 320, borderRadius: 12, aspectRatio: "1/1", objectFit: "cover", background: "#000" }} />
      <button onClick={capture} className="btn-fill" style={{ marginTop: 12, fontSize: 14, padding: "12px 0" }}>📸 Capturar</button>
    </div>
  )
}
