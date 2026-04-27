import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Navbar from '../components/Navbar'
import Skeleton from '../components/Skeleton'
import { BookOpen, BarChart, LogOut, CheckCircle, Clock, Calendar, Search, Filter, Trophy, GraduationCap, ArrowRight, HelpCircle, AlertTriangle, Home } from '../components/Icons'

export default function StudentDashboard() {
  const { profile, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const welcomed = useRef(false)

  const [quizzes, setQuizzes] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('quizzes')

  useEffect(() => {
    fetchData()
    if (!welcomed.current) {
      welcomed.current = true
      setTimeout(() => addToast(`Welcome back, ${profile?.name || 'Student'}!`, 'success', 4000), 500)
    }

    const handleFocus = () => fetchData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch quizzes first — must succeed
      const { data: qData, error: qError } = await supabase
        .from('quizzes')
        .select('*')
        .in('status', ['scheduled', 'active'])
        .order('scheduled_at')
      if (qError) throw qError
      setQuizzes(qData || [])

      // Fetch attempts separately — fail silently if table missing
      try {
        const { data: aData, error: aError } = await supabase
          .from('attempts')
          .select('*')
          .eq('student_id', profile.id)
        if (!aError) setAttempts(aData || [])
      } catch {
        // attempts table may not exist yet — ignore
        setAttempts([])
      }
    } catch(e) {
      addToast('Failed to load quizzes: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const attempted = id => attempts.find(a => a.quiz_id === id)
  const subjects = [...new Set(quizzes.map(q => q.subject))]

  const filtered = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true : filter === 'done' ? !!attempted(q.id) : filter === 'pending' ? !attempted(q.id) : q.subject === filter
    return matchSearch && matchFilter
  })

  const passCount = attempts.filter(a => {
    const quiz = quizzes.find(q => q.id === a.quiz_id)
    return quiz && a.score / (quiz.total_marks || 1) * 100 >= quiz.pass_percentage
  }).length

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', fontFamily:"'Inter',sans-serif", color:'#f1f5f9' }}>
      <Navbar />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 1.5rem 4rem' }}>

        {/* Welcome */}
        <div style={{
          background:'linear-gradient(135deg,rgba(99,102,241,.18),rgba(20,184,166,.08))',
          border:'1px solid rgba(99,102,241,.25)', borderRadius:20,
          padding:'2rem 2.5rem', marginBottom:'2rem',
          display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem',
          backdropFilter:'blur(12px)',
        }}>
          <div>
            <h1 style={{ fontSize:'1.8rem', fontWeight:900, margin:0, letterSpacing:'-.02em', display:'flex', alignItems:'center', gap:12 }}>
              <GraduationCap size={32} color="#818cf8" /> Student Portal
            </h1>
            <p style={{ color:'#94a3b8', marginTop:6, margin:0 }}>
              Welcome back, <strong style={{ color:'#a5b4fc' }}>{profile?.name || 'Student'}</strong>
              {profile?.department ? ` · ${profile.department}` : ''}
              {profile?.semester ? ` · Sem ${profile.semester}` : ''}
              {profile?.roll_number ? ` · ${profile.roll_number}` : ''}
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setActiveTab('quizzes')} style={{ padding:'.6rem 1.2rem', background: activeTab === 'quizzes' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(51,65,85,.6)', border:'none', borderRadius:10, color:'#fff', fontFamily:'inherit', fontWeight:700, cursor:'pointer', fontSize:'.88rem', display:'flex', alignItems:'center', gap:8 }}>
              <BookOpen size={16} /> Quizzes
            </button>
            <button onClick={() => setActiveTab('results')} style={{ padding:'.6rem 1.2rem', background: activeTab === 'results' ? 'linear-gradient(135deg,#22c55e,#10b981)' : 'rgba(51,65,85,.6)', border:'none', borderRadius:10, color:'#fff', fontFamily:'inherit', fontWeight:700, cursor:'pointer', fontSize:'.88rem', display:'flex', alignItems:'center', gap:8 }}>
              <BarChart size={16} /> My Results
            </button>
            <button onClick={logout} style={{ padding:'.6rem 1.1rem', background:'rgba(51,65,85,.6)', border:'1px solid #334155', borderRadius:10, color:'#94a3b8', fontFamily:'inherit', fontWeight:600, cursor:'pointer', fontSize:'.88rem', display:'flex', alignItems:'center', gap:8 }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { icon:<BookOpen size={24}/>, num:quizzes.filter(q=>!attempted(q.id)).length, label:'Available', color:'#6366f1' },
            { icon:<CheckCircle size={24}/>, num:attempts.length, label:'Completed', color:'#22c55e' },
            { icon:<Trophy size={24}/>, num:passCount, label:'Passed', color:'#10b981' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(30,41,59,.8)', border:'1px solid #1e293b', borderRadius:14, padding:'1.25rem', textAlign:'center', backdropFilter:'blur(8px)' }}>
              <div style={{ color:s.color, marginBottom:8, display:'flex', justifyContent:'center' }}>{s.icon}</div>
              <div style={{ fontSize:'2rem', fontWeight:900, color:s.color }}>{s.num}</div>
              <div style={{ fontSize:'.78rem', color:'#64748b', marginTop:2, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.02em' }}>{s.label}</div>
            </div>
          ))}
        </div>


        {/* Tab Content */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'rgba(30,41,59,.5)', border:'1px solid #1e293b', borderRadius:16, padding:'1.5rem' }}>
                <Skeleton width="40%" height="12px" marginBottom="12px" />
                <Skeleton width="90%" height="24px" marginBottom="16px" />
                <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                  <Skeleton width="60px" height="24px" />
                  <Skeleton width="60px" height="24px" />
                </div>
                <Skeleton width="100%" height="40px" borderRadius="10px" />
              </div>
            ))}
          </div>
        ) : activeTab === 'quizzes' ? (
          <>
            {/* Search + Filter */}
            <div style={{ marginBottom:'1.75rem' }}>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748b', display:'flex', alignItems:'center' }}><Search size={18}/></span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search quizzes by title or subject..."
                  style={{ width:'100%', padding:'.75rem 1.1rem .75rem 2.8rem', background:'rgba(30,41,59,.8)', border:'1.5px solid #334155', borderRadius:12, color:'#f1f5f9', fontFamily:'inherit', fontSize:'.95rem', outline:'none', marginBottom:'.85rem', boxSizing:'border-box', transition:'border-color .2s' }}
                  onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#334155'} />
              </div>

              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                {['all','pending','done',...subjects].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding:'.4rem 1rem', borderRadius:50,
                    border:`1.5px solid ${filter===f?'#6366f1':'#334155'}`,
                    background:filter===f?'rgba(99,102,241,.15)':'transparent',
                    color:filter===f?'#e0e7ff':'#64748b',
                    cursor:'pointer', fontFamily:'inherit', fontSize:'.82rem', fontWeight:700, transition:'all .2s',
                    display:'flex', alignItems:'center', gap:6
                  }}>
                    {f==='all' ? <><Search size={14}/> All</> : f==='pending' ? <><Clock size={14}/> Pending</> : f==='done' ? <><CheckCircle size={14}/> Completed</> : f}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'5rem 2rem', color:'#64748b' }}>
                <div style={{ color:'#334155', marginBottom:'1rem', display:'flex', justifyContent:'center' }}><Search size={64}/></div>
                <h3 style={{ color:'#94a3b8', fontWeight:700, marginBottom:'.5rem' }}>No quizzes found</h3>
                <p>{search ? 'Try a different search term' : 'No quizzes in this category yet'}</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
                {filtered.map(quiz => {
                  const att = attempted(quiz.id)
                  const qCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0
                  const pct = att && (quiz.total_marks || 1) > 0 ? Math.round(att.score / (quiz.total_marks || 1) * 100) : 0
                  const pass = att && pct >= quiz.pass_percentage

                  return (
                    <div key={quiz.id} style={{
                      background:'rgba(30,41,59,.85)', border:'1px solid #1e293b',
                      borderRadius:16, padding:'1.5rem',
                      display:'flex', flexDirection:'column', gap:'.85rem',
                      transition:'all .2s', backdropFilter:'blur(8px)',
                      position:'relative', overflow:'hidden',
                    }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(99,102,241,.4)';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(99,102,241,.15)'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#1e293b';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}
                    >
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background: att ? (pass?'linear-gradient(90deg,#22c55e,#10b981)':'linear-gradient(90deg,#ef4444,#dc2626)') : 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius:'16px 16px 0 0' }} />

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <span style={{ fontSize:'.72rem', fontWeight:800, textTransform:'uppercase', color:'#818cf8', letterSpacing:'.06em' }}>{quiz.subject}</span>
                        {att && (
                          <span style={{ fontSize:'.72rem', padding:'.25rem .65rem', borderRadius:20, fontWeight:700, background:pass?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)', color:pass?'#86efac':'#fca5a5', border:`1px solid ${pass?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`, display:'flex', alignItems:'center', gap:4 }}>
                            {pass ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} {pass ? 'Passed' : 'Failed'}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize:'1rem', fontWeight:700, margin:0, lineHeight:1.4, color:'#e2e8f0' }}>{quiz.title}</h3>

                      <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem', fontSize:'.8rem', color:'#64748b' }}>
                        <span style={tag}><Clock size={12}/> {quiz.duration}m</span>
                        <span style={tag}><HelpCircle size={12}/> {qCount} Qs</span>
                        <span style={tag}><Trophy size={12}/> {quiz.total_marks} pts</span>
                        <span style={tag}><CheckCircle size={12}/> Pass: {quiz.pass_percentage}%</span>
                      </div>

                      {quiz.scheduled_at && (
                        <div style={{ fontSize:'.78rem', color:'#64748b', background:'rgba(15,23,42,.6)', padding:'.35rem .75rem', borderRadius:8, display:'flex', alignItems:'center', gap:6, width:'fit-content' }}>
                          <Calendar size={12}/> {new Date(quiz.scheduled_at).toLocaleString()}
                        </div>
                      )}

                      {att && (
                        <div style={{ background:'rgba(15,23,42,.8)', borderRadius:10, padding:'1rem', border:`1px solid ${pass?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)'}` }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ fontSize:'.82rem', color:'#64748b' }}>Your Score</span>
                            <span style={{ fontWeight:900, fontSize:'1.15rem', color:pass?'#22c55e':'#ef4444' }}>
                              {att.score}/{quiz.total_marks}
                            </span>
                          </div>
                          <div style={{ height:6, background:'#1e293b', borderRadius:4, marginTop:8, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, background:pass?'linear-gradient(90deg,#22c55e,#10b981)':'linear-gradient(90deg,#ef4444,#dc2626)', borderRadius:4, transition:'width .5s' }} />
                          </div>
                          <div style={{ fontSize:'.75rem', color:'#64748b', marginTop:4, textAlign:'right' }}>{pct}%</div>
                        </div>
                      )}

                      <div style={{ marginTop:'auto' }}>
                        {att ? (
                          <button onClick={() => navigate('/result', { state: { score: att.score, total_marks: quiz.total_marks, pass_percentage: quiz.pass_percentage, title: quiz.title, subject: quiz.subject, review: att.answers } })} style={{ width:'100%', padding:'.65rem', background:'rgba(51,65,85,.4)', border:'1.5px solid #334155', borderRadius:10, color:'#a5b4fc', fontFamily:'inherit', cursor:'pointer', fontSize:'.88rem', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                            <BarChart size={16} /> View Result
                          </button>
                        ) : (
                          <button onClick={() => navigate(`/quiz/${quiz.id}`)} style={{ width:'100%', padding:'.7rem', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, color:'#fff', fontFamily:'inherit', fontWeight:700, cursor:'pointer', fontSize:'.9rem', transition:'all 0.2s', boxShadow:'0 4px 14px rgba(99,102,241,.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                            onMouseEnter={e=>{e.target.style.opacity='.88'; e.target.style.transform='translateY(-1px)'}} onMouseLeave={e=>{e.target.style.opacity='1'; e.target.style.transform='translateY(0)'}}>
                            Start Quiz <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* Results Tab Content */
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'.5rem' }}>
              <BarChart size={24} color="#22c55e" />
              <h2 style={{ fontSize:'1.4rem', fontWeight:800, margin:0 }}>Your Performance History</h2>
            </div>
            {attempts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'5rem 2rem', background:'rgba(30,41,59,.4)', border:'1.5px dashed #334155', borderRadius:20, color:'#64748b' }}>
                <div style={{ color:'#334155', marginBottom:'1.5rem', display:'flex', justifyContent:'center' }}><BarChart size={64}/></div>
                <h3 style={{ color:'#94a3b8', fontWeight:700, marginBottom:'.5rem' }}>No attempts yet</h3>
                <p>Quizzes you complete will appear here with detailed scores.</p>
                <button onClick={() => setActiveTab('quizzes')} style={{ marginTop:'1.5rem', padding:'.6rem 1.5rem', background:'rgba(99,102,241,.1)', border:'1px solid #6366f1', borderRadius:10, color:'#818cf8', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8, margin:'1.5rem auto 0' }}>
                  <BookOpen size={18}/> Browse Quizzes
                </button>
              </div>
            ) : (
              <div style={{ background:'rgba(30,41,59,.85)', border:'1px solid #1e293b', borderRadius:20, padding:'1.5rem', backdropFilter:'blur(12px)' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid #334155' }}>
                        {['Quiz Title','Subject','Score','Percentage','Result','Date','Action'].map(h => (
                          <th key={h} style={{ textAlign:'left', padding:'1rem', color:'#64748b', fontSize:'.85rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map(a => {
                        const quiz = quizzes.find(q => q.id === a.quiz_id)
                        const pct = a.total_marks > 0 ? Math.round(a.score / a.total_marks * 100) : 0
                        const pass = quiz ? pct >= quiz.pass_percentage : false
                        return (
                          <tr key={a.id} style={{ borderBottom:'1px solid rgba(51,65,85,.3)', transition:'background .2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,.03)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            <td style={{ padding:'1.25rem 1rem', fontWeight:600 }}>{quiz?.title || 'Unknown Quiz'}</td>
                            <td style={{ padding:'1.25rem 1rem', color:'#64748b' }}>{quiz?.subject || '-'}</td>
                            <td style={{ padding:'1.25rem 1rem', fontWeight:700 }}>{a.score}/{a.total_marks}</td>
                            <td style={{ padding:'1.25rem 1rem' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <div style={{ width:60, height:6, background:'#1e293b', borderRadius:4, overflow:'hidden' }}>
                                  <div style={{ height:'100%', width:`${pct}%`, background:pass?'#22c55e':'#ef4444' }} />
                                </div>
                                <span style={{ fontSize:'.85rem', fontWeight:700 }}>{pct}%</span>
                              </div>
                            </td>
                            <td style={{ padding:'1.25rem 1rem' }}>
                              <span style={{ padding:'.3rem .75rem', borderRadius:50, fontSize:'.75rem', fontWeight:800, background:pass?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)', color:pass?'#86efac':'#fca5a5' }}>
                                {pass ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                            <td style={{ padding:'1.25rem 1rem', color:'#64748b', fontSize:'.85rem' }}>{new Date(a.submitted_at).toLocaleDateString()}</td>
                            <td style={{ padding:'1.25rem 1rem' }}>
                              <button onClick={() => navigate('/result', { state: { score: a.score, total_marks: a.total_marks, pass_percentage: quiz?.pass_percentage || 40, title: quiz?.title || 'Quiz', subject: quiz?.subject || '', review: a.answers } })} style={{ padding:'.4rem .8rem', background:'rgba(99,102,241,.1)', border:'1px solid rgba(99,102,241,.3)', borderRadius:8, color:'#a5b4fc', fontSize:'.75rem', fontWeight:700, cursor:'pointer' }}>
                                Details
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const tag = { background:'rgba(30,41,59,.9)', border:'1px solid #334155', borderRadius:6, padding:'.2rem .5rem' }
