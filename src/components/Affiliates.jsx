import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Gift, Plus, DollarSign, TrendingUp, Users, CheckCircle, Clock, XCircle, Search, ArrowLeft } from 'lucide-react'

function Affiliates() {
  const { profile } = useAuth()
  const [rewards, setRewards] = useState([])
  const [affiliates, setAffiliates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAffiliate, setSelectedAffiliate] = useState(null)
  const [selectedReward, setSelectedReward] = useState(null)
  const [isCampaignView, setIsCampaignView] = useState(false)
  const [userSubmissions, setUserSubmissions] = useState([])
  const [videoSubmissions, setVideoSubmissions] = useState([])
  const [allVideoSubmissions, setAllVideoSubmissions] = useState([])
  const [profiles, setProfiles] = useState([])
  const [showVideoSubmitModal, setShowVideoSubmitModal] = useState(false)
  const [newVideoSubmission, setNewVideoSubmission] = useState({
    video_url: '',
    platform: 'youtube'
  })
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    budget: '',
    viewsRequired: '',
    coverImage: '',
    fontStyle: 'default',
    questions: [],
    resources: []
  })
  const [newResource, setNewResource] = useState({ title: '', content: '' })
  const [newQuestion, setNewQuestion] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rewardsData, affiliatesData, submissionsData, videoSubmissionsData, allVideoSubmissionsData, profilesData] = await Promise.all([
        supabase.from('content_rewards').select('*').order('created_at', { ascending: false }),
        supabase.from('affiliates').select('*').order('created_at', { ascending: false }),
        profile ? supabase.from('campaign_submissions').select('*').eq('user_id', profile.id) : Promise.resolve({ data: [] }),
        profile ? supabase.from('user_clips').select('*').eq('user_id', profile.id) : Promise.resolve({ data: [] }),
        profile?.is_admin ? supabase.from('user_clips').select('*').order('submitted_at', { ascending: false }) : Promise.resolve({ data: [] }),
        profile?.is_admin ? supabase.from('profiles').select('id, username, full_name') : Promise.resolve({ data: [] })
      ])
      
      if (rewardsData.error) throw rewardsData.error
      if (affiliatesData.error) throw affiliatesData.error
      if (submissionsData.error) throw submissionsData.error
      if (videoSubmissionsData.error) throw videoSubmissionsData.error
      if (allVideoSubmissionsData.error) throw allVideoSubmissionsData.error
      if (profilesData.error) throw profilesData.error
      
      setRewards(rewardsData.data || [])
      setAffiliates(affiliatesData.data || [])
      setUserSubmissions(submissionsData.data || [])
      setVideoSubmissions(videoSubmissionsData.data || [])
      setAllVideoSubmissions(allVideoSubmissionsData.data || [])
      setProfiles(profilesData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReward = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('content_rewards').insert({
        title: newReward.title,
        description: newReward.description,
        budget: parseFloat(newReward.budget),
        views_required: parseFloat(newReward.viewsRequired),
        cover_image: newReward.coverImage,
        font_style: newReward.fontStyle,
        questions: newReward.questions,
        resources: newReward.resources,
        status: 'pending'
      })

      if (error) throw error

      setShowAddModal(false)
      setNewReward({ title: '', description: '', budget: '', viewsRequired: '', coverImage: '', fontStyle: 'default', questions: [], resources: [] })
      setNewQuestion('')
      setNewResource({ title: '', content: '' })
      fetchData()
    } catch (error) {
      console.error('Error adding reward:', error.message)
      alert('Failed to add reward')
    }
  }

  const handleStatusChange = async (rewardId, newStatus) => {
    try {
      const { error } = await supabase
        .from('content_rewards')
        .update({ status: newStatus })
        .eq('id', rewardId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error.message)
      alert('Failed to update status')
    }
  }

  const handleVideoSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user has pending submissions
    try {
      const { data: pendingSubmissions, error: pendingError } = await supabase
        .from('user_clips')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'pending')

      if (pendingSubmissions && pendingSubmissions.length > 0) {
        alert('You already have a pending submission. Please wait for it to be reviewed before submitting another video.')
        return
      }
    } catch (error) {
      console.error('Error checking pending submissions:', error)
    }
    
    // Check if user has a verified social account for the selected platform
    try {
      const { data: socialAccounts, error: socialError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', profile.id)
        .eq('platform', newVideoSubmission.platform)
        .eq('verified', true)
        .single()

      if (socialError || !socialAccounts) {
        alert(`You must have a verified ${newVideoSubmission.platform} account connected to submit videos for this platform. Please verify your account in the Accounts section.`)
        return
      }
    } catch (error) {
      // If no verified account found, block submission
      alert(`You must have a verified ${newVideoSubmission.platform} account connected to submit videos for this platform. Please verify your account in the Accounts section.`)
      return
    }

    try {
      const { error } = await supabase.from('user_clips').insert({
        user_id: profile.id,
        platform: newVideoSubmission.platform,
        video_url: newVideoSubmission.video_url,
        title: selectedReward.title || 'Campaign Submission',
        status: 'pending'
      })

      if (error) throw error

      setShowVideoSubmitModal(false)
      setNewVideoSubmission({ video_url: '', platform: 'youtube' })
      fetchData()
      alert('Video submitted successfully!')
    } catch (error) {
      console.error('Error submitting video:', error.message)
      alert('Failed to submit video')
    }
  }

  const handleVideoStatusChange = async (submissionId, newStatus) => {
    try {
      const { error } = await supabase
        .from('user_clips')
        .update({ 
          status: newStatus, 
          approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
          last_updated: new Date().toISOString() 
        })
        .eq('id', submissionId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error updating video status:', error.message)
      alert('Failed to update status')
    }
  }

  const handleDeleteVideoSubmission = async (submissionId) => {
    if (!confirm('Are you sure you want to delete this video submission?')) return
    
    try {
      const { error } = await supabase
        .from('user_clips')
        .delete()
        .eq('id', submissionId)

      if (error) throw error
      fetchData()
      alert('Video submission deleted successfully')
    } catch (error) {
      console.error('Error deleting video submission:', error.message)
      alert('Failed to delete video submission')
    }
  }

  const handleViewCountUpdate = async (submissionId, viewCount) => {
    try {
      const { error } = await supabase
        .from('user_clips')
        .update({ 
          view_count: viewCount,
          last_updated: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error updating view count:', error.message)
      alert('Failed to update view count')
    }
  }

  const handleEditReward = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        title: newReward.title,
        description: newReward.description,
        budget: parseFloat(newReward.budget),
        cover_image: newReward.coverImage,
        font_style: newReward.fontStyle,
        questions: newReward.questions,
        resources: newReward.resources
      }

      // Only update views_required if it has a value
      if (newReward.viewsRequired) {
        updateData.views_required = parseFloat(newReward.viewsRequired)
      }

      const { error } = await supabase
        .from('content_rewards')
        .update(updateData)
        .eq('id', selectedReward.id)

      if (error) throw error

      setShowEditModal(false)
      setNewReward({ title: '', description: '', budget: '', viewsRequired: '', coverImage: '', fontStyle: 'default', questions: [], resources: [] })
      setNewQuestion('')
      setNewResource({ title: '', content: '' })
      fetchData()
      
      // Update the selected reward with new data
      setSelectedReward({ ...selectedReward, ...updateData })
    } catch (error) {
      console.error('Error updating reward:', error.message)
      alert('Failed to update campaign: ' + error.message)
    }
  }

  const openEditModal = () => {
    setNewReward({
      title: selectedReward.title,
      description: selectedReward.description,
      budget: selectedReward.budget,
      viewsRequired: selectedReward.views_required,
      coverImage: selectedReward.cover_image,
      fontStyle: selectedReward.font_style,
      questions: selectedReward.questions || [],
      resources: selectedReward.resources || []
    })
    setShowEditModal(true)
  }

  const handleDeleteReward = async (rewardId) => {
    if (!confirm('Are you sure you want to remove this reward?')) return
    
    try {
      const { error } = await supabase
        .from('content_rewards')
        .delete()
        .eq('id', rewardId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting reward:', error.message)
      alert('Failed to remove reward')
    }
  }

  const handleDeleteAffiliate = async (affiliateId) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .delete()
        .eq('id', affiliateId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting affiliate:', error.message)
      alert('Failed to remove affiliate')
    }
  }

  const handleSubmission = async (campaignId, answers) => {
    try {
      // Check if user already submitted for this campaign
      const { data: existingSubmission } = await supabase
        .from('campaign_submissions')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', profile?.id)
        .single()

      if (existingSubmission) {
        alert('You have already submitted an application for this campaign. Only one submission is allowed.')
        return
      }

      const { error } = await supabase.from('campaign_submissions').insert({
        campaign_id: campaignId,
        user_id: profile?.id,
        answers: answers,
        status: 'pending'
      })

      if (error) throw error
      alert('Form submitted successfully!')
      setSelectedReward(null)
    } catch (error) {
      console.error('Error submitting application:', error.message)
      alert('Failed to submit application')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `campaign-images/${fileName}`

      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64 = reader.result
        setNewReward({ ...newReward, coverImage: base64 })
        setUploadingImage(false)
      }
      reader.onerror = () => {
        alert('Failed to read file')
        setUploadingImage(false)
      }
    } catch (error) {
      console.error('Error uploading image:', error.message)
      alert('Failed to upload image')
      setUploadingImage(false)
    }
  }

  const handleUpdateProgress = async (rewardId, amount) => {
    try {
      const reward = rewards.find(r => r.id === rewardId)
      const newProgress = (reward.progress || 0) + parseFloat(amount)
      
      const { error } = await supabase
        .from('content_rewards')
        .update({ progress: newProgress })
        .eq('id', rewardId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error updating progress:', error.message)
      alert('Failed to update progress')
    }
  }

  const filteredRewards = rewards.filter(reward => {
    const affiliate = affiliates.find(a => a.id === reward.affiliate_id)
    const searchLower = searchTerm.toLowerCase()
    return (
      reward.title?.toLowerCase().includes(searchLower) ||
      affiliate?.name?.toLowerCase().includes(searchLower) ||
      affiliate?.email?.toLowerCase().includes(searchLower)
    )
  })

  const totalRewards = rewards.reduce((sum, r) => sum + (r.budget || 0), 0)
  const pendingRewards = rewards.filter(r => r.status === 'pending').length
  const approvedRewards = rewards.filter(r => r.status === 'approved').length

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      case 'pending': return <Clock size={16} />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-white">Campaign</h2>
        </div>
        {profile?.is_admin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus size={20} />
            Add Reward
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search rewards by title or affiliate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Admin Video Submissions Review */}
      {profile?.is_admin && allVideoSubmissions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Video Submissions Review</h2>
          <div className="space-y-3">
            {allVideoSubmissions.map((submission) => (
              <div key={submission.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium capitalize">{submission.platform}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        submission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {submission.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Views: {submission.view_count || 0}
                      </span>
                    </div>
                    <a 
                      href={submission.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:underline break-all"
                    >
                      {submission.video_url}
                    </a>
                    <p className="text-gray-500 text-xs mt-1">
                      {(() => {
                        const userProfile = profiles.find(p => p.id === submission.user_id)
                        console.log('Submission user_id:', submission.user_id)
                        console.log('Available profiles:', profiles)
                        console.log('Found profile:', userProfile)
                        return userProfile ? (userProfile.full_name || userProfile.username) : submission.user_id
                      })()} • Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={submission.view_count || 0}
                        onChange={(e) => handleViewCountUpdate(submission.id, parseInt(e.target.value))}
                        className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:border-white"
                        placeholder="Views"
                      />
                      <button
                        onClick={() => handleViewCountUpdate(submission.id, submission.view_count || 0)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        Update
                      </button>
                    </div>
                    {submission.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVideoStatusChange(submission.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVideoStatusChange(submission.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDeleteVideoSubmission(submission.id)}
                          className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRewards.map((reward) => {
          const affiliate = affiliates.find(a => a.id === reward.affiliate_id)
          return (
            <div 
              key={reward.id} 
              onClick={() => { setSelectedReward(reward); setIsCampaignView(true) }}
              className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer aspect-[4/5] flex flex-col"
            >
              {reward.cover_image && (
                <img src={reward.cover_image} alt={reward.title} className="w-full h-32 object-cover flex-shrink-0" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-white mb-1 text-sm ${reward.font_style === 'bold' ? 'font-bold' : reward.font_style === 'italic' ? 'italic' : reward.font_style === 'serif' ? 'font-serif' : reward.font_style === 'mono' ? 'font-mono' : ''}`}>{reward.title}</h3>
                    {affiliate ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedAffiliate(affiliate) }}
                        className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {affiliate.name}
                      </button>
                    ) : (
                      <p className="text-xs text-gray-500">General</p>
                    )}
                  </div>
                </div>
              
              {reward.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{reward.description}</p>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-lg font-bold text-green-400">${reward.budget?.toFixed(2) || '0.00'}</p>
                </div>
                {reward.views_required && (
                  <div>
                    <p className="text-xs text-gray-500">RPM</p>
                    <p className="text-sm font-bold text-blue-400">${reward.views_required?.toFixed(2)} / 1k views</p>
                  </div>
                )}
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{((reward.progress || 0) / (reward.budget || 1) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(reward.progress || 0) / (reward.budget || 1) * 100}%` }}
                    ></div>
                  </div>
                </div>
                {profile?.is_admin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Remove"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-600 mt-3">
                {new Date(reward.created_at).toLocaleDateString()}
              </p>
              </div>
            </div>
          )
        })}
        
        {filteredRewards.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Gift size={48} className="mx-auto mb-4 opacity-50" />
            <p>No rewards found</p>
          </div>
        )}
      </div>

      {/* Add Reward Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Content Reward</h3>
            
            <form onSubmit={handleAddReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="e.g., YouTube Video Promotion"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white resize-none"
                  rows={3}
                  placeholder="Describe the content..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Budget ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newReward.budget}
                  onChange={(e) => setNewReward({ ...newReward, budget: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">RPM ($ per 1000 views)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newReward.viewsRequired}
                  onChange={(e) => setNewReward({ ...newReward, viewsRequired: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="0.95"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Cover Image</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-gray-400">Uploading...</p>
                  )}
                  <input
                    type="url"
                    value={newReward.coverImage}
                    onChange={(e) => setNewReward({ ...newReward, coverImage: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Or paste image URL..."
                  />
                  {newReward.coverImage && (
                    <img
                      src={newReward.coverImage}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg mt-2"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Font Style</label>
                <select
                  value={newReward.fontStyle}
                  onChange={(e) => setNewReward({ ...newReward, fontStyle: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                >
                  <option value="default">Default</option>
                  <option value="bold">Bold</option>
                  <option value="italic">Italic</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Application Questions</label>
                <div className="space-y-2 mb-2">
                  {newReward.questions.map((q, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const updated = [...newReward.questions]
                          updated[index] = e.target.value
                          setNewReward({ ...newReward, questions: updated })
                        }}
                        className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                        placeholder={`Question ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newReward.questions.filter((_, i) => i !== index)
                          setNewReward({ ...newReward, questions: updated })
                        }}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Add a question..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newQuestion.trim()) {
                        setNewReward({ ...newReward, questions: [...newReward.questions, newQuestion.trim()] })
                        setNewQuestion('')
                      }
                    }}
                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Resources</label>
                <div className="space-y-2 mb-2">
                  {newReward.resources.map((res, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={res.title}
                          onChange={(e) => {
                            const updated = [...newReward.resources]
                            updated[index].title = e.target.value
                            setNewReward({ ...newReward, resources: updated })
                          }}
                          className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500 text-sm"
                          placeholder="Resource title..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newReward.resources.filter((_, i) => i !== index)
                            setNewReward({ ...newReward, resources: updated })
                          }}
                          className="p-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 ml-2"
                        >
                          ×
                        </button>
                      </div>
                      <textarea
                        value={res.content}
                        onChange={(e) => {
                          const updated = [...newReward.resources]
                          updated[index].content = e.target.value
                          setNewReward({ ...newReward, resources: updated })
                        }}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500 resize-none text-sm"
                        rows={2}
                        placeholder="Resource description..."
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Resource title..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newResource.title.trim()) {
                        setNewReward({ ...newReward, resources: [...newReward.resources, { ...newResource }] })
                        setNewResource({ title: '', content: '' })
                      }
                    }}
                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Add Resource
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Edit Campaign</h3>
            
            <form onSubmit={handleEditReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="e.g., YouTube Video Promotion"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  required
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white resize-none"
                  rows={3}
                  placeholder="Describe the content..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Budget ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newReward.budget}
                  onChange={(e) => setNewReward({ ...newReward, budget: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">RPM ($ per 1000 views)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newReward.viewsRequired}
                  onChange={(e) => setNewReward({ ...newReward, viewsRequired: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="0.95"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Cover Image</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={newReward.coverImage}
                    onChange={(e) => setNewReward({ ...newReward, coverImage: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Or paste image URL..."
                  />
                  {newReward.coverImage && (
                    <img
                      src={newReward.coverImage}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg mt-2"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Font Style</label>
                <select
                  value={newReward.fontStyle}
                  onChange={(e) => setNewReward({ ...newReward, fontStyle: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                >
                  <option value="default">Default</option>
                  <option value="bold">Bold</option>
                  <option value="italic">Italic</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Application Questions</label>
                <div className="space-y-2 mb-2">
                  {newReward.questions.map((q, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const updated = [...newReward.questions]
                          updated[index] = e.target.value
                          setNewReward({ ...newReward, questions: updated })
                        }}
                        className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                        placeholder={`Question ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newReward.questions.filter((_, i) => i !== index)
                          setNewReward({ ...newReward, questions: updated })
                        }}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Add a question..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newQuestion.trim()) {
                        setNewReward({ ...newReward, questions: [...newReward.questions, newQuestion] })
                        setNewQuestion('')
                      }
                    }}
                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Resources</label>
                <div className="space-y-2 mb-2">
                  {newReward.resources.map((res, index) => (
                    <div key={index} className="bg-zinc-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={res.title}
                          onChange={(e) => {
                            const updated = [...newReward.resources]
                            updated[index].title = e.target.value
                            setNewReward({ ...newReward, resources: updated })
                          }}
                          className="flex-1 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white text-sm"
                          placeholder="Resource title..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newReward.resources.filter((_, i) => i !== index)
                            setNewReward({ ...newReward, resources: updated })
                          }}
                          className="p-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 ml-2"
                        >
                          ×
                        </button>
                      </div>
                      <textarea
                        value={res.content}
                        onChange={(e) => {
                          const updated = [...newReward.resources]
                          updated[index].content = e.target.value
                          setNewReward({ ...newReward, resources: updated })
                        }}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white resize-none text-sm"
                        rows={2}
                        placeholder="Resource description..."
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Resource title..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newResource.title.trim()) {
                        setNewReward({ ...newReward, resources: [...newReward.resources, { ...newResource }] })
                        setNewResource({ title: '', content: '' })
                      }
                    }}
                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Add Resource
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Update Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Full Screen View */}
      {selectedReward && isCampaignView && (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
          <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 p-4">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <button
                  onClick={() => { setSelectedReward(null); setIsCampaignView(false) }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={20} />
                  Back to Campaigns
                </button>
                <h2 className="text-xl font-bold text-white">{selectedReward.title}</h2>
                <div className="w-20" />
              </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-6">
              {selectedReward.cover_image && (
                <img src={selectedReward.cover_image} alt={selectedReward.title} className="w-full h-64 object-cover rounded-xl mb-6" />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Campaign Details</h3>
                    {selectedReward.description && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">Description</p>
                        <p className="text-gray-300">{selectedReward.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Budget</p>
                        <p className="text-2xl font-bold text-green-400">${selectedReward.budget?.toFixed(2) || '0.00'}</p>
                      </div>
                      {selectedReward.views_required && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">RPM</p>
                          <p className="text-xl font-bold text-blue-400">${selectedReward.views_required?.toFixed(2)} / 1k views</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      {profile?.is_admin ? (
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Update Progress ($)</label>
                          <div className="flex gap-2 mb-3">
                            <input
                              type="number"
                              min="0"
                              max={selectedReward.budget}
                              step="0.01"
                              value={selectedReward.progress || 0}
                              onChange={(e) => setSelectedReward({ ...selectedReward, progress: parseFloat(e.target.value) })}
                              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                              placeholder="0.00"
                            />
                            <button
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('content_rewards')
                                    .update({ progress: selectedReward.progress })
                                    .eq('id', selectedReward.id)
                                  if (error) throw error
                                  fetchData()
                                  alert('Progress updated successfully')
                                } catch (error) {
                                  console.error('Error updating progress:', error)
                                  alert('Failed to update progress')
                                }
                              }}
                              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Progress</span>
                          <span>${(selectedReward.progress || 0).toFixed(2)} / ${selectedReward.budget?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}
                      <div className="w-full bg-zinc-800 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all" 
                          style={{ width: `${(selectedReward.progress || 0) / (selectedReward.budget || 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campaign Templates Section */}
                  {userSubmissions.some(sub => sub.campaign_id === selectedReward.id) && (
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Campaign Resources</h3>
                      {selectedReward.resources && selectedReward.resources.length > 0 ? (
                        <div className="space-y-4">
                          {selectedReward.resources.map((res, index) => (
                            <div key={index} className="bg-zinc-800 rounded-lg p-4">
                              <h4 className="font-medium text-white mb-2">{res.title}</h4>
                              <p className="text-sm text-gray-400">{res.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-zinc-800 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">📋 Campaign Guidelines</h4>
                            <p className="text-sm text-gray-400">Follow these guidelines when creating content for this campaign...</p>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">🎨 Brand Assets</h4>
                            <p className="text-sm text-gray-400">Download logos, fonts, and brand colors...</p>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-2">📊 Performance Tracking</h4>
                            <p className="text-sm text-gray-400">Track your campaign performance and earnings...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {!profile?.is_admin && (
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Apply to Campaign</h3>
                      {userSubmissions.some(s => s.campaign_id === selectedReward.id) ? (
                        <div className="text-center py-4">
                          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="text-green-400" size={32} />
                          </div>
                          <p className="text-yellow-400 font-semibold text-lg mb-2">Pending</p>
                          <p className="text-gray-400 text-sm">You have already applied to this campaign</p>
                        </div>
                      ) : selectedReward.questions && selectedReward.questions.length > 0 ? (
                        <div>
                          <p className="text-xs text-gray-500 mb-3">You can only submit one application per campaign.</p>
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target)
                            const answers = {}
                            selectedReward.questions.forEach((q, i) => {
                              answers[q] = formData.get(`q${i}`)
                            })
                            handleSubmission(selectedReward.id, answers)
                          }} className="space-y-3">
                            {selectedReward.questions.map((q, i) => (
                              <div key={i}>
                                <label className="block text-sm text-gray-400 mb-1">{q}</label>
                                <textarea
                                  name={`q${i}`}
                                  required
                                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white resize-none"
                                  rows={2}
                                  placeholder="Your answer..."
                                />
                              </div>
                            ))}
                            <button
                              type="submit"
                              className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Submit Application
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-400 text-sm mb-4">No application questions required</p>
                          <button
                            onClick={() => handleSubmission(selectedReward.id, {})}
                            className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Join Campaign
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Submission Section - Only for users who have joined and no pending clips */}
                  {!profile?.is_admin && userSubmissions.some(s => s.campaign_id === selectedReward.id) && !videoSubmissions.some(v => v.status === 'pending') && (
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Submit Video</h3>
                      <button
                        onClick={() => setShowVideoSubmitModal(true)}
                        className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Submit New Video
                      </button>
                    </div>
                  )}

                  {/* Show pending clip status */}
                  {!profile?.is_admin && videoSubmissions.some(v => v.status === 'pending') && (
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Video Submission</h3>
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="text-yellow-400" size={32} />
                        </div>
                        <p className="text-yellow-400 font-semibold text-lg mb-2">Pending Review</p>
                        <p className="text-gray-400 text-sm">Your video submission is being reviewed</p>
                      </div>
                    </div>
                  )}

                  {profile?.is_admin && (
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Admin Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={openEditModal}
                          className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Edit Campaign
                        </button>
                        <button
                          onClick={() => handleDeleteReward(selectedReward.id)}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete Campaign
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Submission Modal */}
      {showVideoSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-100">Submit Video</h3>
              <button
                onClick={() => setShowVideoSubmitModal(false)}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleVideoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Video URL</label>
                <input
                  type="url"
                  required
                  value={newVideoSubmission.video_url}
                  onChange={(e) => setNewVideoSubmission({ ...newVideoSubmission, video_url: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="https://www.youtube.com/live/... or any social media link"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Platform</label>
                <select
                  required
                  value={newVideoSubmission.platform}
                  onChange={(e) => setNewVideoSubmission({ ...newVideoSubmission, platform: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                >
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="tiktok">TikTok</option>
                  <option value="threads">Threads</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Submit Video
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Affiliate Detail Modal */}
      {selectedAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-100">{selectedAffiliate.name}</h3>
              <button
                onClick={() => setSelectedAffiliate(null)}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Affiliate Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-gray-100">{selectedAffiliate.email}</p>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-3">Supported Social Media</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['YouTube', 'TikTok', 'Instagram', 'Twitter', 'Twitch', 'Discord'].map(platform => (
                    <div key={platform} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-xs font-bold">{platform[0]}</span>
                      </div>
                      <span className="text-gray-300">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutorials */}
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-3">Tutorials</h4>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300 font-medium">How to link your social accounts</p>
                    <p className="text-gray-400 text-sm mt-1">Step-by-step guide to connect your social media platforms</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300 font-medium">Creating your first campaign</p>
                    <p className="text-gray-400 text-sm mt-1">Learn how to set up and launch successful campaigns</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300 font-medium">Tracking your earnings</p>
                    <p className="text-gray-400 text-sm mt-1">Monitor your performance and payout history</p>
                  </div>
                </div>
              </div>

              {profile?.is_admin && (
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${selectedAffiliate.name}?`)) {
                        handleDeleteAffiliate(selectedAffiliate.id)
                        setSelectedAffiliate(null)
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove Affiliate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Affiliates
