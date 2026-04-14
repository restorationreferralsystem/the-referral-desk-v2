import { PLANS, APP_NAME } from '@/lib/constants'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    title: 'Agent CRM',
    description: 'Manage your entire agent network in one place with detailed profiles and relationship tracking.',
  },
  {
    title: 'Pipeline Tracking',
    description: 'Visualize agent relationships through customizable pipeline stages from prospect to top producer.',
  },
  {
    title: 'AI Call Companion',
    description: 'Get AI-powered insights during calls with real-time coaching based on RRS methodology.',
  },
  {
    title: 'Google Calendar Sync',
    description: 'Seamlessly integrate with Google Calendar for appointment scheduling and reminders.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B4F72]">{APP_NAME}</h1>
          <Link
            href="/auth/signin"
            className="px-6 py-2 bg-[#1B4F72] text-white rounded-lg font-medium hover:bg-[#2E86C1] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Agent Relationship CRM
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Powered by the Restoration Referral System — build stronger agent relationships and grow your referral network with proven methodology and cutting-edge technology
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E67E22] text-white rounded-lg font-semibold hover:bg-[#D35400] transition-colors text-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-[#F8FAFB]">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-[#E67E22] rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Choose Your Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg p-8 border-2 transition-all ${
                  plan.id === 'professional'
                    ? 'border-[#E67E22] bg-[#FFF8F3] shadow-lg transform md:scale-105'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  {plan.credits} credits included
                </p>
                <Link
                  href="/auth/signin"
                  className={`block text-center py-3 rounded-lg font-semibold mb-8 transition-colors ${
                    plan.id === 'professional'
                      ? 'bg-[#E67E22] text-white hover:bg-[#D35400]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C3E50] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-semibold mb-4">{APP_NAME}</h5>
              <p className="text-gray-300 text-sm">
                Build stronger agent relationships and grow your referral network.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
            <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
