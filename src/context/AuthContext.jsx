import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return data || null
    } catch {
      return null
    }
  }

  function redirectByRole(role) {
    if (role === 'teacher') navigate('/teacher', { replace: true })
    else if (role === 'student') navigate('/student', { replace: true })
    else navigate('/', { replace: true })
  }

  useEffect(() => {
    let mounted = true
    const timeout = setTimeout(() => { if (mounted) setLoading(false) }, 6000)

    // Initial session fetch
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      clearTimeout(timeout)
      if (session?.user) {
        setUser(session.user)
        const prof = await fetchProfile(session.user.id)
        if (mounted) setProfile(prof)
      }
      if (mounted) setLoading(false)
    }).catch(() => {
      if (mounted) { clearTimeout(timeout); setLoading(false) }
    })

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // If profile is already set (e.g. from login function), don't re-fetch
        setProfile(prev => {
          if (prev?.id === session.user.id) return prev
          fetchProfile(session.user.id).then(prof => {
            if (mounted) setProfile(prof)
          })
          return null // Show loading state via null profile while fetching
        })
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  // ─── SIGNUP ─────────────────────────────────────────────────────────────────
  async function signup({ email, password, name, role, institution, department, semester, roll_number, class_code }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    })
    if (error) throw error

    const userId = data.user?.id
    if (!userId) throw new Error('Signup failed — no user returned.')

    // Step 1: Insert full profile row (trigger may have created a basic one first)
    const profileData = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      institution: institution || '',
      department: department || '',
      semester: semester || '',
      roll_number: roll_number || '',
      class_code: class_code || '',
    }

    // Try upsert — this works whether the trigger already created the row or not
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (profileError) {
      // Fallback: trigger may have created the row but RLS blocks insert
      // Try update instead
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          institution: institution || '',
          department: department || '',
          semester: semester || '',
          roll_number: roll_number || '',
          class_code: class_code || '',
          role,
        })
        .eq('id', userId)

      if (updateError) {
        console.warn('Profile update also failed:', updateError.message)
      }
    }

    // If Supabase auto-confirmed (no email verification) → session exists → redirect
    if (data.session) {
      setUser(data.user)
      setProfile(profileData)
      redirectByRole(role)
      return { ...data, autoRedirected: true }
    }

    // Email verification required — caller handles UI message
    return { ...data, autoRedirected: false, profileData }
  }

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const prof = await fetchProfile(data.user.id)
    setUser(data.user)
    setProfile(prof)
    setLoading(false)
    redirectByRole(prof?.role)
    return data
  }

  // ─── LOGOUT ─────────────────────────────────────────────────────────────────
  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    navigate('/auth', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
