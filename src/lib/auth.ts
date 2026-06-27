import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { Resend } from "resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ url, user }) => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "NEXTRIGON <noreply@nextrigon.com.br>",
        to: user.email,
        subject: "Redefinir sua senha · NEXTRIGON",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#0f0f13;color:#e8e8f0;border-radius:16px">
            <div style="margin-bottom:24px">
              <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#ea580c"/></linearGradient></defs>
                <rect width="40" height="40" rx="11" fill="url(#g)"/>
                <path d="M23 7L12 22h9l-2 11 11-15h-9z" fill="white"/>
                <text x="48" y="27" font-family="system-ui,sans-serif" font-weight="900" font-size="16" letter-spacing="1" fill="white">NEXTRIGON</text>
              </svg>
            </div>
            <h2 style="margin:0 0 8px;font-size:20px;font-weight:700">Redefinir senha</h2>
            <p style="margin:0 0 24px;font-size:14px;color:#9898b0;line-height:1.6">
              Recebemos uma solicitação para redefinir a senha da conta <strong>${user.email}</strong>.
              Clique no botão abaixo para criar uma nova senha.
            </p>
            <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#fb923c,#ea580c);color:white;font-weight:700;font-size:14px;text-decoration:none;padding:14px 28px;border-radius:12px">
              Redefinir senha
            </a>
            <p style="margin:24px 0 0;font-size:12px;color:#6060708">
              Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.
            </p>
          </div>
        `,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  session: { expiresIn: 60 * 60 * 24 * 7 },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
