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

  const extractYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const fetchYouTubeViewCount = async (videoId) => {
    try {
      let youtubeApiKey = localStorage.getItem('YOUTUBE_API_KEY') || import.meta.env.VITE_YOUTUBE_API_KEY
      if (!youtubeApiKey) {
        youtubeApiKey = 'AIzaSyA7NWd90TxdR1PPDSKZWSPdZiRfb8OzAEQ'
      }

      const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${youtubeApiKey}`
      const response = await fetch(endpoint, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          return parseInt(data.items[0].statistics.viewCount) || 0
        }
      }
      return 0
    } catch (error) {
      console.error('Error fetching YouTube view count:', error)
      return 0
    }
  }

  const updateClipViewCount = async (clip) => {
    if (clip.platform !== 'youtube' || !clip.video_url) return

    const videoId = extractYouTubeVideoId(clip.video_url)
    if (!videoId) return

    // Check if last update was more than 2 days ago
    const lastUpdated = clip.last_updated ? new Date(clip.last_updated) : new Date(0)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    
    if (lastUpdated > twoDaysAgo && clip.view_count > 0) return

    const newViewCount = await fetchYouTubeViewCount(videoId)
    if (newViewCount > 0) {
      try {
        const { error } = await supabase
          .from('user_clips')
          .update({ 
            view_count: newViewCount,
            last_updated: new Date().toISOString()
          })
          .eq('id', clip.id)

        if (!error) {
          // Update local state
          setApprovedClips(prev => prev.map(c => 
            c.id === clip.id ? { ...c, view_count: newViewCount, last_updated: new Date().toISOString() } : c
          ))
        }
      } catch (error) {
        console.error('Error updating view count:', error)
      }
    }
  }

  const fetchApprovedClips = async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('user_clips')
        .select('*')
        .eq('user_id', profile.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setApprovedClips(data || [])

      // Update view counts for clips that need it
      data?.forEach(clip => {
        if (clip.platform === 'youtube') {
          updateClipViewCount(clip)
        }
      })
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
                    <h4 className="font-semibold text-white truncate">{clip.title || 'Campaign Submission'}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      clip.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      clip.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {clip.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 capitalize">{clip.platform}</p>
                  {clip.video_url && (
                    <a
                      href={clip.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline truncate block mt-1"
                    >
                      {clip.video_url}
                    </a>
                  )}
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
                  {clip.video_url && (
                    <a
                      href={clip.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View
                    </a>
                  )}
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
