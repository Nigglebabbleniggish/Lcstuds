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
  CheckCircle,
  Settings
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
  const [authMode, setAuthMode] = useState('login')
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState('dark')

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
      return <Auth onBack={() => setShowAuth(false)} initialMode={authMode} />
    }

    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
        {/* Navigation */}
        <nav className={`${theme === 'dark' ? 'bg-gray-900/80 backdrop-blur-xl border-gray-800' : 'bg-white/80 backdrop-blur-xl border-gray-200'} border-b sticky top-0 z-50`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <TrendingUp className={theme === 'dark' ? 'text-primary-400' : 'text-primary-600'} size={32} />
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Lc Studio</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                  title="Settings"
                >
                  <Settings size={20} />
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuth(true)
                  }}
                  className={`px-4 py-2 font-medium transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-primary-400' : 'text-gray-700 hover:text-primary-600'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuth(true)
                  }}
                  className={`px-4 py-2 font-medium transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-primary-400' : 'text-gray-700 hover:text-primary-600'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup')
                    setShowAuth(true)
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>

              {showSettings && (
                <div className={`absolute top-16 right-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-lg shadow-xl p-4 z-50 w-64`}>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Theme</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTheme('dark')}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                            theme === 'dark'
                              ? 'border-primary-500 bg-primary-900/30 text-primary-400'
                              : 'border-gray-300 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          Dark
                        </button>
                        <button
                          onClick={() => setTheme('light')}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                            theme === 'light'
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-300 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          Light
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className={`text-6xl md:text-8xl font-bold mb-6 slide-in ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              Latest Trending
            </h1>
            <h1 className={`text-6xl md:text-8xl font-bold mb-8 slide-in-delay-1 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500`}>
              Streamer Clips
            </h1>
            <p className={`text-2xl mb-12 max-w-3xl mx-auto slide-in-delay-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover and share the best moments from your favorite streamers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center slide-in-delay-2">
              <button
                onClick={() => setShowAuth(true)}
                className="px-10 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Clipping
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8">
                <div className={`text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>$600K+</div>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Paid to Clippers</p>
              </div>
              <div className="text-center p-8">
                <div className={`text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>10K+</div>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Active Clippers</p>
              </div>
              <div className="text-center p-8">
                <div className={`text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>1M+</div>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Clips Created</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              Start Earning Today
            </h2>
            <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of clippers earning money from streamer content
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
        <footer className="bg-gray-950 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400">
              © 2024 Lc Studio. All rights reserved.
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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex`}>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r z-50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-6">
          <h1 className={`text-2xl font-bold mb-8 ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>
            Lc Studio
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
                      ? theme === 'dark' ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-700'
                      : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
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
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <div className="text-right">
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{profile?.full_name || user?.email}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{profile?.email || user?.email}</p>
            </div>
            <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-primary-900/30' : 'bg-primary-100'} rounded-full flex items-center justify-center`}>
              <span className={`${theme === 'dark' ? 'text-primary-400' : 'text-primary-700'} font-semibold`}>
                {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={signOut}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'}`}
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>

          {showSettings && (
            <div className={`absolute top-16 right-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg p-4 z-50 w-64`}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Theme</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                        theme === 'dark'
                          ? 'border-primary-500 bg-primary-900/30 text-primary-400'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                        theme === 'light'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
