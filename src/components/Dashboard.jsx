import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Activity, Calendar, BarChart3, Eye, Target, Users, Heart, MessageCircle, Share2 } from 'lucide-react'
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
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip Supabase fetch for local users
    if (profile?.id?.startsWith('local_')) {
      setLoading(false)
      return
    }

    fetchDashboardData()
  }, [profile])

  const fetchDashboardData = async () => {
    try {
      const [campaignsData, earningsData, socialData] = await Promise.all([
        supabase.from('content_rewards').select('*'),
        profile?.is_admin 
          ? supabase.from('earnings').select('*').order('created_at', { ascending: false }).limit(10)
          : supabase.from('earnings').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(10),
        profile?.id ? supabase.from('social_accounts').select('*').eq('user_id', profile.id) : Promise.resolve({ data: [] })
      ])

      const totalViews = campaignsData.data?.reduce((sum, c) => sum + (c.views_required || 0), 0) || 0
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

      setRecentActivity(earningsData.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Earnings', value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10' },
    { label: 'Active Campaigns', value: stats.activeCampaigns, icon: Target, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500/10' },
    { label: 'Total Followers', value: stats.totalFollowers.toLocaleString(), icon: Users, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-500/10' },
    { label: 'Engagement Rate', value: `${stats.engagementRate.toFixed(1)}%`, icon: Heart, color: 'from-pink-500 to-rose-600', bg: 'bg-pink-500/10' },
  ]

  if (loading) {
    return <div className="p-6 text-gray-400">Loading analytics...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {profile?.full_name || 'User'}</h1>
          <p className="text-gray-400">Here's what's happening with your campaigns today.</p>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
          <Calendar size={16} />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} w-fit mb-4`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Social Media Performance</h3>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div className="h-48 flex items-end gap-3">
            {[65, 45, 78, 52, 89, 67, 95, 72, 58, 84, 91, 76].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-zinc-800 to-zinc-700 rounded-t-lg transition-all hover:from-purple-900 hover:to-purple-700"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Social Accounts</h3>
            <Share2 className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {[
              { name: 'Connected', count: stats.socialAccounts, color: 'bg-green-500' },
              { name: 'Active', count: Math.floor(stats.socialAccounts * 0.8), color: 'bg-blue-500' },
              { name: 'Pending', count: Math.floor(stats.socialAccounts * 0.2), color: 'bg-yellow-500' },
            ].map((status) => (
              <div key={status.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span className="text-gray-300">{status.name}</span>
                </div>
                <span className="text-white font-semibold">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-pink-500/10 rounded-xl">
              <Heart className="text-pink-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Likes</p>
              <p className="text-2xl font-bold text-white">{(stats.totalFollowers * 12).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <TrendingUp size={16} />
            <span>+12.5%</span>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <MessageCircle className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Comments</p>
              <p className="text-2xl font-bold text-white">{(stats.totalFollowers * 3).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <TrendingUp size={16} />
            <span>+8.3%</span>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Share2 className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Shares</p>
              <p className="text-2xl font-bold text-white">{(stats.totalFollowers * 5).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <TrendingUp size={16} />
            <span>+15.2%</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
        {recentActivity.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
            <p>No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <DollarSign className="text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{activity.description || 'Campaign Earning'}</p>
                    <p className="text-gray-500 text-sm">{new Date(activity.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-lg">+${parseFloat(activity.amount).toFixed(2)}</p>
                  <p className="text-gray-500 text-xs">{activity.payment_method || 'Crypto'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
