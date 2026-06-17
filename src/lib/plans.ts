export interface PlanConfig {
  id: string
  nome: string
  preco: number
  matches_mensais: number
  boosts_mensais: number
  pode_ver_quem_curtiu: boolean
  chat_ilimitado: boolean
  primeira_impressao: boolean
  perfil_verificado: boolean
  ranking_premium: boolean
  relatorios: string
  destaque_nacional: boolean
  selo_autoridade: boolean
}

export const PLANOS: PlanConfig[] = [
  {
    id: "free",
    nome: "Grátis",
    preco: 0,
    matches_mensais: 5,
    boosts_mensais: 0,
    pode_ver_quem_curtiu: false,
    chat_ilimitado: false,
    primeira_impressao: false,
    perfil_verificado: false,
    ranking_premium: false,
    relatorios: "none",
    destaque_nacional: false,
    selo_autoridade: false,
  },
  {
    id: "pro",
    nome: "Pro",
    preco: 49,
    matches_mensais: 999999,
    boosts_mensais: 2,
    pode_ver_quem_curtiu: true,
    chat_ilimitado: true,
    primeira_impressao: false,
    perfil_verificado: false,
    ranking_premium: false,
    relatorios: "basico",
    destaque_nacional: false,
    selo_autoridade: false,
  },
  {
    id: "elite",
    nome: "Elite",
    preco: 129,
    matches_mensais: 999999,
    boosts_mensais: 5,
    pode_ver_quem_curtiu: true,
    chat_ilimitado: true,
    primeira_impressao: true,
    perfil_verificado: true,
    ranking_premium: true,
    relatorios: "completo",
    destaque_nacional: true,
    selo_autoridade: true,
  },
]

export function getPlan(id: string): PlanConfig {
  return PLANOS.find((p) => p.id === id) || PLANOS[0]
}

export function can(planId: string, feature: keyof PlanConfig): boolean {
  const plan = getPlan(planId)
  const val = plan[feature]
  if (typeof val === "number") return val > 0
  if (typeof val === "boolean") return val
  if (typeof val === "string") return val !== "none"
  return false
}

export const BOOST_OPTIONS = [
  { quantidade: 1, preco: 19, label: "1 Boost" },
  { quantidade: 5, preco: 69, label: "5 Boosts" },
  { quantidade: 10, preco: 119, label: "10 Boosts" },
]
