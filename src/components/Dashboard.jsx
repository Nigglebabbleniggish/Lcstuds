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

      // Use local accounts if available, otherwise use database accounts
      const savedAccounts = localStorage.getItem('social_accounts')
      if (savedAccounts) {
        setSocialAccounts(JSON.parse(savedAccounts))
      } else {
        setSocialAccounts(socialData.data || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: Instagram,
      youtube: Youtube,
      twitter: Twitter,
      facebook: Facebook,
      linkedin: Linkedin,
      tiktok: Activity,
      threads: MessageCircle
    }
    const Icon = icons[platform.toLowerCase()] || Share2
    return Icon
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
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Connected Social Accounts</h3>
          <Share2 className="text-gray-400" size={24} />
        </div>
        
        {socialAccounts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Share2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No social accounts connected yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {socialAccounts.map((account, index) => {
              const Icon = getPlatformIcon(account.platform)
              const color = getPlatformColor(account.platform)
              return (
                <div 
                  key={account.id} 
                  className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 hover:border-zinc-600 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${color} w-fit mb-3`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold capitalize">{account.platform}</p>
                    <p className="text-gray-400 text-sm">@{account.username}</p>
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
