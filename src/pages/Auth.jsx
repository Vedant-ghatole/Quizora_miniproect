import { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Zap, Lock, AlertTriangle, GraduationCap, LayoutDashboard, Eye, EyeOff, Shield } from '../components/Icons'

export default function Auth() {
  const { user, profile, loading, login, signup } = useAuth()
  const { addToast } = useToast()
  const [searchParams] = useSearchParams()

  const [tab, setTab] = useState('login')
  const [role, setRole] = useState(searchParams.get('role') || 'student')
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', name: '',
    institution: '', department: '', semester: '',
    roll_number: '', class_code: '',
  })

  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'teacher' || r === 'student') setRole(r)
  }, [searchParams])

  if (!loading && user && profile) {
    return <Navigate to={profile.role === 'teacher' ? '/teacher' : '/student'} replace />
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  function switchTab(t) { setTab(t); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setFormLoading(true)
    try {
      if (tab === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        if (!form.name.trim()) { setError('Full name is required.'); return }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
        const result = await signup({ ...form, role })
        if (result.autoRedirected) {
          addToast(`Welcome to Quizora, ${form.name.trim()}!`, 'success', 6000)
          return
        } else {
          addToast('Account created! Check your email for verification, then sign in.', 'info', 8000)
          switchTab('login')
          setForm(prev => ({ ...prev, password: '', name: '' }))
        }
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong.'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const inp = { width: '100%', padding: '.72rem 1rem', background: 'rgba(15,23,42,.8)', border: '1.5px solid #334155', borderRadius: 10, color: '#f1f5f9', fontFamily: 'inherit', fontSize: '.95rem', outline: 'none', transition: 'border-color .2s,box-shadow .2s', boxSizing: 'border-box', marginTop: '.35rem' }
  const lbl = { display: 'block', fontSize: '.82rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '.02em' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', overflow: 'hidden', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse,rgba(99,102,241,.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(ellipse,rgba(139,92,246,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Zap size={32} color="#818cf8" />
            <span style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg,#818cf8,#a78bfa,#e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quizora</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '.88rem', margin: 0 }}>The modern quiz platform for education</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(30,41,59,.85)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 20, padding: '2.25rem', backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,.5)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '1.75rem', background: 'rgba(15,23,42,.6)', borderRadius: 12, padding: 5 }}>
            <button onClick={() => switchTab('login')} style={{ flex: 1, padding: '.65rem', border: 'none', background: tab === 'login' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent', color: tab === 'login' ? '#fff' : '#64748b', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', transition: 'all .25s', boxShadow: tab === 'login' ? '0 4px 12px rgba(99,102,241,.4)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Lock size={16} /> Sign In
            </button>
            <button onClick={() => switchTab('signup')} style={{ flex: 1, padding: '.65rem', border: 'none', background: tab === 'signup' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent', color: tab === 'signup' ? '#fff' : '#64748b', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', transition: 'all .25s', boxShadow: tab === 'signup' ? '0 4px 12px rgba(99,102,241,.4)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Zap size={16} /> Create Account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', borderRadius: 10, padding: '.85rem 1rem', marginBottom: '1.25rem', fontSize: '.88rem', display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {tab === 'signup' && (
              <>
                {/* Role selector */}
                <div>
                  <div style={lbl}>I am a...</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '.85rem .5rem', border: `2px solid ${role === 'student' ? '#6366f1' : '#334155'}`, background: role === 'student' ? 'rgba(99,102,241,.12)' : 'rgba(15,23,42,.5)', color: role === 'student' ? '#e0e7ff' : '#64748b', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, transition: 'all .2s', fontSize: '.88rem', boxShadow: role === 'student' ? '0 0 0 3px rgba(99,102,241,.2)' : 'none' }}>
                      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><GraduationCap size={24} /></div>
                      <div>Student</div>
                      <div style={{ fontSize: '.72rem', color: role === 'student' ? '#a5b4fc' : '#475569', fontWeight: 500, marginTop: 2 }}>Take quizzes</div>
                    </button>
                    <button type="button" onClick={() => setRole('teacher')} style={{ flex: 1, padding: '.85rem .5rem', border: `2px solid ${role === 'teacher' ? '#6366f1' : '#334155'}`, background: role === 'teacher' ? 'rgba(99,102,241,.12)' : 'rgba(15,23,42,.5)', color: role === 'teacher' ? '#e0e7ff' : '#64748b', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, transition: 'all .2s', fontSize: '.88rem', boxShadow: role === 'teacher' ? '0 0 0 3px rgba(99,102,241,.2)' : 'none' }}>
                      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><LayoutDashboard size={24} /></div>
                      <div>Teacher</div>
                      <div style={{ fontSize: '.72rem', color: role === 'teacher' ? '#a5b4fc' : '#475569', fontWeight: 500, marginTop: 2 }}>Create quizzes</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={lbl}>Full Name *</label>
                  <input style={inp} name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }} />
                </div>

                <div>
                  <label style={lbl}>Institution</label>
                  <input style={inp} name="institution" type="text" placeholder="College / University name" value={form.institution} onChange={handleChange}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }} />
                </div>

                {role === 'student' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[{ name: 'department', label: 'Department', ph: 'e.g. CSE' }, { name: 'semester', label: 'Semester', ph: 'e.g. 4' }].map(f => (
                      <div key={f.name}>
                        <label style={lbl}>{f.label}</label>
                        <input style={inp} name={f.name} type="text" placeholder={f.ph} value={form[f.name]} onChange={handleChange}
                          onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)' }}
                          onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }} />
                      </div>
                    ))}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={lbl}>Roll Number</label>
                      <input style={inp} name="roll_number" type="text" placeholder="Your roll number" value={form.roll_number} onChange={handleChange}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)' }}
                        onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }} />
                    </div>
                  </div>
                )}

                {role === 'teacher' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={lbl}>Department</label>
                      <input style={inp} name="department" type="text" placeholder="e.g. CSE" value={form.department} onChange={handleChange}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)' }}
                        onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }} />
                    </div>
                    <div>
                      <label style={lbl}>Class Code</label>
                      <input style={inp} name="class_code" type="text" placeholder="e.g. CSE2024" value={form.class_code} onChange={handleChange}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)' }}
                        onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }} />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email */}
            <div>
              <label style={lbl}>Email Address *</label>
              <input style={inp} name="email" type="email" placeholder="Use your college email" value={form.email} onChange={handleChange} required
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)' }}
                onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }} />
            </div>

            {/* Password with show toggle */}
            <div>
              <label style={lbl}>Password * {tab === 'signup' ? '(min 6 chars)' : ''}</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inp, paddingRight: '3rem' }} name="password" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange} required
                  minLength={tab === 'signup' ? 6 : undefined}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#64748b', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={formLoading} style={{ width: '100%', padding: '.9rem', background: formLoading ? '#4338ca' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', cursor: formLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity .2s', marginTop: 4, boxShadow: '0 4px 20px rgba(99,102,241,.4)' }}>
              {formLoading ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                tab === 'login' ? <><Lock size={18} /> Sign In</> : <><Zap size={18} /> Create Account</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#475569', fontSize: '.87rem', marginTop: '1.5rem', marginBottom: 0 }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, padding: 0, fontSize: '.87rem' }}>
              {tab === 'login' ? 'Sign up free →' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '.76rem', color: '#334155', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Shield size={14} /> Secured by Supabase Auth · All data encrypted
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
