import type { DefaultSession } from 'next-auth'
import { USER_ROLES } from '@/lib/enums'

type UserRole = (typeof USER_ROLES)[number]

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      companyId: string | null
      email: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role?: UserRole
    companyId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    role: UserRole
    companyId: string | null
  }
}
