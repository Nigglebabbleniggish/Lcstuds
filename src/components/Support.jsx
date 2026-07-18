import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, Send, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'

function Support() {
  const { user, profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    message: ''
  })

  const categories = [
    { value: 'account', label: 'Account Issues' },
    { value: 'payment', label: 'Payment & Billing' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'affiliate', label: 'Affiliate Program' },
    { value: 'verification', label: 'Verification' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    if (!user?.id) {
      alert('You must be logged in to submit a ticket')
      return
    }
    
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: newTicket.subject,
        category: newTicket.category,
        message: newTicket.message
      })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setShowNewTicket(false)
      setNewTicket({ subject: '', category: 'general', message: '' })
      fetchTickets()
      alert('Ticket submitted successfully!')
    } catch (error) {
      console.error('Error submitting ticket:', error.message)
      alert(`Failed to submit ticket: ${error.message}`)
    }
  }

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-gray-100">Support</h2>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Ticket
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-100">{ticket.subject}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{ticket.category}</span>
                </div>
                <p className="text-sm text-gray-300">{ticket.message}</p>
              </div>
            </div>
            
            {ticket.admin_response && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm font-medium text-blue-400 mb-1">Admin Response:</p>
                <p className="text-sm text-gray-300">{ticket.admin_response}</p>
              </div>
            )}
            
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Ticket #{ticket.id.slice(0, 8)}</span>
              <span>{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
        
        {tickets.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No support tickets yet</p>
            <p className="text-sm mt-2">Click "New Ticket" to get help</p>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Create Support Ticket</h3>
            
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  required
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  required
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                  rows={5}
                  placeholder="Describe your issue in detail..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Support
