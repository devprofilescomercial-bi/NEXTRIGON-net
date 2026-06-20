import { IconLayers, IconUser } from "@/components/ui";

const PROJECTS = [
  { id: "1", title: "Estrutura jurídica para startup", sub: "Societário · Contrato e acordo de sócios", progress: 75, people: 5, status: "Em andamento" },
  { id: "2", title: "Ação Civil — plano de saúde", sub: "Consumidor · Tutela de urgência", progress: 40, people: 3, status: "Em andamento" },
  { id: "3", title: "Defesa Criminal — Inquérito 4587/24", sub: "Penal · Fase de instrução", progress: 20, people: 2, status: "Início" },
  { id: "4", title: "Consultoria Empresarial", sub: "Contratos e compliance", progress: 100, people: 4, status: "Concluído" },
];

export default function ProjetosPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 mt-1 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold leading-tight">Projetos</h1>
          <p className="text-sm text-muted">Acompanhe o andamento de cada caso</p>
        </div>
        <button className="brand-gradient glow-brand flex h-10 w-10 items-center justify-center rounded-xl text-2xl leading-none text-white">+</button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {PROJECTS.map((p) => {
          const done = p.progress === 100;
          return (
            <article key={p.id} className="glass rounded-3xl p-4">
              <div className="flex items-start gap-3">
                <span className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
                  <IconLayers className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{p.title}</h2>
                  <p className="truncate text-xs text-muted">{p.sub}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${done ? "bg-success/15 text-success" : "bg-brand/15 text-brand"}`}>{p.status}</span>
              </div>

              <div className="mt-3.5 flex items-center justify-between text-xs">
                <span className="text-dim">Progresso</span>
                <span className="font-semibold text-ink">{p.progress}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className={`h-full rounded-full ${done ? "bg-success" : "brand-gradient"}`} style={{ width: `${p.progress}%` }} />
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-dim">
                <IconUser className="h-3.5 w-3.5" /> {p.people} participantes
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
