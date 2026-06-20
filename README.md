# Nextrigon

> **Conecta. Colabora. Realiza.** — a rede de _match_ entre advogados: encontre o parceiro certo por especialidade, comarca e reputação.

**Versão:** `v0.0.1` · _teste / pré-MVP_
**Cliente:** Nextrigon · **Dev:** Júlio + Brendow

---

## Fase atual do desenvolvimento

| Camada | Estado |
|---|---|
| **Frontend (redesign Dark Premium)** | ✅ 9 telas completas |
| **Design system** | ✅ tokens, glass, componentes, ícones SVG |
| **Backend (fundação)** | ✅ schema Drizzle (16 tabelas), Better Auth, db client |
| **Infra (VPS dedicada)** | ✅ Postgres 16 + Easypanel + Traefik |
| **Deploy** | 🚧 em andamento (subindo o app na `main`) |
| **Endpoints conectados ao banco** | ⏳ próxima etapa (hoje as telas usam dados mock) |

## Stack

- **Front:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (PWA mobile-first)
- **Auth:** Better Auth · **ORM:** Drizzle · **Banco:** PostgreSQL 16
- **Infra:** VPS KVM (Hostinger) · Easypanel · Traefik · Docker (build standalone)

## Telas (rotas)

`/login` · `/onboarding` · `/match` · `/projetos` · `/chat` · `/chat/[id]` (conversa + proposta) · `/perfil` · `/verificacao` (OAB) · `/admin`

## Sprints

- **Sprint 0 — Protótipo** ✅ _(versão Supabase do Brendow, preservada na branch `prototype-supabase`)_
- **Sprint 1 — Reestrutura + Redesign** ✅ _(este release: stack-alvo + Dark Premium + fundação de backend)_
- **Sprint 2 — Deploy + Banco real** 🚧 _(infra e Postgres no ar; portar endpoints Supabase→Drizzle e conectar as telas)_
- **Sprint 3 — Compliance OAB + match real** ⏳ _(score ponderado, verificação OAB assistida, LGPD)_
- **Sprint 4 — Pagamentos + Mobile** ⏳ _(assinatura, app Expo/React Native)_

## Compliance (OAB)

- Ranking por **mérito** (reputação), nunca por pagamento — Prov. 205/2021 veda destaque pago.
- Valores de honorário só em **negociação privada** (chat), nunca expostos no perfil.

## Rodar local

```bash
npm install
cp .env.example .env   # preencher DATABASE_URL, BETTER_AUTH_SECRET, URLs
npm run dev            # http://localhost:3000
```

## Deploy

Build standalone via `Dockerfile`. Passo a passo (Easypanel + Traefik + Postgres) em [`DEPLOY.md`](./DEPLOY.md).
