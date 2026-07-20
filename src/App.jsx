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
        <section className="py-32 px-4 relative overflow-hidden">
          {/* Falling Social Media Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 left-[5%] text-white/30 animate-fall-left" style={{ animationDelay: '0s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div className="absolute top-[20%] left-[10%] text-white/30 animate-fall-right" style={{ animationDelay: '0s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="absolute top-[40%] left-[20%] text-white/30 animate-fall-left" style={{ animationDelay: '0s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="absolute top-[60%] left-[30%] text-white/30 animate-fall-right" style={{ animationDelay: '0s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div className="absolute top-[80%] left-[40%] text-white/30 animate-fall-left" style={{ animationDelay: '0s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="absolute -top-20 left-[50%] text-white/30 animate-fall-right" style={{ animationDelay: '2s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="absolute top-[15%] left-[60%] text-white/30 animate-fall-left" style={{ animationDelay: '2s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div className="absolute top-[35%] left-[70%] text-white/30 animate-fall-right" style={{ animationDelay: '2s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="absolute top-[55%] left-[80%] text-white/30 animate-fall-left" style={{ animationDelay: '2s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="absolute top-[75%] left-[90%] text-white/30 animate-fall-right" style={{ animationDelay: '2s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div className="absolute -top-20 left-[15%] text-white/30 animate-fall-left" style={{ animationDelay: '4s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="absolute top-[25%] left-[25%] text-white/30 animate-fall-right" style={{ animationDelay: '4s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="absolute top-[45%] left-[35%] text-white/30 animate-fall-left" style={{ animationDelay: '4s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div className="absolute top-[65%] left-[45%] text-white/30 animate-fall-right" style={{ animationDelay: '4s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="absolute top-[85%] left-[55%] text-white/30 animate-fall-left" style={{ animationDelay: '4s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="absolute -top-20 left-[65%] text-white/30 animate-fall-right" style={{ animationDelay: '6s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div className="absolute top-[10%] left-[75%] text-white/30 animate-fall-left" style={{ animationDelay: '6s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="absolute top-[30%] left-[85%] text-white/30 animate-fall-right" style={{ animationDelay: '6s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
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
          
          {/* Moving Text Marquee */}
          <div className="absolute top-0 left-0 w-full overflow-hidden bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 py-3">
            <div className="flex whitespace-nowrap animate-marquee">
              <span className="text-white/80 text-lg font-medium mx-8">#1 Clipping Service</span>
              <span className="text-white/80 text-lg font-medium mx-8">Creator Management</span>
              <span className="text-white/80 text-lg font-medium mx-8">Campaign Tracking</span>
              <span className="text-white/80 text-lg font-medium mx-8">Analytics Dashboard</span>
              <span className="text-white/80 text-lg font-medium mx-8">Social Media Integration</span>
              <span className="text-white/80 text-lg font-medium mx-8">Video Performance</span>
              <span className="text-white/80 text-lg font-medium mx-8">#1 Clipping Service</span>
              <span className="text-white/80 text-lg font-medium mx-8">Creator Management</span>
              <span className="text-white/80 text-lg font-medium mx-8">Campaign Tracking</span>
              <span className="text-white/80 text-lg font-medium mx-8">Analytics Dashboard</span>
              <span className="text-white/80 text-lg font-medium mx-8">Social Media Integration</span>
              <span className="text-white/80 text-lg font-medium mx-8">Video Performance</span>
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
                <p className="text-xl text-gray-400">Active People</p>
              </div>
              <div className="text-center p-8">
                <div className="text-5xl font-bold mb-2 text-white">5M+</div>
                <p className="text-xl text-gray-400">Total Views</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Everything You Need</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-zinc-600 transition-all hover:transform hover:-translate-y-1 group">
                <div className="h-40 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <svg viewBox="0 0 64 64" fill="none" className="w-24 h-24 relative z-10 group-hover:scale-110 transition-transform">
                    <rect x="8" y="16" width="48" height="32" rx="4" fill="#5a5a5a"/>
                    <rect x="12" y="20" width="40" height="24" rx="2" fill="#4a4a4a"/>
                    <circle cx="20" cy="32" r="6" fill="#6a6a6a"/>
                    <path d="M32 28 L40 32 L32 36 L32 28" fill="#7a7a7a"/>
                    <rect x="44" y="28" width="8" height="8" rx="2" fill="#6a6a6a"/>
                    <circle cx="32" cy="32" r="12" stroke="#8a8a8a" stroke-width="2" fill="none" opacity="0.5"/>
                  </svg>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-white mb-2">Earn Crypto</h4>
                  <p className="text-gray-400">Get paid in USDT/USDC for completing campaigns and growing your audience.</p>
                </div>
              </div>
              <div className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-zinc-600 transition-all hover:transform hover:-translate-y-1 group">
                <div className="h-40 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <svg viewBox="0 0 64 64" fill="none" className="w-24 h-24 relative z-10 group-hover:scale-110 transition-transform">
                    <rect x="8" y="8" width="48" height="48" rx="4" fill="#5a5a5a"/>
                    <rect x="12" y="12" width="40" height="40" rx="2" fill="#4a4a4a"/>
                    <rect x="16" y="20" width="32" height="4" rx="2" fill="#6a6a6a"/>
                    <rect x="16" y="28" width="24" height="4" rx="2" fill="#6a6a6a"/>
                    <rect x="16" y="36" width="28" height="4" rx="2" fill="#6a6a6a"/>
                    <circle cx="48" cy="44" r="6" fill="#7a7a7a"/>
                    <path d="M20 20 L32 28 L44 20" stroke="#8a8a8a" stroke-width="2" fill="none" opacity="0.5"/>
                  </svg>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-white mb-2">Campaign Management</h4>
                  <p className="text-gray-400">Apply to campaigns, track progress, and manage your content all in one dashboard.</p>
                </div>
              </div>
              <div className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-zinc-600 transition-all hover:transform hover:-translate-y-1 group">
                <div className="h-40 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <svg viewBox="0 0 64 64" fill="none" className="w-24 h-24 relative z-10 group-hover:scale-110 transition-transform">
                    <rect x="8" y="16" width="48" height="40" rx="4" fill="#5a5a5a"/>
                    <rect x="12" y="20" width="40" height="32" rx="2" fill="#4a4a4a"/>
                    <path d="M12 44 L20 36 L28 40 L36 28 L44 32 L52 24" stroke="#7a7a7a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="52" cy="24" r="4" fill="#6a6a6a"/>
                    <circle cx="44" cy="32" r="4" fill="#6a6a6a"/>
                    <circle cx="36" cy="28" r="4" fill="#6a6a6a"/>
                    <circle cx="28" cy="40" r="4" fill="#6a6a6a"/>
                    <circle cx="20" cy="36" r="4" fill="#6a6a6a"/>
                    <path d="M12 52 L52 52" stroke="#8a8a8a" stroke-width="1" opacity="0.5"/>
                    <path d="M12 48 L52 48" stroke="#8a8a8a" stroke-width="1" opacity="0.3"/>
                  </svg>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-white mb-2">Analytics</h4>
                  <p className="text-gray-400">Track your earnings, views, and campaign performance with detailed analytics.</p>
                </div>
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

  // Show landing page if not logged in OR if explicitly on landing tab
  if (!user || activeTab === 'landing') {
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

  // For logged-in users on dashboard/tabs, show sidebar layout
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
