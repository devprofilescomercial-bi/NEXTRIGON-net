import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextrigon.187.77.246.32.sslip.io";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "NEXTRIGON <noreply@nextrigon.com.br>",
      to: email,
      subject: "Tentativa de cadastro detectada · NEXTRIGON",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;background:#070c18;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
          <div style="background:linear-gradient(135deg,#fb923c,#ea580c);padding:28px 32px;display:flex;align-items:center;gap:14px">
            <div style="background:rgba(0,0,0,0.25);border-radius:14px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:24px">🐯</div>
            <span style="color:white;font-size:22px;font-weight:900;letter-spacing:0.1em">NEXTRIGON</span>
          </div>
          <div style="padding:32px;color:#e8e8f0">
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:700">Você já tem uma conta</h2>
            <p style="margin:0 0 20px;font-size:14px;color:#9898b0;line-height:1.6">
              Alguém tentou criar uma nova conta com o e-mail <strong>${email}</strong>, mas ele já está cadastrado no NEXTRIGON.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#9898b0;line-height:1.6">
              Se foi você, basta fazer login normalmente. Se esqueceu sua senha, use o link abaixo para redefini-la.
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <a href="${APP_URL}/login" style="display:inline-block;background:linear-gradient(135deg,#fb923c,#ea580c);color:white;font-weight:700;font-size:14px;text-decoration:none;padding:14px 28px;border-radius:12px">
                Fazer login
              </a>
              <a href="${APP_URL}/forgot-password" style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#e8e8f0;font-weight:600;font-size:14px;text-decoration:none;padding:14px 28px;border-radius:12px">
                Esqueci minha senha
              </a>
            </div>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0" />
            <p style="margin:0;font-size:11px;color:#5d6c86;text-align:center">
              Se não foi você, ignore este e-mail. Sua conta está segura.<br/>
              Colaboração entre advogados · dentro das regras da OAB
            </p>
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error("[notify/existing-account]", e);
  }

  return NextResponse.json({ ok: true });
}
