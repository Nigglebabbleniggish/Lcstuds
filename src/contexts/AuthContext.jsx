import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Check for local user session first
    const localUserStr = localStorage.getItem('localUser')
    if (localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr)
        setUser({
          id: localUser.id,
          email: localUser.email,
          user_metadata: {
            username: localUser.username,
            is_admin: localUser.is_admin,
            admin_id: localUser.admin_id
          }
        })
        setProfile({
          id: localUser.id,
          full_name: localUser.username,
          username: localUser.username,
          is_admin: localUser.is_admin,
          admin_id: localUser.admin_id
        })
        setLoading(false)
        // Don't set up Supabase listeners for local users
        return () => {}
      } catch (error) {
        console.error('Error parsing local user:', error)
        localStorage.removeItem('localUser')
      }
    }

    // Set a timeout to ensure loading is always set to false
    const timeoutId = setTimeout(() => {
      console.log('Auth timeout - setting loading to false')
      setLoading(false)
    }, 5000)

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeoutId)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    }).catch((error) => {
      console.error('Error getting session:', error)
      clearTimeout(timeoutId)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  // Real-time ban status check
  useEffect(() => {
    // Skip ban check for local users
    if (user?.id?.startsWith('local_')) {
      return () => {}
    }

    const checkBanStatus = setInterval(async () => {
      if (user && profile) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single()

        if (currentProfile?.status === 'banned') {
          await supabase.auth.signOut()
          window.location.href = '/?banned=true'
        }
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(checkBanStatus)
  }, [user, profile])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email, password, username) => {
    // Check if email already exists in profiles
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return { data: null, error: { message: 'This email is already taken' } }
    }

    // Check if username already exists in profiles
    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return { data: null, error: { message: 'This username is already taken' } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: `${window.location.origin}?verified=true`
      }
    })
    // If email verification is not enabled, user will be created immediately
    return { data, error }
  }

  const signIn = async (email, password) => {
    // Check if this is a local user (username format)
    const usernameMatch = email.match(/^([a-zA-Z0-9_]+)$/)
    let username = null
    
    if (usernameMatch) {
      username = email
    } else {
      // Regular users - extract username from email
      username = email.split('@')[0]
    }

    // Try local auth first
    try {
      const response = await fetch('/Lcstuds/local-users.json')
      const localUsers = await response.json()
      
      if (localUsers[username]) {
        const user = localUsers[username]
        
        // Check password
        if (user.password === password) {
          // Store local user in localStorage for persistence
          localStorage.setItem('localUser', JSON.stringify({
            id: `local_${username}`,
            email: username,
            username: user.username,
            is_admin: user.isAdmin,
            admin_id: user.adminId
          }))
          
          // Return mock user data
          return { 
            data: { 
              user: { 
                id: `local_${username}`,
                email: username,
                user_metadata: {
                  username: user.username,
                  is_admin: user.isAdmin,
                  admin_id: user.adminId
                }
              } 
            }, 
            error: null 
          }
        } else {
          return { data: null, error: { message: 'Invalid password' } }
        }
      }
    } catch (error) {
      console.log('Could not check local users:', error)
    }

    // Fall back to Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { data, error }

    // Check account status after successful sign in
    if (data?.user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile status:', profileError)
        } else if (profile) {
          if (profile.status === 'banned') {
            await supabase.auth.signOut()
            return { data: null, error: { message: 'Your account has been banned. Please contact support.' } }
          }
          if (profile.status === 'suspended') {
            await supabase.auth.signOut()
            return { data: null, error: { message: 'Your account has been suspended. Please contact support.' } }
          }
        }
      } catch (error) {
        console.error('Error checking account status:', error)
      }
    }

    return { data, error }
  }

  const signOut = async () => {
    // Clear local user session if exists
    localStorage.removeItem('localUser')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
