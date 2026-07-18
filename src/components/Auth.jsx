import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, MailCheck, CheckCircle, X } from 'lucide-react'

function Auth({ onBack, initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailSent, setShowEmailSent] = useState(false)
  const [showVerified, setShowVerified] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const { signIn, signUp } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  // Check if user was redirected after email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('verified') === 'true') {
      setShowVerified(true)
      setIsLogin(true)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Allow username-only format for local accounts
    const isLocalAccount = /^[a-zA-Z0-9_]+$/.test(formData.email)
    
    if (!isLocalAccount && !formData.email.includes('@')) {
      setError('Please include an "@" in the email address')
      setLoading(false)
      return
    }

    // Restrict @lcstudio.com domain with admin_ prefix to admin-created accounts only
    if (!isLocalAccount && formData.email.match(/^admin_\d+@lcstudio\.com$/)) {
      setError('Only admin-created accounts can use this email format')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
      } else {
        const { data, error } = await signUp(formData.email, formData.password, formData.fullName)
        if (error) {
          // Check for duplicate email error
          if (error.message?.toLowerCase().includes('already registered') || 
              error.message?.toLowerCase().includes('already been registered') || 
              error.message?.toLowerCase().includes('user already registered') ||
              error.message?.toLowerCase().includes('duplicate') ||
              error.message?.toLowerCase().includes('email already exists')) {
            setError('This email is already taken')
          } else if (error.message?.toLowerCase().includes('username')) {
            setError('This username is already taken')
          } else {
            throw error
          }
        } else {
          // Show email sent message if email confirmation is required
          if (data?.user && !data.user.email_confirmed_at) {
            setShowEmailSent(true)
          }
        }
      }
    } catch (error) {
      // Mask rate limit errors with a friendly message
      if (error.message?.includes('rate limit') || error.message?.includes('rate')) {
        setError('Website Under heavy load. Please try again later.')
      } else {
        setError(error.message || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on backdrop (not on modal content)
    // and not when text is selected
    if (e.target === e.currentTarget && onBack && window.getSelection().toString() === '') {
      handleClose()
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onBack) onBack()
    }, 200)
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur - black background */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md"></div>
      
      {/* Modal */}
      <div 
        className={`relative bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-200 border border-zinc-800 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {onBack && !showEmailSent && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {showVerified ? (
          <>
            <div className="text-center mb-8">
              <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
              <h1 className="text-3xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-gray-400">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
            </div>

            <button
              onClick={() => {
                setShowVerified(false)
                setIsLogin(true)
                setError('')
              }}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Sign In
            </button>
          </>
        ) : showEmailSent ? (
          <>
            <div className="text-center mb-8">
              <MailCheck className="mx-auto mb-4 text-green-400" size={48} />
              <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-gray-400">
                We sent a confirmation link to {formData.email}
              </p>
              <p className="text-gray-400 mt-2 text-sm">
                Click the link in the email to verify your account, then sign in.
              </p>
            </div>

            <button
              onClick={() => {
                setShowEmailSent(false)
                setIsLogin(true)
                setError('')
              }}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go to Sign In
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">LC Studio</h1>
              <p className="text-gray-400">
                {isLogin ? 'Welcome back! Please sign in' : 'Register your account'}
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-500"
                      placeholder="username"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isLogin ? 'Email or Username' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={isLogin ? 'text' : 'email'}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-500"
                    placeholder={isLogin ? 'username or you@example.com' : 'you@example.com'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-white hover:text-gray-300 font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Auth
