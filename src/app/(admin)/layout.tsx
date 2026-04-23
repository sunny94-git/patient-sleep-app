import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
