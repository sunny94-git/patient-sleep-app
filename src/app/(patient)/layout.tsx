import { BottomTabBar } from "@/components/layout/BottomTabBar";
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg-secondary">
      <main className="pb-[calc(56px+env(safe-area-inset-bottom))]">{children}</main>
      <BottomTabBar />
    </div>
  );
}
