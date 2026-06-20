import Link from "next/link";
import { Avatar, Stars, Tag, VerifiedBadge, IconPin } from "@/components/ui";

const STATS = [
  { label: "Nota geral", value: "4,9" },
  { label: "Projetos", value: "32" },
  { label: "Resposta", value: "96%" },
];
const MENU = [
  { label: "Editar perfil", href: "#" },
  { label: "Verificação OAB", href: "/verificacao" },
  { label: "Carteira e créditos", href: "#" },
  { label: "Indicações", href: "#" },
  { label: "Privacidade e dados (LGPD)", href: "#" },
];

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 text-dim">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function PerfilPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
      <div className="mt-1 flex flex-col items-center text-center">
        <Avatar initials="JF" grad={["#fb923c", "#ea580c"]} size={88} />
        <h1 className="mt-3 text-xl font-bold">Dr. Júlio Fernandez</h1>
        <p className="font-semibold text-brand">Direito Empresarial</p>
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
          <IconPin className="h-4 w-4 text-dim" /> São Paulo · SP
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Stars rating={4.9} reviews={32} />
          <VerifiedBadge />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="glass rounded-2xl px-2 py-3.5 text-center">
            <div className="text-lg font-bold">{s.value}</div>
            <div className="mt-0.5 text-[11px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-muted">Áreas de atuação</h2>
      <div className="flex flex-wrap gap-2">
        {["Societário", "Contratos", "M&A", "Compliance", "Recuperação Judicial"].map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-1.5">
        {MENU.map((m) => (
          <Link key={m.label} href={m.href} className="glass-soft flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium">
            {m.label}
            <Chevron />
          </Link>
        ))}
      </div>

      <Link href="/login" className="mt-4 rounded-2xl border border-line py-3 text-center text-sm font-semibold text-danger">
        Sair da conta
      </Link>
    </section>
  );
}
