import { useState, useEffect } from 'react'
import { CheckCircle, X, Eye, Calendar, Film, Youtube, Instagram, Twitter, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function ClipsManagement() {
  const { profile } = useAuth()
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (profile?.is_admin) {
      fetchClips()
    }
  }, [profile?.is_admin])

  const fetchClips = async () => {
    try {
      const { data, error } = await supabase
        .from('user_clips')
        .select('*, profiles(full_name, email)')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setClips(data || [])
    } catch (error) {
      console.error('Error fetching clips:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (clipId, viewCount) => {
    setUpdating(clipId)
    try {
      const { error } = await supabase
        .from('user_clips')
        .update({
          status: 'approved',
          view_count: viewCount || 0,
          approved_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .eq('id', clipId)

      if (error) throw error
      fetchClips()
    } catch (error) {
      console.error('Error approving clip:', error.message)
      alert('Failed to approve clip')
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = async (clipId) => {
    if (!confirm('Are you sure you want to reject this clip?')) return
    
    setUpdating(clipId)
    try {
      const { error } = await supabase
        .from('user_clips')
        .update({
          status: 'rejected',
          last_updated: new Date().toISOString()
        })
        .eq('id', clipId)

      if (error) throw error
      fetchClips()
    } catch (error) {
      console.error('Error rejecting clip:', error.message)
      alert('Failed to reject clip')
    } finally {
      setUpdating(null)
    }
  }

  const handleUpdateViews = async (clipId, viewCount) => {
    setUpdating(clipId)
    try {
      const { error } = await supabase
        .from('user_clips')
        .update({
          view_count: viewCount,
          last_updated: new Date().toISOString()
        })
        .eq('id', clipId)

      if (error) throw error
      fetchClips()
    } catch (error) {
      console.error('Error updating views:', error.message)
      alert('Failed to update views')
    } finally {
      setUpdating(null)
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

  if (!profile?.is_admin) {
    return <div className="p-6 text-gray-400">Access denied. Admin only.</div>
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading clips...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Clips Management</h2>

      {clips.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-gray-500">
          <Film size={48} className="mx-auto mb-4 opacity-50" />
          <p>No clips submitted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clips.map((clip) => {
            const Icon = getPlatformIcon(clip.platform)
            const color = getPlatformColor(clip.platform)
            
            return (
              <div key={clip.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{clip.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          clip.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          clip.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {clip.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2 capitalize">{clip.platform}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        User: {clip.profiles?.full_name || clip.profiles?.email || 'Unknown'}
                      </p>
                      <a
                        href={clip.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline"
                      >
                        View Original
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {clip.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const viewCount = prompt('Enter initial view count:', '0')
                            if (viewCount !== null) {
                              handleApprove(clip.id, parseInt(viewCount) || 0)
                            }
                          }}
                          disabled={updating === clip.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === clip.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(clip.id)}
                          disabled={updating === clip.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === clip.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {clip.status === 'approved' && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Eye size={16} />
                          <input
                            type="number"
                            value={clip.view_count || 0}
                            onChange={(e) => handleUpdateViews(clip.id, parseInt(e.target.value) || 0)}
                            className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-center"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const viewCount = prompt('Update view count:', clip.view_count || 0)
                            if (viewCount !== null) {
                              handleUpdateViews(clip.id, parseInt(viewCount) || 0)
                            }
                          }}
                          disabled={updating === clip.id}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Update
                        </button>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(clip.submitted_at).toLocaleDateString()}
                      {clip.approved_at && (
                        <span> • Approved: {new Date(clip.approved_at).toLocaleDateString()}</span>
                      )}
                      {clip.last_updated && (
                        <span> • Updated: {new Date(clip.last_updated).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ClipsManagement
