"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader, BottomNav } from "@/components/ui";
import { useSession } from "@/lib/auth-client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="relative mx-auto flex h-svh w-full max-w-[440px] flex-col overflow-hidden">
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col px-5">{children}</main>
      <BottomNav />
    </div>
  );
}
