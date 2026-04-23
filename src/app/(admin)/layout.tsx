import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-gray-100"
      style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}
    >
      <AdminSidebar />
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
