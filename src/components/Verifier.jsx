import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function Verifier() {
  const { profile } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAccount, setNewAccount] = useState({ platform: '', username: '', link: '' })
  const [loading, setLoading] = useState(true)
  const [verificationCode, setVerificationCode] = useState(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [videoSubmissions, setVideoSubmissions] = useState([])

  useEffect(() => {
    // Load video submissions from Supabase
    if (profile?.id && !profile.id.startsWith('local_')) {
      loadVideoSubmissions()
      loadSocialAccounts()
    } else {
      // Load accounts from localStorage for local users
      const savedAccounts = localStorage.getItem('social_accounts')
      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts))
      }
      setLoading(false)
    }

    // Pre-load API key to localStorage if available in env
    const envApiKey = import.meta.env.VITE_SOCIAL_FETCH_API_KEY
    console.log('Env API Key check:', envApiKey ? 'Found' : 'Not found')
    
    // Pre-load YouTube API key to localStorage if available in env
    const envYoutubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY
    console.log('Env YouTube API Key check:', envYoutubeApiKey ? 'Found' : 'Not found')
    
    // Hardcode YouTube API key as fallback
    const hardcodedYoutubeKey = 'AIzaSyA7NWd90TxdR1PPDSKZWSPdZiRfb8OzAEQ'
    
    if (envYoutubeApiKey && !localStorage.getItem('YOUTUBE_API_KEY')) {
      localStorage.setItem('YOUTUBE_API_KEY', envYoutubeApiKey)
      console.log('YouTube API key saved to localStorage from env')
    } else if (!localStorage.getItem('YOUTUBE_API_KEY')) {
      localStorage.setItem('YOUTUBE_API_KEY', hardcodedYoutubeKey)
      console.log('YouTube API key saved to localStorage from hardcoded value')
    }
    
    // Hardcode the API key as fallback since env loading isn't working
    const hardcodedKey = 'sfk_QNNJJnuVMglhNAHJOMbpoDUvDDjmhnqEUajTdygcCPrccWufqisJeIPPwRkZmLyr'
    
    if (envApiKey && !localStorage.getItem('SOCIAL_FETCH_API_KEY')) {
      localStorage.setItem('SOCIAL_FETCH_API_KEY', envApiKey)
      console.log('API key saved to localStorage from env')
    } else if (!localStorage.getItem('SOCIAL_FETCH_API_KEY')) {
      localStorage.setItem('SOCIAL_FETCH_API_KEY', hardcodedKey)
      console.log('API key saved to localStorage from hardcoded value')
    }

    setLoading(false)
  }, [profile?.id])

  const loadSocialAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', profile.id)
        .order('connected_at', { ascending: false })
      
      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error loading social accounts:', error)
    }
  }

  const loadVideoSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('video_submissions')
        .select('*')
        .eq('user_id', profile.id)
        .order('submitted_at', { ascending: false })
      
      if (error) throw error
      setVideoSubmissions(data || [])
    } catch (error) {
      console.error('Error loading video submissions:', error)
    }
  }

  // Save accounts to Supabase whenever they change (for authenticated users)
  useEffect(() => {
    if (profile?.id && !profile.id.startsWith('local_')) {
      // Accounts are loaded from Supabase, no need to save to localStorage
      return
    }
    // For local users, still save to localStorage
    localStorage.setItem('social_accounts', JSON.stringify(accounts))
  }, [accounts, profile?.id])

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'bg-gradient-to-br from-purple-600 to-pink-500'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      color: 'bg-red-600'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.67-6.19V12a4.83 4.83 0 0 0 4.83-4.83v-1.48z"/>
        </svg>
      ),
      color: 'bg-black'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'bg-black'
    },
    {
      id: 'threads',
      name: 'Threads',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm0 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      ),
      color: 'bg-gray-800'
    },
  ]

  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setVerificationCode(code)
    return code
  }

  const handleAddAccount = async (e) => {
    e.preventDefault()
    const code = generateVerificationCode()
    const accountWithCode = { 
      ...newAccount, 
      id: Date.now(),
      verificationCode: code,
      verified: false,
      views: 0,
      performance: 0
    }

    // Save to Supabase for authenticated users
    if (profile?.id && !profile.id.startsWith('local_')) {
      try {
        console.log('Saving account to Supabase:', {
          user_id: profile.id,
          platform: newAccount.platform,
          username: newAccount.username
        })
        
        const { data, error } = await supabase
          .from('social_accounts')
          .insert({
            user_id: profile.id,
            platform: newAccount.platform,
            username: newAccount.username,
            followers: 0,
            engagement_rate: 0
          })
          .select()
        
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        console.log('Account saved successfully:', data)
        
        // Reload accounts from Supabase
        await loadSocialAccounts()
      } catch (error) {
        console.error('Error saving account to Supabase:', error)
        alert(`Failed to save account: ${error.message}. Falling back to local storage.`)
        // Fallback to localStorage on error
        setAccounts([...accounts, accountWithCode])
      }
    } else {
      // For local users, save to localStorage
      setAccounts([...accounts, accountWithCode])
    }
    
    setNewAccount({ platform: '', username: '', link: '' })
    setShowAddModal(false)
    setShowVerificationModal(true)
  }

  const handleCheckVerification = async (account) => {
    const platform = platforms.find(p => p.id === account.platform)
    let apiKey = import.meta.env.VITE_SOCIAL_FETCH_API_KEY
    
    if (!apiKey) {
      // Try to get from localStorage as fallback
      apiKey = localStorage.getItem('SOCIAL_FETCH_API_KEY')
    }
    
    // Final fallback to hardcoded key
    if (!apiKey) {
      apiKey = 'sfk_QNNJJnuVMglhNAHJOMbpoDUvDDjmhnqEUajTdygcCPrccWufqisJeIPPwRkZmLyr'
      localStorage.setItem('SOCIAL_FETCH_API_KEY', apiKey)
    }

    try {
      let endpoint = ''
      switch (account.platform) {
        case 'instagram':
          endpoint = `https://api.socialfetch.dev/v1/instagram/profiles/${account.username.replace('@', '')}`
          break
        case 'tiktok':
          endpoint = `https://api.socialfetch.dev/v1/tiktok/profiles/${account.username.replace('@', '')}`
          break
        case 'youtube':
          // Use YouTube Data API instead of Social Fetch
          let youtubeApiKey = localStorage.getItem('YOUTUBE_API_KEY') || import.meta.env.VITE_YOUTUBE_API_KEY
          
          // Hardcoded fallback
          if (!youtubeApiKey) {
            youtubeApiKey = 'AIzaSyA7NWd90TxdR1PPDSKZWSPdZiRfb8OzAEQ'
            localStorage.setItem('YOUTUBE_API_KEY', youtubeApiKey)
          }
          
          if (!youtubeApiKey) {
            throw new Error('YouTube API key not found. Please add VITE_YOUTUBE_API_KEY to environment variables.')
          }
          
          // Try to get channel by username first
          endpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${account.username.replace('@', '')}&key=${youtubeApiKey}`
          break
        case 'twitter':
          endpoint = `https://api.socialfetch.dev/v1/twitter/profiles/${account.username.replace('@', '')}`
          break
        case 'threads':
          endpoint = `https://api.socialfetch.dev/v1/threads/profiles/${account.username.replace('@', '')}`
          break
        default:
          alert('Platform not supported for automatic verification')
          return
      }

      console.log('Fetching from endpoint:', endpoint)
      console.log('API Key:', apiKey.substring(0, 10) + '...')

      // YouTube Data API doesn't need CORS proxy, others do
      let response
      if (account.platform === 'youtube') {
        response = await fetch(endpoint, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        })
      } else {
        // Use CORS proxy to bypass CORS restrictions for other platforms
        const proxyEndpoint = `https://corsproxy.io/?${encodeURIComponent(endpoint + '?t=' + Date.now())}`
        console.log('Proxy endpoint:', proxyEndpoint)

        response = await fetch(proxyEndpoint, {
          headers: { 
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        })
      }

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        
        // For YouTube, try alternative endpoint formats
        if (response.status === 404 && account.platform === 'youtube') {
          console.log('YouTube 404, trying alternative endpoint formats...')
          let youtubeApiKey = localStorage.getItem('YOUTUBE_API_KEY') || import.meta.env.VITE_YOUTUBE_API_KEY
          
          // Hardcoded fallback
          if (!youtubeApiKey) {
            youtubeApiKey = 'AIzaSyA7NWd90TxdR1PPDSKZWSPdZiRfb8OzAEQ'
          }
          
          // Try with @ prefix
          const altEndpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=@${account.username.replace('@', '')}&key=${youtubeApiKey}`
          const altResponse = await fetch(altEndpoint, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
          })
          
          if (altResponse.ok) {
            const data = await altResponse.json()
            console.log('Alternative YouTube endpoint API Response data:', data)
            return processVerificationData(data, account, apiKey)
          }
          
          // Try searching by channel name
          const searchEndpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${account.username.replace('@', '')}&type=channel&key=${youtubeApiKey}`
          const searchResponse = await fetch(searchEndpoint, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
          })
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json()
            console.log('YouTube search API Response data:', searchData)
            if (searchData.items && searchData.items.length > 0) {
              const channelId = searchData.items[0].id.channelId
              const channelEndpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${youtubeApiKey}`
              const channelResponse = await fetch(channelEndpoint, {
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store'
              })
              
              if (channelResponse.ok) {
                const channelData = await channelResponse.json()
                console.log('YouTube channel API Response data:', channelData)
                return processVerificationData(channelData, account, apiKey)
              }
            }
          }
        }
        
        if (response.status === 404) {
          throw new Error(`Profile not found. Please check that the username is correct and the profile exists on ${platform.name}.`)
        }
        throw new Error(`API returned ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Full API Response:', JSON.stringify(data, null, 2))
      console.log('Available fields:', Object.keys(data))
      
      // For YouTube, if no results found, try search fallback
      if (account.platform === 'youtube' && data.pageInfo && data.pageInfo.totalResults === 0) {
        console.log('YouTube channel not found by username, trying search...')
        let youtubeApiKey = localStorage.getItem('YOUTUBE_API_KEY') || import.meta.env.VITE_YOUTUBE_API_KEY
        
        // Hardcoded fallback
        if (!youtubeApiKey) {
          youtubeApiKey = 'AIzaSyA7NWd90TxdR1PPDSKZWSPdZiRfb8OzAEQ'
        }
        
        // Try searching by channel name
        const searchEndpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${account.username.replace('@', '')}&type=channel&key=${youtubeApiKey}`
        const searchResponse = await fetch(searchEndpoint, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          console.log('YouTube search API Response data:', searchData)
          if (searchData.items && searchData.items.length > 0) {
            const channelId = searchData.items[0].id.channelId
            const channelEndpoint = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${youtubeApiKey}`
            const channelResponse = await fetch(channelEndpoint, {
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store'
            })
            
            if (channelResponse.ok) {
              const channelData = await channelResponse.json()
              console.log('YouTube channel API Response data:', channelData)
              return processVerificationData(channelData, account, apiKey)
            }
          }
        }
      }
      
      return processVerificationData(data, account, apiKey)
    } catch (error) {
      console.error('Verification check failed:', error)
      if (error.message.includes('Failed to fetch')) {
        alert('Network error: Could not connect to verification service. Please check your internet connection and try again.')
      } else {
        alert(error.message || 'Verification check failed. Please try again later.')
      }
    }
  }

  const processVerificationData = (data, account, apiKey) => {
      
      // Check if verification code exists in bio or description
      // TikTok uses data.profile.bio structure, Instagram may differ
      // YouTube Data API uses data.items[0].snippet.description
      let bio = ''
      
      // YouTube Data API specific format
      if (account.platform === 'youtube' && data.items && data.items.length > 0) {
        bio = data.items[0].snippet.description || ''
        console.log('YouTube description extracted:', bio)
      }
      
      // Try direct fields (for other platforms)
      if (!bio) {
        bio = data.bio || data.description || data.signature || data.bio_text || ''
      }
      
      // Try nested in data object
      if (!bio && data.data) {
        bio = data.data.bio || data.data.description || data.data.signature || data.data.bio_text || ''
      }
      
      // Try nested in user object
      if (!bio && data.user) {
        bio = data.user.bio || data.user.signature || data.user.description || ''
      }
      
      // Try nested in data.user object
      if (!bio && data.data?.user) {
        bio = data.data.user.bio || data.data.user.signature || data.data.user.description || ''
      }
      
      // Try TikTok specific structure: data.profile.bio
      if (!bio && data.profile) {
        bio = data.profile.bio || data.profile.description || ''
      }
      
      // Try data.data.profile.bio (some APIs double nest)
      if (!bio && data.data?.profile) {
        bio = data.data.profile.bio || data.data.profile.description || ''
      }
      
      // Try Instagram specific structure: data.data.biography
      if (!bio && data.data?.biography) {
        bio = data.data.biography || ''
      }
      
      // Try other common Instagram fields
      if (!bio && data.biography) {
        bio = data.biography || ''
      }
      
      console.log('Bio fields checked:', {
        directBio: !!data.bio,
        directDescription: !!data.description,
        dataBio: !!data.data?.bio,
        dataDescription: !!data.data?.description,
        profileBio: !!data.profile?.bio,
        dataProfileBio: !!data.data?.profile?.bio,
        dataBiography: !!data.data?.biography,
        biography: !!data.biography,
        finalBio: bio
      })
      
      if (!bio) {
        alert(`No bio or description found for ${account.username}. Please make sure your profile has a bio and post the verification code "${account.verificationCode}" in it.`)
        return
      }
      
      const codeFound = bio.includes(account.verificationCode)

      if (codeFound) {
        setAccounts(accounts.map(acc => 
          acc.id === account.id ? { ...acc, verified: true } : acc
        ))
        alert('Account verified successfully!')
      } else {
        alert(`Verification code not found in profile. Please make sure you've posted "${account.verificationCode}" in your bio.`)
      }
  }

  const handleDeleteAccount = (id) => {
    setAccounts(accounts.filter(acc => acc.id !== id))
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Accounts</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const platformAccounts = accounts.filter(acc => acc.platform === platform.id)
          const Icon = platform.icon

          return (
            <div 
              key={platform.id} 
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 cursor-pointer hover:border-zinc-700 transition-all"
              onClick={() => {
                if (platformAccounts.length > 0) {
                  setSelectedAccount(platformAccounts[0])
                  setShowVerificationModal(true)
                } else {
                  setShowAddModal(true)
                  setNewAccount({ ...newAccount, platform: platform.id })
                }
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 ${platform.color} rounded-lg`}>
                  <div className="text-white w-6 h-6">
                    {Icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white">{platform.name}</h3>
              </div>

              <div className="space-y-2">
                {platformAccounts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No accounts added</p>
                ) : (
                  platformAccounts.map((account) => (
                    <div key={account.id} className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${platform.color} rounded-lg`}>
                          <div className="text-white w-4 h-4">
                            {Icon}
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{account.username}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {account.verified ? (
                              <span className="text-green-400 text-xs">✓ Verified</span>
                            ) : (
                              <>
                                <span className="text-yellow-400 text-xs">Pending verification</span>
                                <span className="bg-zinc-700 text-gray-300 text-xs px-2 py-0.5 rounded">Code: {account.verificationCode}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCheckVerification(account)
                                  }}
                                  className="text-blue-400 text-xs hover:underline"
                                >
                                  Check Verification
                                </button>
                              </>
                            )}
                            <span className="text-gray-500 text-xs">• {account.followers?.toLocaleString() || 0} followers</span>
                            <span className="text-gray-500 text-xs">• {account.views?.toLocaleString() || 0} views</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAccount(account.id)
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Video Submissions Section */}
      {videoSubmissions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Submitted Videos</h3>
          <div className="space-y-3">
            {videoSubmissions.map((submission) => (
              <div key={submission.id} className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                <div className="flex items-center justify-between">
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
                    </div>
                    <a 
                      href={submission.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:underline block truncate"
                    >
                      {submission.video_url}
                    </a>
                    <p className="text-gray-500 text-xs mt-1">
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Account</h3>
            
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Platform</label>
                <select
                  required
                  value={newAccount.platform}
                  onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                >
                  <option value="">Select platform...</option>
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Profile Link (Optional)</label>
                <input
                  type="url"
                  value={newAccount.link}
                  onChange={(e) => setNewAccount({ ...newAccount, link: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white"
                  placeholder="https://..."
                />
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
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Code Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedAccount ? 'Account Details' : 'Verify Your Account'}
              </h3>
              <button
                onClick={() => {
                  setShowVerificationModal(false)
                  setSelectedAccount(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            {selectedAccount ? (
              <div className="space-y-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Username</p>
                  <p className="text-white font-medium">@{selectedAccount.username}</p>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Verification Status</p>
                  <p className={`font-medium ${selectedAccount.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selectedAccount.verified ? '✓ Verified' : 'Pending Verification'}
                  </p>
                </div>
                
                {selectedAccount.verificationCode && !selectedAccount.verified && (
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Your verification code:</p>
                    <div className="bg-zinc-900 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-white tracking-widest">{selectedAccount.verificationCode}</p>
                    </div>
                  </div>
                )}
                
                {!selectedAccount.verified && (
                  <button
                    onClick={() => handleCheckVerification(selectedAccount)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Check Verification
                  </button>
                )}
                
                <button
                  onClick={() => handleDeleteAccount(selectedAccount.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Your verification code:</p>
                  <div className="bg-zinc-900 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-white tracking-widest">{verificationCode}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-400">
                  <p>To verify your account ownership:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Post this code on your social media profile (bio, story, or post)</li>
                    <li>Make the post public for at least 24 hours</li>
                    <li>We'll detect the code and verify your account automatically</li>
                  </ol>
                  <p className="text-yellow-400 text-xs mt-4">Note: This code is unique to your account. Do not share it with others.</p>
                </div>
                
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="w-full mt-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  I've Posted the Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Verifier
