import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar session={session} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto md:ml-64">
        {children}
      </main>
    </div>
  )
}
