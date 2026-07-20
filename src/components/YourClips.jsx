import { useState, useEffect } from 'react'
import { Youtube, Instagram, Twitter, Video, Calendar, Eye, CheckCircle, Clock, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function YourClips() {
  const { profile } = useAuth()
  const [campaignClips, setCampaignClips] = useState([])
  const [approvedClips, setApprovedClips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      fetchCampaignSubmissions()
      fetchApprovedClips()
    } else {
      setLoading(false)
    }
  }, [profile?.id])

  const fetchCampaignSubmissions = async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('video_submissions')
        .select('*, content_rewards(*)')
        .eq('user_id', profile.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setCampaignClips(data || [])
    } catch (error) {
      console.error('Error fetching campaign submissions:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchApprovedClips = async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('user_clips')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })

      if (error) throw error
      setApprovedClips(data || [])
    } catch (error) {
      console.error('Error fetching approved clips:', error.message)
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
        return Video
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

      {/* Campaign Submissions */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Campaign Submissions</h3>
        {campaignClips.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-gray-500">
            <Video size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No campaign submissions yet</p>
            <p className="text-sm">Submit videos to campaigns to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignClips.map((clip) => {
              const Icon = getPlatformIcon(clip.platform)
              const color = getPlatformColor(clip.platform)
              
              return (
                <div key={clip.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      clip.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      clip.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {clip.status}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-2 line-clamp-2">{clip.content_rewards?.title || 'Campaign Submission'}</h4>
                  <p className="text-sm text-gray-400 mb-4 capitalize">{clip.platform}</p>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    Submitted: {new Date(clip.submitted_at).toLocaleDateString()}
                  </div>
                  
                  <a
                    href={clip.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-blue-400 hover:underline"
                  >
                    View Original
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Approved Clips */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Approved Clips</h3>
        {approvedClips.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No approved clips yet</p>
            <p className="text-sm">Approved clips will appear here with view counts</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedClips.map((clip) => {
              const Icon = getPlatformIcon(clip.platform)
              const color = getPlatformColor(clip.platform)
              
              return (
                <div key={clip.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} />
                        Approved
                      </span>
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-2 line-clamp-2">{clip.title}</h4>
                  <p className="text-sm text-gray-400 mb-4 capitalize">{clip.platform}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Eye size={14} />
                        Views
                      </span>
                      <span className="text-white font-medium">{clip.view_count?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar size={14} />
                        Posted
                      </span>
                      <span className="text-white">
                        {clip.approved_at ? new Date(clip.approved_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-white">
                        {clip.last_updated ? new Date(clip.last_updated).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <a
                    href={clip.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center text-sm text-blue-400 hover:underline"
                  >
                    View Original
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default YourClips
