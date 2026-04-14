import type { User as NextAuthUser } from 'next-auth'
import { USER_ROLES } from '@/lib/enums'

export type UserRole = (typeof USER_ROLES)[number]

/**
 * Extended User type with custom fields
 */
export interface ExtendedUser extends NextAuthUser {
  id: string
  role: UserRole
  companyId: string | null
  email: string
}

/**
 * Session user with extended fields
 */
export interface SessionUser extends ExtendedUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: UserRole
  companyId: string | null
}

/**
 * JWT token payload
 */
export interface JWTPayload {
  id: string
  email: string
  role: UserRole
  companyId: string | null
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
