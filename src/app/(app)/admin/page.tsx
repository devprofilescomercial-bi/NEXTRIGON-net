import { Avatar, IconCheck, IconClose } from "@/components/ui";

const PENDING = [
  { id: "1", name: "Dra. Carla Mendes", area: "Direito Penal · OAB/SP 198432", initials: "CM", grad: ["#fb923c", "#ea580c"] as [string, string] },
  { id: "2", name: "Dr. Paulo Reis", area: "Tributário · OAB/RJ 88210", initials: "PR", grad: ["#60a5fa", "#2563eb"] as [string, string] },
  { id: "3", name: "Dra. Ana Lima", area: "Trabalhista · OAB/MG 45120", initials: "AL", grad: ["#34d399", "#059669"] as [string, string] },
];
const KPIS = [
  { label: "Verificações pendentes", value: "3" },
  { label: "Usuários ativos", value: "1.284" },
  { label: "Denúncias", value: "1" },
];

export default function AdminPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
      <div className="mb-4 mt-1">
        <h1 className="text-[22px] font-bold leading-tight">Administração</h1>
        <p className="text-sm text-muted">Governança da plataforma</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KPIS.map((k) => (
          <div key={k.label} className="glass rounded-2xl px-2 py-3.5 text-center">
            <div className="text-lg font-bold">{k.value}</div>
            <div className="mt-0.5 text-[10px] leading-tight text-muted">{k.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-muted">Verificações OAB pendentes</h2>
      <div className="flex flex-col gap-2.5">
        {PENDING.map((p) => (
          <div key={p.id} className="glass flex items-center gap-3 rounded-2xl p-3">
            <Avatar initials={p.initials} grad={p.grad} size={44} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{p.name}</div>
              <div className="truncate text-xs text-muted">{p.area}</div>
            </div>
            <button aria-label="Recusar" className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-danger">
              <IconClose className="h-4 w-4" />
            </button>
            <button aria-label="Aprovar" className="flex h-9 w-9 items-center justify-center rounded-xl bg-success text-white">
              <IconCheck className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
