import { auth } from './auth'
import { USER_ROLES } from './enums'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

type UserRole = (typeof USER_ROLES)[number]

/**
 * Require authentication for API routes
 * Returns { session, response: null } on success
 * Returns { session: null, response: NextResponse } on error
 */
export async function requireAuth() {
  const session = await auth()

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { session, response: null }
}

/**
 * Require specific roles for API routes
 * Returns { session, response: null } on success
 * Returns { session: null, response: NextResponse } on error
 */
export async function requireRole(...roles: UserRole[]) {
  const session = await auth()

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  if (!roles.includes(session.user.role)) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { session, response: null }
}

/**
 * Require authentication for server components
 * Redirects to signin if not authenticated
 */
export async function getRequiredSession() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return session
}

/**
 * Require specific roles for server components
 * Redirects to home if user lacks required role
 */
export async function getRequiredRole(...roles: UserRole[]) {
  const session = await getRequiredSession()

  if (!roles.includes(session.user.role)) {
    redirect('/')
  }

  return session
}
