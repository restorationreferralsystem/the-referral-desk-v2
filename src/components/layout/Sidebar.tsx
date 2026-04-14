'use client'

import { NAV_ITEMS, APP_NAME, ROLE_DISPLAY_NAMES } from '@/lib/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Phone,
  Calendar,
  Gift,
  Users2,
  MessageCircle,
  BarChart3,
  Settings,
  Building2,
  Globe,
  Plus,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

// Icon name to component mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Phone: <Phone className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Users2: <Users2 className="w-5 h-5" />,
  MessageCircle: <MessageCircle className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Plus: <Plus className="w-5 h-5" />,
}

interface SidebarProps {
  session: any
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const user = session?.user
  const role = user?.role as keyof typeof NAV_ITEMS | undefined

  if (!role || !NAV_ITEMS[role]) {
    return null
  }

  const navItems = NAV_ITEMS[role]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white shadow-md border border-gray-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#1B4F72] text-white z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo/Branding */}
        <div className="p-6 border-b border-[#2E86C1]">
          <h1 className="text-xl font-bold">{APP_NAME}</h1>
          <p className="text-xs text-[#B0C4DE] mt-1">Restoration Referral System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-[#2E86C1] text-white'
                        : 'text-[#B0C4DE] hover:bg-[#2E86C1] hover:text-white'
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {ICON_MAP[item.icon] || <LayoutDashboard className="w-5 h-5" />}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#2E86C1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2E86C1] flex items-center justify-center flex-shrink-0">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-[#2E86C1] text-xs rounded font-medium">
                {ROLE_DISPLAY_NAMES[role]}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
