import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, session, account, verificationToken } from "@/db/schema";
import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextrigon.187.77.246.32.sslip.io";

function emailBase(content: string) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;background:#070c18;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
      <div style="background:linear-gradient(135deg,#fb923c,#ea580c);padding:28px 32px;display:flex;align-items:center;gap:14px">
        <div style="background:rgba(0,0,0,0.25);border-radius:14px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:24px">🐯</div>
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:0.1em">NEXTRIGON</span>
      </div>
      <div style="padding:32px;color:#e8e8f0">
        ${content}
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0" />
        <p style="margin:0;font-size:11px;color:#5d6c86;text-align:center">
          Colaboração entre advogados · dentro das regras da OAB<br/>
          Seus dados são protegidos pela LGPD · <a href="${APP_URL}" style="color:#fb923c;text-decoration:none">nextrigon.com.br</a>
        </p>
      </div>
    </div>
  `;
}

function btnPrimary(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#fb923c,#ea580c);color:white;font-weight:700;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:12px;margin-top:8px">${label}</a>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: "NEXTRIGON <noreply@nextrigon.com.br>", to, subject, html });
  } catch (e) {
    console.error("[Email] Falha ao enviar:", e);
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification: verificationToken },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ url, user }) => {
      await sendEmail(
        user.email,
        "Redefinir sua senha · NEXTRIGON",
        emailBase(`
          <h2 style="margin:0 0 8px;font-size:20px;font-weight:700">Redefinir senha</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#9898b0;line-height:1.6">
            Recebemos uma solicitação para redefinir a senha da conta <strong>${user.email}</strong>.
            Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
          </p>
          ${btnPrimary(url, "Redefinir senha")}
          <p style="margin:20px 0 0;font-size:12px;color:#5d6c86">
            Se você não solicitou a redefinição, ignore este e-mail — sua senha não será alterada.
          </p>
        `)
      );
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (newUser) => {
          await sendEmail(
            newUser.email,
            "Bem-vindo ao NEXTRIGON! 🐯",
            emailBase(`
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:800">Bem-vindo, ${newUser.name?.split(" ")[0] ?? "advogado"}!</h2>
              <p style="margin:0 0 20px;font-size:14px;color:#9898b0;line-height:1.6">
                Sua conta foi criada com sucesso. O NEXTRIGON conecta advogados para colaboração, parcerias e crescimento profissional — dentro das regras da OAB.
              </p>
              <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;margin-bottom:24px">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#fb923c">Próximos passos:</p>
                <p style="margin:0 0 6px;font-size:13px;color:#9898b0">✅ Complete seu perfil com bio e áreas de atuação</p>
                <p style="margin:0 0 6px;font-size:13px;color:#9898b0">✅ Faça a verificação OAB para ganhar o selo verificado</p>
                <p style="margin:0;font-size:13px;color:#9898b0">✅ Explore os parceiros compatíveis com você no Match</p>
              </div>
              ${btnPrimary(`${APP_URL}/match`, "Acessar o NEXTRIGON")}
            `)
          );
        },
      },
    },
  },

  session: { expiresIn: 60 * 60 * 24 * 7 },
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.NEXT_PUBLIC_APP_URL ?? "nextrigon-secret-fallback",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "",
    process.env.NEXT_PUBLIC_APP_URL ?? "",
    "nextrigon://",
  ].filter(Boolean),
  advanced: {
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
    },
  },
  rateLimit: {
    window: 60,
    max: 100,
  },
});
