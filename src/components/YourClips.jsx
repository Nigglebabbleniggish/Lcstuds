import { useState, useEffect } from 'react'
import { Plus, Youtube, Instagram, Twitter, Video, Calendar, Eye, CheckCircle, Clock, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function YourClips() {
  const { profile } = useAuth()
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmit, setShowSubmit] = useState(false)
  const [formData, setFormData] = useState({
    platform: '',
    video_url: '',
    title: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (profile?.id) {
      fetchClips()
    } else {
      setLoading(false)
    }
  }, [profile?.id])

  const fetchClips = async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('user_clips')
        .select('*')
        .eq('user_id', profile.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setClips(data || [])
    } catch (error) {
      console.error('Error fetching clips:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.platform || !formData.video_url) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('user_clips')
        .insert({
          user_id: profile.id,
          platform: formData.platform,
          video_url: formData.video_url,
          title: formData.title || `${formData.platform} clip`,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })

      if (error) throw error

      setShowSubmit(false)
      setFormData({ platform: '', video_url: '', title: '' })
      fetchClips()
      alert('Clip submitted successfully! Waiting for approval.')
    } catch (error) {
      console.error('Error submitting clip:', error.message)
      alert('Failed to submit clip')
    } finally {
      setSubmitting(false)
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Your Clips</h2>
        <button
          onClick={() => setShowSubmit(!showSubmit)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} />
          Submit Clip
        </button>
      </div>

      {/* Submit Form */}
      {showSubmit && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Submit New Clip</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Platform *</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-white"
                required
              >
                <option value="">Select platform</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram Reels</option>
                <option value="twitter">Twitter/X</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Video URL *</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title (optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My awesome clip"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Clip'}
              </button>
              <button
                type="button"
                onClick={() => setShowSubmit(false)}
                className="px-4 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clips List */}
      {clips.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-gray-500">
          <Video size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No clips submitted yet</p>
          <p className="text-sm">Submit your first clip to start earning!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clips.map((clip) => {
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
                    {clip.status === 'approved' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} />
                        Approved
                      </span>
                    ) : clip.status === 'rejected' ? (
                      <span className="flex items-center gap-1">
                        <X size={12} />
                        Rejected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </span>
                </div>
                
                <h4 className="font-semibold text-white mb-2 line-clamp-2">{clip.title}</h4>
                <p className="text-sm text-gray-400 mb-4 capitalize">{clip.platform}</p>
                
                {clip.status === 'approved' && clip.view_count !== null ? (
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
                ) : (
                  <div className="text-sm text-gray-500">
                    {clip.status === 'pending' ? 'Waiting for approval...' : 'Clip was rejected'}
                  </div>
                )}
                
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
  )
}

export default YourClips
