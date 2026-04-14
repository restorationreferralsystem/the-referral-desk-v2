import NextAuth, { type NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import { USER_ROLES } from './enums'

type UserRole = (typeof USER_ROLES)[number]

const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          scope: 'openid profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      // Check if user's email matches a pending invitation
      if (!user.email) {
        return false
      }

      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        return true
      }

      // Check if there's a pending invitation for this email
      const invitation = await prisma.invitation.findFirst({
        where: {
          email: user.email,
          acceptedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      })

      if (invitation) {
        return true
      }

      // No invitation found and user doesn't exist
      return '/auth/error?error=no-invitation'
    },

    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
      }

      // Populate user data from database
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            email: true,
            role: true,
            companyId: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.companyId = dbUser.companyId
          token.email = dbUser.email

          // If companyId is null, check again (allows dynamic assignment)
          if (!token.companyId) {
            const updatedUser = await prisma.user.findUnique({
              where: { id: dbUser.id },
              select: { companyId: true },
            })
            token.companyId = updatedUser?.companyId || null
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.companyId = token.companyId as string | null
        session.user.email = token.email as string
      }

      return session
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        // Mark invitation as accepted if it exists
        await prisma.invitation.updateMany({
          where: {
            email: user.email,
            acceptedAt: null,
          },
          data: {
            acceptedAt: new Date(),
          },
        })

        // Assign user to company from invitation
        const invitation = await prisma.invitation.findFirst({
          where: {
            email: user.email,
          },
          select: {
            companyId: true,
            role: true,
          },
        })

        if (invitation) {
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              companyId: invitation.companyId,
              role: invitation.role,
            },
          })
        }
      }
    },
  },
} as const satisfies NextAuthConfig

// @ts-ignore - NextAuth typing issue with ProviderId
const nextAuthExports = NextAuth(authConfig)

export const auth: any = nextAuthExports.auth
export const signIn: any = nextAuthExports.signIn
export const signOut: any = nextAuthExports.signOut
export const handlers: any = nextAuthExports.handlers
