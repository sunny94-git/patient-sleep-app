import BottomTabBar from '@/components/layout/BottomTabBar'
import InactivityGuard from '@/components/InactivityGuard'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <InactivityGuard redirectTo="/login" />
      <main className="flex-1 pb-[72px]">{children}</main>
      <BottomTabBar />
    </div>
  )
}
