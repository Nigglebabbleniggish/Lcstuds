import { useState, useEffect } from 'react'
import { Youtube, Instagram, Twitter, Film, Calendar, Eye, CheckCircle, Clock, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function YourClips() {
  const { profile } = useAuth()
  const [approvedClips, setApprovedClips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      fetchApprovedClips()
    } else {
      setLoading(false)
    }
  }, [profile?.id])

  const fetchApprovedClips = async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('video_submissions')
        .select('*, content_rewards(*)')
        .eq('user_id', profile.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setApprovedClips(data || [])
    } catch (error) {
      console.error('Error fetching approved clips:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return Youtube
      case 'instagram':
        return Instagram
      case 'twitter':
        return Twitter
      default:
        return Film
    }
  }

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'bg-red-600'
      case 'instagram':
        return 'bg-pink-600'
      case 'twitter':
        return 'bg-blue-500'
      default:
        return 'bg-gray-600'
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading your clips...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Your Clips</h2>

      {approvedClips.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-gray-500">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No approved clips yet</p>
          <p className="text-sm">Approved clips will appear here with view counts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvedClips.map((clip) => {
            const Icon = getPlatformIcon(clip.platform)
            const color = getPlatformColor(clip.platform)
            
            return (
              <div key={clip.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-all flex items-center gap-4">
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon size={24} className="text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white truncate">{clip.content_rewards?.title || 'Campaign Submission'}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      clip.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      clip.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {clip.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 capitalize">{clip.platform}</p>
                </div>
                
                <div className="flex items-center gap-6 text-sm flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-gray-400" />
                    <span className="text-white font-medium">{clip.view_count?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-white">
                      {clip.submitted_at ? new Date(clip.submitted_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <a
                    href={clip.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline"
                  >
                    View
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default YourClips
