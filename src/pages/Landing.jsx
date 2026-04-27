import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { Zap, BarChart, LayoutDashboard, Clock, BookOpen, Lock, Triangle, Box, GraduationCap, Home, Search, Trophy, CheckCircle, Edit, Trash, Info, HelpCircle, ArrowRight } from '../components/Icons'

const features = [
  { icon: <Zap />, title: 'Smart Quiz Builder', desc: 'Dynamic MCQ builder with custom marks per question and instant publish.', color: '#6366f1' },
  { icon: <BarChart />, title: 'Instant Results', desc: 'Auto-graded with detailed answer review shown the moment students submit.', color: '#22c55e' },
  { icon: <LayoutDashboard />, title: 'Role-Based Portals', desc: 'Dedicated dashboards for teachers and students with unique workflows.', color: '#f59e0b' },
  { icon: <Clock />, title: 'Timed Exams', desc: 'Set per-quiz duration. Auto-submits when time runs out — fair for everyone.', color: '#ec4899' },
  { icon: <BookOpen />, title: '9 Subjects', desc: 'Pre-organized quiz banks across Mathematics, Physics, CS, Biology, and more.', color: '#14b8a6' },
  { icon: <Lock />, title: 'Secure Auth', desc: 'Supabase-powered sign-in with row-level security and encrypted data.', color: '#8b5cf6' },
]

const subjects = [
  { name: 'Mathematics', icon: <Triangle /> }, { name: 'Physics', icon: <Zap /> },
  { name: 'Chemistry', icon: <Box /> }, { name: 'Biology', icon: <Info /> },
  { name: 'Computer Science', icon: <LayoutDashboard /> }, { name: 'History', icon: <BookOpen /> },
  { name: 'Geography', icon: <Home /> }, { name: 'Economics', icon: <BarChart /> },
  { name: 'English', icon: <Edit /> },
]

const P = { padding: '.85rem 1.75rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,.45)', transition: 'opacity .2s' }
const T = { padding: '.85rem 1.75rem', background: 'linear-gradient(135deg,#f59e0b,#ea580c)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,158,11,.35)', transition: 'opacity .2s' }
const G = { padding: '.85rem 1.75rem', background: 'transparent', border: '1.5px solid #334155', borderRadius: 12, color: '#94a3b8', fontFamily: 'inherit', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all .2s' }

export default function Landing() {
  const { user, profile } = useAuth()
  const dashLink = profile?.role === 'teacher' ? '/teacher' : profile?.role === 'student' ? '/student' : '/auth'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: "'Inter',sans-serif", color: '#f1f5f9' }}>
      <Navbar />

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '6rem 1.5rem 4.5rem', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse,rgba(99,102,241,.22) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: 300, height: 300, background: 'radial-gradient(ellipse,rgba(236,72,153,.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '8%', width: 250, height: 250, background: 'radial-gradient(ellipse,rgba(20,184,166,.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '.4rem 1.1rem', background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.35)', borderRadius: 50, fontSize: '.82rem', color: '#a5b4fc', marginBottom: '1.75rem' }}>
            <Zap size={16} /> The Modern Quiz Platform · 100% Free
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4rem)', fontWeight: 900, lineHeight: 1.12, marginBottom: '1.25rem', letterSpacing: '-.02em' }}>
            Quizzes That{' '}
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa,#e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Actually Work
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Quizora gives teachers powerful creation tools and students a smooth, timed exam experience — built for modern classrooms.
          </p>

          {user ? (
            <div style={{ marginBottom: '3rem' }}>
              <Link to={dashLink} style={{ textDecoration: 'none' }}><button style={{...P, display:'flex', alignItems:'center', gap:8}}>Go to My Dashboard <ArrowRight size={18}/></button></Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <Link to="/auth?role=student" style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(99,102,241,.1)', border: '1.5px solid rgba(99,102,241,.4)', borderRadius: 16, padding: '1.5rem 2rem', cursor: 'pointer', transition: 'all .25s', minWidth: 220, textAlign: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(99,102,241,.25)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '.5rem', display: 'flex', justifyContent: 'center', color: '#818cf8' }}><GraduationCap size={48} /></div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#e2e8f0', marginBottom: '.25rem' }}>Start as Student</div>
                    <div style={{ fontSize: '.8rem', color: '#94a3b8', marginBottom: '1rem' }}>Take quizzes and track performance</div>
                    <div style={{ padding: '.5rem 1.2rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>Join Free <ArrowRight size={14} /></div>
                  </div>
                </Link>

                <Link to="/auth?role=teacher" style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(245,158,11,.08)', border: '1.5px solid rgba(245,158,11,.3)', borderRadius: 16, padding: '1.5rem 2rem', cursor: 'pointer', transition: 'all .25s', minWidth: 220, textAlign: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(245,158,11,.18)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '.5rem', display: 'flex', justifyContent: 'center', color: '#f59e0b' }}><LayoutDashboard size={48} /></div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#e2e8f0', marginBottom: '.25rem' }}>Start as Teacher</div>
                    <div style={{ fontSize: '.8rem', color: '#94a3b8', marginBottom: '1rem' }}>Create and manage quizzes</div>
                    <div style={{ padding: '.5rem 1.2rem', background: 'linear-gradient(135deg,#f59e0b,#ea580c)', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>Get Started <ArrowRight size={14} /></div>
                  </div>
                </Link>
              </div>
              <p style={{ color: '#475569', fontSize: '.82rem', marginBottom: '3rem' }}>
                Already have an account?{' '}
                <Link to="/auth" style={{ color: '#818cf8', fontWeight: 600 }}>Sign in here</Link>
              </p>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {[['9+', 'Subjects'], ['100%', 'Free Forever'], [<Zap size={24}/>, 'Instant Results']].map(([num, label], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display:'flex', justifyContent:'center' }}>{num}</div>
                <div style={{ fontSize: '.78rem', color: '#64748b', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLE SPLIT */}
      <section style={{ padding: '5rem 1.5rem', background: 'rgba(30,41,59,.3)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '.5rem' }}>Built for Two Roles</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Different experiences, same platform</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2rem' }}>
            {[
              { icon: <LayoutDashboard />, label: 'For Teachers', tag: 'Full Control', color: '#f59e0b', bg: 'rgba(245,158,11,.06)', bd: 'rgba(245,158,11,.2)', items: ['Create quizzes with dynamic MCQ builder', 'Set duration, marks, pass percentage', 'Schedule quizzes for specific dates', 'View student attempts & scores', 'Analytics: avg score, pass rate'], link: '/auth?role=teacher', btn: T, btnLabel: <><span style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>Create Your First Quiz <ArrowRight size={18}/></span></> },
              { icon: <GraduationCap />, label: 'For Students', tag: 'Track Progress', color: '#818cf8', bg: 'rgba(99,102,241,.06)', bd: 'rgba(99,102,241,.2)', items: ['Browse available quizzes by subject', 'Take timed exams with question navigator', 'See your score instantly on submission', 'Review correct & wrong answers', 'Track your performance history'], link: '/auth?role=student', btn: P, btnLabel: <><span style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>Start Taking Quizzes <ArrowRight size={18}/></span></> },
            ].map(r => (
              <div key={r.label} style={{ background: r.bg, border: `1px solid ${r.bd}`, borderRadius: 20, padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${r.bg}`, border: `1px solid ${r.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: r.color }}>{r.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{r.label}</div>
                    <div style={{ color: r.color, fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.tag}</div>
                  </div>
                </div>
                {r.items.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, marginBottom: '.7rem', fontSize: '.9rem', color: '#cbd5e1' }}>
                    <span style={{ color: r.color, display: 'flex', alignItems: 'center', marginTop: 2 }}><CheckCircle size={14} /></span> {item}
                  </div>
                ))}
                <Link to={r.link} style={{ textDecoration: 'none' }}>
                  <button style={{ ...r.btn, marginTop: '1.25rem', width: '100%' }}>{r.btnLabel}</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '.75rem' }}>Everything You Need</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>A complete platform built for modern classrooms</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
            {features.map(f => (
              <div key={f.title} style={{ background: 'rgba(30,41,59,.8)', border: '1px solid rgba(51,65,85,.8)', borderRadius: 16, padding: '1.75rem', transition: 'transform .2s,border-color .2s,box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = f.color + '66'; e.currentTarget.style.boxShadow = `0 12px 32px ${f.color}20` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(51,65,85,.8)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}1a`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1.25rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '.5rem', color: '#e2e8f0' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section style={{ padding: '4rem 1.5rem', background: 'rgba(30,41,59,.3)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>Available Subjects</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2.5rem' }}>Pre-loaded question banks ready to use</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', justifyContent: 'center' }}>
            {subjects.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '.6rem 1.25rem', background: 'rgba(30,41,59,.9)', border: '1px solid #334155', borderRadius: 50, fontSize: '.9rem', color: '#94a3b8', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(99,102,241,.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(30,41,59,.9)' }}>
                <span>{s.icon}</span> {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1))', border: '1px solid rgba(99,102,241,.3)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 0 80px rgba(99,102,241,.15)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: '#818cf8' }}><GraduationCap size={64} /></div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.75rem' }}>Ready to Get Started?</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>Completely free. No credit card required.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth?role=student" style={{ textDecoration: 'none' }}><button style={{...P, display:'flex', alignItems:'center', gap:8}}>Join as Student <ArrowRight size={18}/></button></Link>
              <Link to="/auth?role=teacher" style={{ textDecoration: 'none' }}><button style={{...T, display:'flex', alignItems:'center', gap:8}}>Join as Teacher <ArrowRight size={18}/></button></Link>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #1e293b', padding: '2rem 1.5rem', textAlign: 'center', color: '#475569', fontSize: '.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6, fontWeight: 700, color: '#64748b', fontSize: '1rem' }}>
          <Zap size={20} color="#818cf8" /> Quizora
        </div>
        <p>© 2025 Quizora. Built for education. All rights reserved.</p>
      </footer>
    </div>
  )
}
