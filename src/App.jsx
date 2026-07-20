import { useState, useEffect } from 'react'
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
  Settings,
  MessageCircle,
  Shield,
  Briefcase,
  FileText,
  Target,
  Bell,
  Film
} from 'lucide-react'
import Affiliates from './components/Affiliates'
import Verifier from './components/Verifier'
import SocialMedia from './components/SocialMedia'
import Dashboard from './components/Dashboard'
import SecurityManagement from './components/SecurityManagement'
import Support from './components/Support'
import SupportManagement from './components/SupportManagement'
import SubmissionsManagement from './components/SubmissionsManagement'
import Earnings from './components/Earnings'
import YourClips from './components/YourClips'
import ClipsManagement from './components/ClipsManagement'
import Auth from './components/Auth'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'

function App() {
  const { user, profile, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [showSettings, setShowSettings] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [isBanned, setIsBanned] = useState(new URLSearchParams(window.location.search).get('banned') === 'true')
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (user && profile && !profile.id.startsWith('local_')) {
      fetchNotifications()
    }
  }, [user, profile])

  const fetchNotifications = async () => {
    try {
      // Fetch campaign applications (affiliate submissions)
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('affiliates')
        .select('*, content_rewards(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      // Fetch video submissions
      const { data: videoData, error: videoError } = await supabase
        .from('video_submissions')
        .select('*, content_rewards(*)')
        .eq('user_id', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(10)
      
      if (submissionsError) throw submissionsError
      if (videoError) throw videoError
      
      // Combine both types of notifications
      const allNotifications = [
        ...(submissionsData || []).map(s => ({
          ...s,
          type: 'campaign_application',
          title: s.content_rewards?.title || 'Campaign Application',
          status: s.status,
          created_at: s.created_at
        })),
        ...(videoData || []).map(v => ({
          ...v,
          type: 'video_submission',
          title: `Video - ${v.platform}`,
          status: v.status,
          created_at: v.submitted_at
        }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      setNotifications(allNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  if (isBanned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Account Suspended</h1>
          <p className="text-gray-300 mb-6">Your account has been suspended by an administrator. If you believe this is an error, please contact support.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const renderLandingPage = () => {
    return (
      <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800 border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Always go to landing page, logged in state will be shown there
                    setActiveTab('landing')
                  }}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="text-white" size={32} />
                  <span className="text-2xl font-bold text-white">LC Studio</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://discord.gg/XNYAM5CsMk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:bg-zinc-800 text-indigo-400"
                  title="Discord Server"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Logged in as</span>
                    <span className="text-sm text-white font-medium">{profile?.full_name || user?.email}</span>
                    <button
                      onClick={async () => {
                        try {
                          await signOut()
                          window.location.reload()
                        } catch (error) {
                          console.error('Logout error:', error)
                        }
                      }}
                      className="px-4 py-2 font-medium transition-colors text-gray-400 hover:text-white"
                    >
                      Sign Out
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 rounded-lg transition-colors hover:bg-zinc-800 text-gray-400"
                      title="Settings"
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('login')
                        setShowAuth(true)
                      }}
                      className="px-4 py-2 font-medium transition-colors text-gray-400 hover:text-white"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('login')
                        setShowAuth(true)
                      }}
                      className="px-4 py-2 font-medium transition-colors text-gray-400 hover:text-white"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('signup')
                        setShowAuth(true)
                      }}
                      className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>

              {showSettings && (
                <div className="absolute top-16 right-4 bg-zinc-900 border-zinc-800 border rounded-lg shadow-xl p-4 z-50 w-64">
                  <h3 className="font-semibold mb-3 text-white">Settings</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowSettings(false)
                        setShowRules(true)
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors"
                    >
                      Terms of Service
                    </button>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-400">Theme</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTheme('dark')}
                          className="flex-1 py-2 px-3 rounded-lg border-2 transition-colors border-white bg-white/10 text-white"
                        >
                          Dark
                        </button>
                        <button
                          onClick={() => setTheme('light')}
                          className="flex-1 py-2 px-3 rounded-lg border-2 transition-colors border-zinc-600 text-gray-400 hover:border-zinc-500"
                        >
                          Light
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showRules && (
                <div className="absolute top-16 right-4 bg-zinc-900 border-zinc-800 border rounded-lg shadow-xl p-6 z-50 w-96 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Terms of Service</h3>
                    <button
                      onClick={() => setShowRules(false)}
                      className="p-1 rounded hover:bg-zinc-800 text-gray-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-4 text-sm text-gray-400">
                    <div>
                      <h4 className="font-medium text-white mb-2">1. Account Usage</h4>
                      <p>Users must be at least 13 years old. Each user is allowed one account only.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">2. Content Guidelines</h4>
                      <p>All submitted content must comply with community standards. No hate speech, harassment, or illegal content.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">3. Payment Terms</h4>
                      <p>Payments are processed within 30 days of campaign completion. Minimum payout is $10.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">4. Prohibited Activities</h4>
                      <p>Bot usage, fake engagement, and fraudulent activities are strictly prohibited and will result in immediate banning.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">5. Privacy</h4>
                      <p>Your data is protected according to our privacy policy. We do not sell your personal information.</p>
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
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
              LC Studio
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-400">
              Creator Management Platform
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-500">
              Manage campaigns, track performance, and grow your creator business all in one place.
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setAuthMode('signup')
                    setShowAuth(true)
                  }}
                  className="px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuth(true)
                  }}
                  className="px-8 py-4 bg-zinc-900 text-white rounded-xl font-semibold text-lg border border-zinc-800 hover:bg-zinc-800 transition-all"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Everything You Need</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="text-green-400" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Earn Crypto</h4>
                <p className="text-gray-400">Get paid in USDT/USDC for completing campaigns and growing your audience.</p>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Target className="text-blue-400" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Campaign Management</h4>
                <p className="text-gray-400">Apply to campaigns, track progress, and manage your content all in one dashboard.</p>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Analytics</h4>
                <p className="text-gray-400">Track your earnings, views, and campaign performance with detailed analytics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8">
                <div className="text-5xl font-bold mb-2 text-white">$600K+</div>
                <p className="text-xl text-gray-400">Paid to Creators</p>
              </div>
              <div className="text-center p-8">
                <div className="text-5xl font-bold mb-2 text-white">5K+</div>
                <p className="text-xl text-gray-400">Campaigns Completed</p>
              </div>
              <div className="text-center p-8">
                <div className="text-5xl font-bold mb-2 text-white">1M+</div>
                <p className="text-xl text-gray-400">Total Views</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Start Earning Today
            </h2>
            <p className="text-xl mb-8 text-gray-400">
              Join thousands of creators earning crypto through campaigns
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              Create Your Free Account
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-zinc-950 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-500">
              © 2024 LC Studio. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  // Show landing page if not logged in
  if (!user) {
    if (showAuth) {
      return <Auth onBack={() => setShowAuth(false)} initialMode={authMode} />
    }

    return renderLandingPage()
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'affiliates', label: 'Campaign', icon: Users },
    { id: 'verifier', label: 'Accounts', icon: ShieldCheck },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'support', label: 'Support', icon: MessageCircle },
  ]

  // Admin-only tabs
  const adminTabs = [
    { id: 'admin-clips', label: 'Clips Management', icon: Film },
    { id: 'admin-security', label: 'Security Admin Layer', icon: Shield },
    { id: 'admin-support', label: 'Support Management', icon: MessageCircle },
    { id: 'admin-submissions', label: 'Submissions', icon: FileText },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return renderLandingPage()
      case 'dashboard':
        return <Dashboard />
      case 'affiliates':
        return <Affiliates />
      case 'verifier':
        return <Verifier />
      case 'earnings':
        return <Earnings />
      case 'support':
        return <Support />
      case 'admin-clips':
        if (profile?.is_admin) {
          return <ClipsManagement />
        }
        return <Dashboard />
      case 'admin-security':
        if (profile?.is_admin) {
          return <SecurityManagement />
        }
        return <Dashboard />
      case 'admin-support':
        if (profile?.is_admin) {
          return <SupportManagement />
        }
        return <Dashboard />
      case 'admin-submissions':
        if (profile?.is_admin) {
          return <SubmissionsManagement />
        }
        return <Dashboard />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full bg-zinc-900/90 backdrop-blur border-zinc-800 border-r z-50 transition-all duration-300 w-64"
      >
        <div className="p-6">
          <button
            onClick={() => setActiveTab('landing')}
            className="text-2xl font-bold mb-8 text-white hover:text-gray-300 transition-colors"
          >
            LC Studio
          </button>
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-zinc-800'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
            {/* Admin-only tabs */}
            {profile?.is_admin && (
              <>
                <div className="border-t border-zinc-800 my-4"></div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">Admin</p>
                {adminTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-red-500/10 text-red-400'
                          : 'text-gray-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Icon size={20} />
                      {tab.label}
                    </button>
                  )
                })}
              </>
            )}
            {/* Debug: Show profile status */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-2 bg-zinc-800 rounded text-xs">
                <p className="text-gray-400">Profile: {profile ? 'loaded' : 'not loaded'}</p>
                <p className="text-gray-400">Is Admin: {profile?.is_admin ? 'yes' : 'no'}</p>
                <p className="text-gray-400">User ID: {user?.id?.slice(0, 8)}...</p>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-zinc-900/90 backdrop-blur border-zinc-800 border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg/XNYAM5CsMk"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-colors hover:bg-zinc-800 text-indigo-400"
              title="Discord Server"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg transition-colors hover:bg-zinc-800 text-gray-400"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg transition-colors hover:bg-zinc-800 text-gray-400 relative"
              title="Notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <div className="text-right">
              <p className="font-medium text-white">{profile?.full_name || user?.email}</p>
              <p className="text-sm text-gray-400">{profile?.email || user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="p-2 rounded-lg transition-colors hover:bg-zinc-800 text-gray-400"
              title="Rules / TOS"
            >
              <CheckCircle size={20} />
            </button>
            <button
              onClick={async () => {
                try {
                  await signOut()
                  window.location.reload()
                } catch (error) {
                  console.error('Logout error:', error)
                }
              }}
              className="p-2 rounded-lg transition-colors hover:bg-zinc-800 text-gray-400 hover:text-red-400"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>

          {showSettings && (
            <div className="absolute top-16 right-6 bg-zinc-900 border-zinc-800 border rounded-lg shadow-lg p-4 z-50 w-64">
              <h3 className="font-semibold mb-3 text-white">Settings</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSettings(false)
                    setShowRules(true)
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Theme</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTheme('dark')
                        document.documentElement.classList.remove('light')
                        document.documentElement.classList.add('dark')
                      }}
                      className="flex-1 py-2 px-3 rounded-lg border-2 transition-colors border-white bg-white/10 text-white"
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => {
                        setTheme('light')
                        document.documentElement.classList.remove('dark')
                        document.documentElement.classList.add('light')
                      }}
                      className="flex-1 py-2 px-3 rounded-lg border-2 transition-colors border-zinc-600 text-gray-400 hover:border-zinc-500"
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showNotifications && (
            <div className="absolute top-16 right-6 bg-zinc-900 border-2 border-zinc-700 rounded-lg shadow-lg p-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded hover:bg-zinc-800 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-zinc-700 rounded-lg">
                  <Bell size={32} className="mx-auto mb-3 opacity-50" />
                  <p>Inbox empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium capitalize">{notification.platform}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          notification.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          notification.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {notification.status}
                        </span>
                      </div>
                      <a 
                        href={notification.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline block truncate"
                      >
                        {notification.video_url}
                      </a>
                      <p className="text-gray-500 text-xs mt-1">
                        Submitted: {new Date(notification.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showRules && (
            <div className="absolute top-16 right-6 bg-zinc-900 border-zinc-800 border rounded-lg shadow-lg p-6 z-50 w-96 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Rules / Terms of Service</h3>
                <button
                  onClick={() => setShowRules(false)}
                  className="p-1 rounded hover:bg-zinc-800 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4 text-sm text-gray-400">
                <div>
                  <h4 className="font-medium text-white mb-2">1. Account Usage</h4>
                  <p>Users must be at least 13 years old. Each user is allowed one account only.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">2. Content Guidelines</h4>
                  <p>All submitted content must comply with community standards. No hate speech, harassment, or illegal content.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">3. Payment Terms</h4>
                  <p>Payments are processed within 30 days of campaign completion. Minimum payout is $20.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">4. Prohibited Activities</h4>
                  <p>Bot usage, fake engagement, and fraudulent activities are strictly prohibited and will result in immediate banning.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">5. Privacy</h4>
                  <p>Your data is protected according to our privacy policy. We do not sell your personal information.</p>
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
