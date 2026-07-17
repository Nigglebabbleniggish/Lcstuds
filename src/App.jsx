import { useState } from 'react'
import { 
  Users, 
  ShieldCheck, 
  Share2, 
  LayoutDashboard, 
  Menu, 
  X,
  LogOut,
  TrendingUp,
  DollarSign,
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Affiliates from './components/Affiliates'
import Verifier from './components/Verifier'
import SocialMedia from './components/SocialMedia'
import Dashboard from './components/Dashboard'
import Auth from './components/Auth'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user, profile, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page if not logged in
  if (!user) {
    if (showAuth) {
      return <Auth onBack={() => setShowAuth(false)} />
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary-600" size={32} />
                <span className="text-2xl font-bold text-gray-900">Affiliate Hub</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Start Earning Today
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our affiliate program and earn commissions by promoting products you love. Simple signup, great rewards, and real-time tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors border border-gray-300">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Why Choose Our Affiliate Program?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">High Commissions</h3>
                <p className="text-gray-600">Earn up to 30% commission on every sale you generate.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Payouts</h3>
                <p className="text-gray-600">Get paid monthly with no minimum withdrawal limit.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Tracking</h3>
                <p className="text-gray-600">Real-time dashboard to track your earnings and performance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of affiliates who are already earning with our program.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors"
            >
              Create Your Free Account
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400">
              © 2024 Affiliate Hub. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'affiliates', label: 'Affiliates', icon: Users },
    { id: 'verifier', label: 'Verifier', icon: ShieldCheck },
    { id: 'social', label: 'Social Media', icon: Share2 },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'affiliates':
        return <Affiliates />
      case 'verifier':
        return <Verifier />
      case 'social':
        return <SocialMedia />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600 mb-8">
            Affiliate Hub
          </h1>
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{profile?.full_name || user?.email}</p>
              <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold">
                {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={signOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-600"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App
