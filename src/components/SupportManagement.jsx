import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, Send, Clock, CheckCircle, AlertCircle, Search, Filter, Reply } from 'lucide-react'

function SupportManagement() {
  const { profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [response, setResponse] = useState('')

  useEffect(() => {
    if (profile?.is_admin) {
      fetchTickets()
    }
  }, [profile])

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch profiles separately
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, email')

      if (profileError) throw profileError

      // Merge profile data into tickets
      const ticketsWithProfiles = (data || []).map(ticket => ({
        ...ticket,
        profiles: profiles?.find(p => p.id === ticket.user_id) || null
      }))

      setTickets(ticketsWithProfiles)
    } catch (error) {
      console.error('Error fetching tickets:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const updateData = { status: newStatus }
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)

      if (error) throw error
      fetchTickets()
    } catch (error) {
      console.error('Error updating status:', error.message)
      alert('Failed to update status')
    }
  }

  const handleSubmitResponse = async (e) => {
    e.preventDefault()
    if (!selectedTicket) return

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
         admin_response: response,
          status: 'in_progress'
        })
        .eq('id', selectedTicket.id)

      if (error) throw error

      setSelectedTicket(null)
      setResponse('')
      fetchTickets()
    } catch (error) {
      console.error('Error submitting response:', error.message)
      alert('Failed to submit response')
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <MessageCircle size={16} />
      case 'in_progress': return <Clock size={16} />
      case 'resolved': return <CheckCircle size={16} />
      case 'closed': return <AlertCircle size={16} />
      default: return null
    }
  }

  const categories = [
    { value: 'account', label: 'Account Issues' },
    { value: 'payment', label: 'Payment & Billing' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'affiliate', label: 'Affiliate Program' },
    { value: 'verification', label: 'Verification' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'other', label: 'Other' }
  ]

  if (!profile?.is_admin) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-400">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>Access denied. Admin only.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="text-blue-400" size={32} />
        <h2 className="text-3xl font-bold text-gray-100">Support Management</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-100">{tickets.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Open</p>
          <p className="text-2xl font-bold text-blue-400">{tickets.filter(t => t.status === 'open').length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-yellow-400">{tickets.filter(t => t.status === 'in_progress').length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Resolved</p>
          <p className="text-2xl font-bold text-green-400">{tickets.filter(t => t.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{ticket.category}</span>
                </div>
                <h3 className="font-semibold text-gray-100 mb-1">{ticket.subject}</h3>
                <p className="text-sm text-gray-400">
                  {ticket.profiles?.username || ticket.profiles?.full_name || 'Unknown'} 
                  {ticket.profiles?.email && ` (${ticket.profiles.email})`}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-3 line-clamp-2">{ticket.message}</p>
            
            {ticket.admin_response && (
              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm font-medium text-blue-400 mb-1">Admin Response:</p>
                <p className="text-sm text-gray-300">{ticket.admin_response}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  title="Reply"
                >
                  <Reply size={18} />
                </button>
                {ticket.status === 'open' && (
                  <button
                    onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                    className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                    title="Mark In Progress"
                  >
                    <Clock size={18} />
                  </button>
                )}
                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <button
                    onClick={() => handleStatusChange(ticket.id, 'resolved')}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    title="Resolve"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredTickets.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tickets found</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Reply to Ticket</h3>
            
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-300 mb-1">{selectedTicket.subject}</p>
              <p className="text-sm text-gray-400">{selectedTicket.message}</p>
            </div>
            
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Response</label>
                <textarea
                  required
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                  rows={5}
                  placeholder="Type your response..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTicket(null)
                    setResponse('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportManagement
