import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Activity, Calendar, BarChart3, Eye, Target, Users, Heart, MessageCircle, Share2, Instagram, Youtube, Twitter, Facebook, Linkedin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeCampaigns: 0,
    totalViews: 0,
    totalFollowers: 0,
    engagementRate: 0,
    socialAccounts: 0
  })
  const [socialAccounts, setSocialAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip Supabase fetch for local users
    if (profile?.id?.startsWith('local_')) {
      setLoading(false)
      return
    }

    fetchDashboardData()
    loadLocalSocialAccounts()
  }, [profile])

  const loadLocalSocialAccounts = () => {
    const savedAccounts = localStorage.getItem('social_accounts')
    if (savedAccounts) {
      setSocialAccounts(JSON.parse(savedAccounts))
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [campaignsData, earningsData, socialData] = await Promise.all([
        supabase.from('content_rewards').select('*'),
        profile?.is_admin 
          ? supabase.from('earnings').select('*').order('created_at', { ascending: false }).limit(10)
          : supabase.from('earnings').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(10),
        profile?.id ? supabase.from('social_accounts').select('*').eq('user_id', profile.id) : Promise.resolve({ data: [] })
      ])

      const totalViews = socialData.data?.reduce((sum, s) => sum + (s.views || 0), 0) || 0
      const totalFollowers = socialData.data?.reduce((sum, s) => sum + (s.followers || 0), 0) || 0
      const avgEngagement = socialData.data?.length > 0 
        ? socialData.data.reduce((sum, s) => sum + (s.engagement_rate || 0), 0) / socialData.data.length 
        : 0

      setStats({
        totalEarnings: earningsData.data?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0,
        activeCampaigns: campaignsData.data?.length || 0,
        totalViews,
        totalFollowers,
        engagementRate: avgEngagement,
        socialAccounts: socialData.data?.length || 0
      })

      // For authenticated users, use Supabase data directly
      if (profile?.id && !profile.id.startsWith('local_')) {
        if (socialData.data && socialData.data.length > 0) {
          setSocialAccounts(socialData.data)
        } else {
          // Fallback to localStorage if database is empty or failed
          loadLocalSocialAccounts()
        }
      } else {
        // For local users, use localStorage
        loadLocalSocialAccounts()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message)
      // Fallback to localStorage on error
      loadLocalSocialAccounts()
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      youtube: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      twitter: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      facebook: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      linkedin: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      tiktok: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      threads: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
      )
    }
    const IconComponent = icons[platform.toLowerCase()]
    return IconComponent || (() => <Share2 size={20} className="text-white" />)
  }

  const getPlatformColor = (platform) => {
    const colors = {
      instagram: 'from-pink-500 via-purple-500 to-orange-500',
      youtube: 'from-red-600 via-red-500 to-red-600',
      twitter: 'from-blue-400 via-blue-500 to-blue-600',
      facebook: 'from-blue-600 via-blue-700 to-blue-800',
      linkedin: 'from-blue-700 via-blue-800 to-blue-900',
      tiktok: 'from-gray-900 via-black to-gray-800',
      threads: 'from-gray-600 via-gray-700 to-gray-800'
    }
    return colors[platform.toLowerCase()] || 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading analytics...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {profile?.full_name || 'User'}</h1>
            <p className="text-gray-400">Here's what's happening with your campaigns today.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
          <Calendar size={16} />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Unified Stats Display */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl border border-zinc-700 p-8 mb-8 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Active Campaigns</p>
            <p className="text-3xl font-bold text-white">{stats.activeCampaigns}</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Total Views</p>
            <p className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Social Accounts Section */}
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-4">
        <h3 className="text-lg font-bold text-white mb-3">Connected Accounts</h3>
        
        {socialAccounts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Share2 size={24} className="mx-auto mb-2 opacity-50" />
            <p>No social accounts connected yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {socialAccounts.map((account, index) => {
              const IconComponent = getPlatformIcon(account.platform)
              const color = getPlatformColor(account.platform)
              return (
                <div 
                  key={account.id} 
                  className="bg-zinc-800/50 rounded-xl p-1.5 border border-zinc-700 hover:border-zinc-600 transition-all animate-fade-in aspect-square flex flex-col justify-center items-center relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-1.5 rounded-xl bg-gradient-to-br ${color} w-fit mb-1`}>
                    <div className="w-10 h-10">
                      <IconComponent />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold capitalize text-[12px] leading-tight">{account.platform}</p>
                    <p className="text-gray-400 text-[9px] leading-tight">@{account.username}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
