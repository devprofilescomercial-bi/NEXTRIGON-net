"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Stars, Tag, VerifiedBadge, IconPin } from "@/components/ui";
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

export default function PerfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  const MENU = [
    { label: "Editar perfil", href: "/perfil/editar" },
    { label: "Verificação OAB", href: "/verificacao" },
    { label: "Carteira e créditos", href: "/perfil/carteira" },
    { label: "Indicações", href: "/perfil/indicacoes" },
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
        <Avatar initials={inits} grad={["#fb923c", "#ea580c"]} size={88} />
        <h1 className="mt-3 text-xl font-bold">{name}</h1>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Nota geral", value: "—" },
          { label: "Projetos", value: "0" },
          { label: "Resposta", value: "—" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl px-2 py-3.5 text-center">
            <div className="text-lg font-bold">{s.value}</div>
            <div className="mt-0.5 text-[11px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="mt-6 flex flex-col gap-1.5">
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
