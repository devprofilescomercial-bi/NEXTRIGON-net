# Nextrigon — Deploy (KVM dedicada · Easypanel + Traefik)

Stack: Next.js 16 (standalone) + Better Auth + Drizzle ORM + Postgres + MinIO.
Padrão Raya self-hosted (igual ao Mira). Frontend 100% redesenhado (Dark Premium).

## Pré-requisitos (o que precisa de você)
1. **VPS KVM dedicada do cliente** (recomendado KVM2: 2 vCPU / 8GB / 100GB) com Easypanel.
2. **Postgres** provisionado no Easypanel → pega a `DATABASE_URL`.
3. **MinIO** (bucket privado `nextrigon-docs`) pros uploads de carteira/selfie.
4. Domínio apontado (ex.: `nextrigon.seudominio.com.br`) no Traefik.

## Passos
1. Copiar `.env.example` → `.env` e preencher (DATABASE_URL, BETTER_AUTH_SECRET, URLs, MinIO).
2. Gerar/aplicar o schema no banco:
   - `npx drizzle-kit generate` (gera SQL em ./drizzle)
   - `npx drizzle-kit migrate` (aplica no Postgres)
   - (auth) se preferir, `npx @better-auth/cli generate` para conferir as tabelas do Better Auth.
3. Build da imagem (o Easypanel faz isso pelo Dockerfile) e subir o serviço apontando as env vars.
4. Traefik termina o TLS; cookies de sessão ficam httpOnly + secure.

## Segurança (já previsto na arquitetura)
- Front nunca toca o banco direto — tudo via rotas/Better Auth.
- Documentos sensíveis no MinIO privado com URLs assinadas (não públicas).
- Rate limiting + RBAC (role user/admin no schema) a ligar nas rotas.

## Estado atual
- ✅ Frontend completo e redesenhado (9 telas) rodando em dev.
- ✅ Schema, auth e configs prontos.
- ⏳ Falta: provisionar Postgres+MinIO na KVM, rodar migrations, portar a lógica
  dos ~40 endpoints do protótipo Supabase do Brendow para Drizzle, e subir.
