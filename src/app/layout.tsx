import type { Metadata } from 'next'
import './globals.css'

// Commenting out Google Fonts due to build environment restrictions
// import { Inter } from 'next/font/google'
// const inter = Inter({
//   subsets: ['latin'],
//   variable: '--font-inter',
// })

export const metadata: Metadata = {
  title: 'The Referral Desk',
  description:
    'Restoration Referral System — Your Agent Relationship CRM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{children}</body>
    </html>
  )
}
