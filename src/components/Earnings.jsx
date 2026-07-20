import { useState, useEffect } from 'react'
import { DollarSign, Search, HelpCircle, CreditCard, Clock, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function Earnings() {
  const { profile } = useAuth()
  const [earnings, setEarnings] = useState([])
  const [pendingEarnings, setPendingEarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRequirements, setShowRequirements] = useState(false)
  const [activeTab, setActiveTab] = useState('completed')

  useEffect(() => {
    // Skip Supabase fetch for local users
    if (profile?.id?.startsWith('local_')) {
      setLoading(false)
      return
    }

    if (profile?.id) {
      fetchEarnings()
      fetchPendingEarnings()
    } else {
      setLoading(false)
    }
  }, [profile?.id])

  const fetchEarnings = async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEarnings(data || [])
    } catch (error) {
      console.error('Error fetching earnings:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingEarnings = async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('pending_earnings')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingEarnings(data || [])
    } catch (error) {
      console.error('Error fetching pending earnings:', error.message)
    }
  }

  const totalEarnings = earnings.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const totalPending = pendingEarnings.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const filteredEarnings = earnings.filter(e => 
    e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.campaign_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredPending = pendingEarnings.filter(e => 
    e.platform?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-6 text-gray-400">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-white">Earnings</h2>
          <button
            onClick={() => setShowRequirements(!showRequirements)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Platform Requirements"
          >
            <HelpCircle size={24} />
          </button>
        </div>
        <button
          onClick={async () => {
            if (totalEarnings < 10) {
              alert('Minimum payout amount is $10')
              return
            }
            if (!confirm(`Request payout of $${totalEarnings.toFixed(2)}?`)) return
            try {
              const { error } = await supabase
                .from('payout_requests')
                .insert({
                  user_id: profile.id,
                  amount: totalEarnings,
                  status: 'pending'
                })
              if (error) throw error
              alert('Payout request submitted successfully')
            } catch (error) {
              console.error('Error requesting payout:', error)
              alert('Failed to request payout')
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
        >
          <CreditCard size={20} />
          Request Payout
        </button>
      </div>

      {/* Platform Requirements Modal */}
      {showRequirements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Platform Requirements</h3>
              <button
                onClick={() => setShowRequirements(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">TikTok - $0.80 per 1k views</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 60% US Audience</li>
                  <li>• 30k Views in the past month</li>
                </ul>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Threads - $0.25 per 1k views</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 20k views in the past month</li>
                </ul>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Instagram Reels - $0.85 per 1k views</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 50k Views in the past month</li>
                  <li>• 50% US Audience</li>
                </ul>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Twitter/X - $0.35 per 1k views</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 60k views in the past month</li>
                </ul>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Facebook - $0.65 per 1k views</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 35k views in the past month</li>
                </ul>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm font-medium">All platforms must meet requirements to be eligible. Transfers are delivered same day as promised.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div>
            <p className="text-gray-400 text-sm">Total Earnings</p>
            <p className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div>
            <p className="text-gray-400 text-sm">Pending Earnings</p>
            <p className="text-2xl font-bold text-yellow-400">${totalPending.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div>
            <p className="text-gray-400 text-sm">Transactions</p>
            <p className="text-2xl font-bold text-white">{earnings.length}</p>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div>
            <p className="text-gray-400 text-sm">This Month</p>
            <p className="text-2xl font-bold text-white">
              ${earnings
                .filter(e => new Date(e.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-black'
              : 'bg-zinc-800 text-gray-400 hover:text-white'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-white text-black'
              : 'bg-zinc-800 text-gray-400 hover:text-white'
          }`}
        >
          Pending ({pendingEarnings.length})
        </button>
      </div>

      {/* Payment Method Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
        <p className="text-yellow-400 text-sm font-medium">All payments are made in cryptocurrency (USDT/USDC)</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search earnings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Earnings List */}
      {activeTab === 'completed' ? (
        <div className="space-y-3">
          {filteredEarnings.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-gray-500">
              No earnings found
            </div>
          ) : (
            filteredEarnings.map((earning) => (
              <div key={earning.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{earning.description || 'Earning'}</h3>
                  <p className="text-sm text-gray-500">
                    {earning.campaign_id && `Campaign: ${earning.campaign_id}`}
                    {earning.campaign_id && ' • '}
                    {earning.payment_method && `Payment: ${earning.payment_method}`}
                    {earning.payment_method && ' • '}
                    {new Date(earning.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">+${parseFloat(earning.amount).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPending.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-gray-500">
              No pending earnings found
            </div>
          ) : (
            filteredPending.map((pending) => (
              <div key={pending.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white capitalize">{pending.platform} Clip Earnings</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      pending.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      pending.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {pending.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Processing: {new Date(pending.process_date).toLocaleDateString()}
                    </span>
                    {' • '}
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Created: {new Date(pending.created_at).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-400">${parseFloat(pending.amount).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Earnings
