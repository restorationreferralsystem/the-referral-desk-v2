import { auth } from '@/lib/auth'
import { TopBar } from '@/components/layout/TopBar'
import { ROLE_DISPLAY_NAMES } from '@/lib/constants'
import { Activity, Users, TrendingUp, Gift } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  const user = session.user

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Dashboard" user={user} />

      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name || user.email}
            </h2>
            <p className="text-gray-600 mt-2">
              {user.companyId ? 'Here is your company dashboard.' : 'System overview.'}
              {user.role && (
                <span className="ml-4 inline-block px-3 py-1 bg-[#2E86C1] text-white text-sm rounded-full">
                  {ROLE_DISPLAY_NAMES[user.role as keyof typeof ROLE_DISPLAY_NAMES]}
                </span>
              )}
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Agents */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#1B4F72]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Agents</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">—</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <Users className="w-6 h-6 text-[#1B4F72]" />
                </div>
              </div>
            </div>

            {/* Active Pipeline */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#E67E22]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Pipeline</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">—</p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[#E67E22]" />
                </div>
              </div>
            </div>

            {/* Calls This Week */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#27AE60]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Calls This Week</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">—</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <Activity className="w-6 h-6 text-[#27AE60]" />
                </div>
              </div>
            </div>

            {/* Referrals This Month */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#2E86C1]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Referrals This Month</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">—</p>
                </div>
                <div className="bg-indigo-100 p-4 rounded-lg">
                  <Gift className="w-6 h-6 text-[#2E86C1]" />
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific content */}
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <p className="text-gray-600">
              {user.role === 'MASTER_ADMIN'
                ? 'As a Master Admin, you have access to manage all companies and users in the system. Start by reviewing your ecosystem or managing company accounts.'
                : user.role === 'COMPANY_ADMIN'
                  ? 'As a Company Admin, you can manage your team, track agents, and view analytics. Start by adding agents or inviting team members.'
                  : user.role === 'SALES_REP' || user.role === undefined
                    ? 'Start by adding agents to your pipeline, logging calls, and scheduling appointments to build your referral network.'
                    : 'You can submit referrals and view the referrals sent to you. Start by submitting your first referral.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
