import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Search, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function SubmissionsManagement() {
  const { profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [submissionsData, campaignsData, usersData] = await Promise.all([
        supabase.from('campaign_submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('content_rewards').select('id, title'),
        supabase.from('profiles').select('id, full_name, email, username')
      ])
      
      if (submissionsData.error) throw submissionsData.error
      if (campaignsData.error) throw campaignsData.error
      if (usersData.error) throw usersData.error
      
      setSubmissions(submissionsData.data || [])
      setCampaigns(campaignsData.data || [])
      setUsers(usersData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (submissionId, newStatus) => {
    try {
      const { error } = await supabase
        .from('campaign_submissions')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewer_id: profile?.id
        })
        .eq('id', submissionId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error.message)
      alert('Failed to update status')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-400" />
      case 'rejected':
        return <XCircle size={16} className="text-red-400" />
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />
      default:
        return <Clock size={16} className="text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const campaign = campaigns.find(c => c.id === submission.campaign_id)
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      campaign?.title?.toLowerCase().includes(searchLower) ||
      submission.status?.toLowerCase().includes(searchLower)
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="p-6 text-gray-400">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-blue-400" size={32} />
        <h2 className="text-3xl font-bold text-gray-100">Campaign Submissions</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by campaign or status..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center text-gray-400">
            No submissions found
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const campaign = campaigns.find(c => c.id === submission.campaign_id)
            const user = users.find(u => u.id === submission.user_id)
            return (
              <div key={submission.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100 mb-1">{campaign?.title || 'Unknown Campaign'}</h3>
                    <p className="text-sm text-gray-400">
                      Submitted by: {user?.full_name || user?.username || user?.email || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                    {getStatusIcon(submission.status)}
                    {submission.status}
                  </span>
                </div>

                {submission.answers && Object.keys(submission.answers).length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Answers</h4>
                    <div className="space-y-2">
                      {Object.entries(submission.answers).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-400">{key}</p>
                          <p className="text-sm text-gray-200">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submission.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(submission.id, 'approved')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(submission.id, 'rejected')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SubmissionsManagement
