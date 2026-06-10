import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  // Send users who haven't finished signup onboarding to the wizard first.
  if (session.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingComplete: true },
    })
    if (dbUser && !dbUser.onboardingComplete) {
      redirect('/onboarding')
    }
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
