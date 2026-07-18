import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Verifier() {
  const { profile } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAccount, setNewAccount] = useState({ platform: '', username: '', link: '' })
  const [loading, setLoading] = useState(true)
  const [verificationCode, setVerificationCode] = useState(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  useEffect(() => {
    // Skip Supabase fetch for local users
    if (profile?.id?.startsWith('local_')) {
      setLoading(false)
      return
    }

    setLoading(false)
  }, [profile?.id])

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
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600'
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

  const handleAddAccount = (e) => {
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
    setAccounts([...accounts, accountWithCode])
    setNewAccount({ platform: '', username: '', link: '' })
    setShowAddModal(false)
    setShowVerificationModal(true)
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
                  window.open(platformAccounts[0].link, '_blank')
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
                              </>
                            )}
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
      {showVerificationModal && verificationCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Verify Your Account</h3>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
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
        </div>
      )}
    </div>
  )
}

export default Verifier
