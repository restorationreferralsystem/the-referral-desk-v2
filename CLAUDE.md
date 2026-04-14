# The Referral Desk

Multi-tenant SaaS platform for restoration contractors to manage insurance agent relationships, powered by the Restoration Referral System (RRS) methodology.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL via Supabase, managed with Prisma ORM
- **Auth:** NextAuth v5 with Google OAuth (invitation-gated signups)
- **SMS:** Twilio (referral confirmation notifications)
- **Payments:** Stripe (credit purchases, subscription billing)
- **AI:** Claude API (call insights, agent research)
- **Charts:** Recharts
- **Maps:** Google Maps JavaScript API
- **Icons:** Lucide React

## Project Structure
```
src/
├── app/
│   ├── (public)/      # No auth required: landing, signin, referral confirmation, agent portal
│   ├── (dashboard)/   # Auth required: all app features behind sidebar layout
│   └── api/           # API routes
├── components/
│   ├── layout/        # Sidebar, TopBar
│   └── ui/            # Reusable primitives
├── lib/
│   ├── auth.ts        # NextAuth config
│   ├── prisma.ts      # Prisma client singleton
│   ├── rbac.ts        # Role-based access control helpers
│   ├── validation.ts  # Zod schemas
│   ├── constants.ts   # App constants, nav items, plans
│   └── enums.ts       # Enum definitions
├── middleware.ts       # Auth middleware (public vs protected routes)
└── types/             # TypeScript types + NextAuth augmentation
```

## Key Concepts

### Roles
- MASTER_ADMIN: Matt/RRS staff — sees all companies, agents, ecosystem analytics
- COMPANY_ADMIN: Contractor company owner — manages team, agents, company settings
- SALES_REP: Business developer — manages their agent pipeline and calls
- AGENT: Insurance agent — portal access for referral status (no customer PII)

### Multi-Tenancy
All data is scoped by `companyId`. Agents, referrals, calls, appointments all belong to a company. MASTER_ADMIN can see across all companies.

### Credit System
Credits are ONLY for agent discovery. All CRM, pipeline, call scripts, and tracking features are FREE.
- Free: 25 credits/month
- Professional ($49): 100 credits/month
- Enterprise ($149): 500 credits/month

### RRS Methodology (CRITICAL)
ALL AI features must follow the RRS methodology. Never suggest generic sales tactics:
- Phone call first (NEVER drop-bys, email-first, or gifts)
- Lead with offering new customers (not asking for referrals)
- Three Pathways: Organic > Past Client > Cold
- Goal is a 20-30 minute meeting
- Use the Two Essential Questions

### No Customer PII
The Referral model tracks referrals with reference codes only — no customer names, emails, or addresses are stored.

## Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## Environment Variables
See `.env.example` for the full list. Key ones:
- DATABASE_URL / DIRECT_URL — Supabase connection strings
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET — OAuth
- TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER — SMS
- STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET — Billing
