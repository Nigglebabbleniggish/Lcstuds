import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Calendar, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function Earnings() {
  const { profile } = useAuth()
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (profile?.id) {
      fetchEarnings()
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

  const totalEarnings = earnings.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const filteredEarnings = earnings.filter(e => 
    e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.campaign_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="p-6 text-gray-400">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="text-green-400" size={32} />
        <h2 className="text-3xl font-bold text-white">Earnings</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Earnings (Crypto)</p>
              <p className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-white">{earnings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Calendar className="text-purple-400" size={24} />
            </div>
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
      </div>

      {/* Payment Method Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
        <p className="text-yellow-400 text-sm font-medium">💰 All payments are made in cryptocurrency (USDT/USDC)</p>
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
    </div>
  )
}

export default Earnings
