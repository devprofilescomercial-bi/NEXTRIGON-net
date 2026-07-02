"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";
import { useSession, signOut } from "@/lib/auth-client";

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 text-dim">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const PLANO_LABEL: Record<string, string> = { free: "Gratuito", pro: "Pro", elite: "Elite" };
const PLANO_COR: Record<string, string> = { free: "#6b7280", pro: "#fb923c", elite: "#a855f7" };
const PLANO_EMOJI: Record<string, string> = { free: "⚡", pro: "🚀", elite: "👑" };

type Stats = { likesRecebidos: number; likesSemana: number; matchesAtivos: number; swipesMes: number; plano: string };
type PlanInfo = { plano: string; planoExpiraEm: string | null };

export default function PerfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [stats, setStats] = useState<Stats | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [ganhos, setGanhos] = useState({ conexoes: 8, parcerias: 3, honorarios: 12500, oportunidades: 14, estimativa: 28000 });

  useEffect(() => {
    fetch("/api/monetizacao/stats", { credentials: "include" }).then(r => r.ok ? r.json() : null).then(setStats).catch(() => {});
    fetch("/api/perfil/plano", { credentials: "include" }).then(r => r.ok ? r.json() : null).then(setPlanInfo).catch(() => {});
  }, []);

  const plano = planInfo?.plano ?? "free";
  const isPaid = plano === "pro" || plano === "elite";

  const MENU = [
    { label: "Editar perfil", href: "/perfil/editar" },
    { label: "Verificação OAB", href: "/verificacao" },
    { label: "Carteira e plano", href: "/perfil/carteira" },
    { label: "Oportunidades recebidas", href: "/oportunidades" },
    { label: "Ranking e conquistas", href: "/ranking" },
    { label: "Privacidade e dados (LGPD)", href: "/perfil/privacidade" },
  ];

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  const name = user?.name || "Usuário";
  const inits = initials(name);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
      {/* Avatar + nome */}
      <div className="mt-1 flex flex-col items-center text-center">
        {user?.image ? (
          <img src={user.image} alt={name} className="h-[88px] w-[88px] rounded-2xl object-cover ring-2 ring-brand/30" />
        ) : (
          <Avatar initials={inits} grad={["#fb923c", "#ea580c"]} size={88} />
        )}
        <h1 className="mt-3 text-xl font-bold">{name}</h1>
        <p className="text-sm text-muted">{user?.email}</p>

        {/* Plan badge */}
        <button
          onClick={() => router.push("/perfil/carteira")}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: `${PLANO_COR[plano]}20`, color: PLANO_COR[plano] }}
        >
          {PLANO_EMOJI[plano]} Plano {PLANO_LABEL[plano]}
          {plano === "free" && <span className="opacity-70">· Fazer upgrade</span>}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Oportunidades", value: stats ? String(stats.likesRecebidos) : "—" },
          { label: "Matches ativos", value: stats ? String(stats.matchesAtivos) : "—" },
          { label: "Esta semana", value: stats ? String(stats.likesSemana) : "—" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl px-2 py-3.5 text-center">
            <div className="text-lg font-bold">{s.value}</div>
            <div className="mt-0.5 text-[11px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calculadora de Ganhos */}
      <div className="mt-4 glass rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">Calculadora de Ganhos</p>
            <p className="text-[11px] text-dim">Resultados estimados este mês</p>
          </div>
          <span className="text-xl">💰</span>
        </div>

        {isPaid ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Conexões feitas</span>
              <span className="text-sm font-bold">{ganhos.conexoes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Parcerias fechadas</span>
              <span className="text-sm font-bold text-success">{ganhos.parcerias}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Oportunidades recebidas</span>
              <span className="text-sm font-bold">{ganhos.oportunidades}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-line flex justify-between items-center">
              <span className="text-xs font-semibold text-muted">Honorários gerados</span>
              <span className="text-base font-black text-success">
                R$ {ganhos.honorarios.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted">Em negociação</span>
              <span className="text-sm font-bold text-brand">
                R$ {ganhos.estimativa.toLocaleString("pt-BR")}
              </span>
            </div>
            <p className="text-center text-[11px] text-dim pt-1">
              Você investiu R$ {plano === "pro" ? "49" : "129"}/mês e gerou R$ {ganhos.honorarios.toLocaleString("pt-BR")} em resultados
            </p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-muted mb-3">
              Acompanhe suas conexões, parcerias fechadas e honorários gerados pela plataforma.
            </p>
            <div className="flex justify-center gap-4 mb-3 opacity-50 select-none blur-sm pointer-events-none">
              <div className="text-center">
                <div className="text-lg font-black">8</div>
                <div className="text-[11px] text-muted">Conexões</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-success">3</div>
                <div className="text-[11px] text-muted">Parcerias</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-success">R$ 12.500</div>
                <div className="text-[11px] text-muted">Honorários</div>
              </div>
            </div>
            <button
              onClick={() => router.push("/perfil/carteira")}
              className="brand-gradient glow-brand w-full rounded-2xl py-2.5 text-sm font-semibold text-white"
            >
              Desbloquear com Plano Pro
            </button>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="mt-5 flex flex-col gap-1.5">
        {MENU.map((m) => (
          <Link key={m.label} href={m.href} className="glass-soft flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium">
            {m.label}
            <Chevron />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-4 rounded-2xl border border-danger/30 py-3 text-center text-sm font-semibold text-danger"
      >
        Sair da conta
      </button>
    </section>
  );
}
