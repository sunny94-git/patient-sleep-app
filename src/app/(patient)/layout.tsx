import BottomTabBar from '@/components/layout/BottomTabBar'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <main className="flex-1 pb-[72px]">{children}</main>
      <BottomTabBar />
    </div>
  )
}
