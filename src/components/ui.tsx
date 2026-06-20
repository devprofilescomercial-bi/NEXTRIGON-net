"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ---------- icons (24px viewport, currentColor) ---------- */
type I = { className?: string };
export const IconHeart = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 21s-6.7-4.35-9.3-8.04C.9 10.3 1.6 6.9 4.6 5.7c2-.8 4 .1 5 1.7 1-1.6 3-2.5 5-1.7 3 1.2 3.7 4.6 1.9 7.26C18.7 16.65 12 21 12 21z" /></svg>
);
export const IconClose = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconStar = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 17.3l-6.16 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.48 4.73 1.64 7.03z" /></svg>
);
export const IconCheck = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 1.5l2.4 1.74 2.94-.27 1.2 2.7 2.7 1.2-.27 2.94L22.5 12l-1.83 2.46.27 2.94-2.7 1.2-1.2 2.7-2.94-.27L12 22.5l-2.46-1.83-2.94.27-1.2-2.7-2.7-1.2.27-2.94L1.5 12l1.74-2.46-.27-2.94 2.7-1.2 1.2-2.7 2.94.27z" /><path d="M8.6 12.2l2.2 2.2 4.6-4.6" fill="none" stroke="#070c18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconBolt = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12z" /></svg>
);
export const IconPin = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const IconBell = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 004 0" /></svg>
);
export const IconSliders = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>
);
export const IconHome = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 3.2l8 6.8v10a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1V10z" /></svg>
);
export const IconLayers = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 12l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3 16l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
);
export const IconChat = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H8l-4 4V5a1 1 0 011-1z" /></svg>
);
export const IconUser = ({ className }: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5z" /></svg>
);

/* ---------- atoms ---------- */
export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success ${className}`}>
      <IconCheck className="h-3.5 w-3.5" /> OAB verificada
    </span>
  );
}

export function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <IconStar className="h-4 w-4 text-gold" />
      <b className="font-semibold">{rating.toFixed(1).replace(".", ",")}</b>
      <span className="text-dim">({reviews})</span>
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-white/5 px-3 py-1 text-xs text-muted">
      {children}
    </span>
  );
}

export function Avatar({ initials, grad, size = 56 }: { initials: string; grad: [string, string]; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl font-bold text-white ring-hairline"
      style={{ width: size, height: size, fontSize: size * 0.34, background: `linear-gradient(140deg, ${grad[0]}, ${grad[1]})` }}
    >
      {initials}
    </span>
  );
}

/* ---------- header + bottom nav ---------- */
export function AppHeader({ title = "NEXTRIGON" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-5 pb-3 pt-4 backdrop-blur-md">
      <span className="brand-gradient glow-brand flex h-9 w-9 items-center justify-center rounded-xl text-white">
        <IconBolt className="h-5 w-5" />
      </span>
      <div className="mr-auto leading-none">
        <div className="text-[15px] font-bold tracking-[0.18em]">{title}</div>
        <div className="mt-1 text-[10px] font-medium tracking-[0.32em] text-dim">CONECTA · COLABORA</div>
      </div>
      <button className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
        <IconSliders className="h-5 w-5" />
      </button>
      <button className="glass-soft relative flex h-9 w-9 items-center justify-center rounded-xl text-muted">
        <IconBell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand" />
      </button>
    </header>
  );
}

const NAV = [
  { href: "/match", label: "Match", Icon: IconHeart },
  { href: "/projetos", label: "Projetos", Icon: IconLayers },
  { href: "/chat", label: "Chat", Icon: IconChat },
  { href: "/perfil", label: "Perfil", Icon: IconUser },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="glass z-30 flex shrink-0 items-center justify-around rounded-t-3xl px-2 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))]">
      {NAV.map(({ href, label, Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link key={href} href={href} className="flex flex-1 flex-col items-center gap-1 py-1">
            <span className={`flex h-9 w-12 items-center justify-center rounded-xl transition ${active ? "brand-gradient text-white glow-brand" : "text-dim"}`}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className={`text-[10px] font-medium ${active ? "text-ink" : "text-dim"}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
