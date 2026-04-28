import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: role } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  if (role?.role !== 'admin') {
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-bg-secondary">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
