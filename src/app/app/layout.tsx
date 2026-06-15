import BottomNav from "@/components/BottomNav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 80, minHeight: "100vh", backgroundColor: "#0f172a" }}>
      {children}
      <BottomNav />
    </div>
  )
}
