import { AppHeader, BottomNav } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex h-svh w-full max-w-[440px] flex-col overflow-hidden">
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col px-5">{children}</main>
      <BottomNav />
    </div>
  );
}
