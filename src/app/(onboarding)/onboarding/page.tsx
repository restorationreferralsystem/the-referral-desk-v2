import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingComplete: true,
      role: true,
      timezone: true,
      company: { select: { name: true, website: true, timezone: true } },
    },
  })

  // Already onboarded — nothing to do here.
  if (user?.onboardingComplete) {
    redirect('/dashboard')
  }

  return (
    <OnboardingWizard
      role={user?.role ?? session.user.role}
      companyName={user?.company?.name ?? ''}
      website={user?.company?.website ?? ''}
      timezone={user?.company?.timezone ?? user?.timezone ?? 'America/Chicago'}
    />
  )
}
