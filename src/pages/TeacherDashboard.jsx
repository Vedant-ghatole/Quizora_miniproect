import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Navbar from '../components/Navbar'
import Skeleton from '../components/Skeleton'
import { LayoutDashboard, Plus, BarChart, LogOut, Edit, Trash, CheckCircle, Clock, Calendar, BookOpen, ArrowLeft, Trophy, Info, HelpCircle, GraduationCap } from '../components/Icons'

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Computer Science','History','Geography','Economics','English']
const emptyQ = () => ({ question:'', options:['','','',''], correct_answer:'A', marks:1 })
const emptyForm = { title:'', description:'', subject:'Mathematics', duration:30, pass_percentage:40, scheduled_at:'' }

export default function TeacherDashboard() {
  const { profile, logout } = useAuth()
  const { addToast } = useToast()
  const welcomed = useRef(false)

  const [quizzes, setQuizzes] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [questions, setQuestions] = useState([emptyQ()])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('quizzes')

  useEffect(() => {
    fetchQuizzes()
    if (!welcomed.current) {
      welcomed.current = true
      setTimeout(() => addToast(`Welcome back, Prof. ${profile?.name?.split(' ')[0] || ''}!`, 'success', 4000), 500)
    }

    const handleFocus = () => fetchQuizzes()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function fetchQuizzes() {
    if (!profile?.id) return
    setLoadingQuizzes(true)
    try {
      const { data, error } = await supabase
        .from('quizzes').select('*').eq('teacher_id', profile.id).order('created_at', { ascending: false })
      if (error) throw error
      setQuizzes(data || [])
      // fetch attempts for analytics
      const { data: aData, error: aError } = await supabase
        .from('attempts')
        .select(`*, quizzes!inner(title, subject, teacher_id)`)
        .eq('quizzes.teacher_id', profile.id);
      
      if (!aError) {
        setAttempts(aData || [])
      }
    } catch (err) { addToast('Failed to load quizzes: ' + err.message, 'error') }
    finally { setLoadingQuizzes(false) }
  }

  function startEdit(quiz) {
    setEditingId(quiz.id)
    setForm({ title: quiz.title, description: quiz.description || '', subject: quiz.subject, duration: quiz.duration, pass_percentage: quiz.pass_percentage, scheduled_at: quiz.scheduled_at ? quiz.scheduled_at.slice(0,16) : '' })
    setQuestions(Array.isArray(quiz.questions) && quiz.questions.length > 0 ? quiz.questions : [emptyQ()])
    setActiveTab('create')
  }

  async function toggleStatus(quiz) {
    const next = quiz.status === 'scheduled' ? 'active' : quiz.status === 'active' ? 'closed' : 'scheduled'
    try {
      const { error } = await supabase.from('quizzes').update({ status: next }).eq('id', quiz.id)
      if (error) throw error
      setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, status: next } : q))
      addToast(`Quiz set to "${next}"`, 'success')
    } catch (err) { addToast('Status update failed: ' + err.message, 'error') }
  }

  function handleFormChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }
  function handleQChange(i, f, v) { setQuestions(prev => prev.map((q, j) => j === i ? { ...q, [f]: v } : q)) }
  function handleOptChange(qi, oi, v) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q
      const opts = [...q.options]; opts[oi] = v; return { ...q, options: opts }
    }))
  }

  async function handleSaveQuiz(e) {
    e.preventDefault()
    if (!form.title.trim()) { addToast('Quiz title is required', 'error'); return }
    if (questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))) {
      addToast('All question texts and options must be filled', 'error'); return
    }
    setSaving(true)
    try {
      const totalMarks = questions.reduce((s, q) => s + Number(q.marks), 0)
      const payload = { ...form, duration: Number(form.duration), pass_percentage: Number(form.pass_percentage), total_marks: totalMarks, scheduled_at: form.scheduled_at || null, questions }
      if (editingId) {
        const { error } = await supabase.from('quizzes').update(payload).eq('id', editingId)
        if (error) throw error
        addToast(`Quiz updated!`, 'success')
      } else {
        const { error } = await supabase.from('quizzes').insert({ teacher_id: profile.id, ...payload, status: 'scheduled' })
        if (error) throw error
        addToast(`Quiz "${form.title}" created!`, 'success')
      }
      setForm(emptyForm); setQuestions([emptyQ()]); setEditingId(null); setActiveTab('quizzes')
      fetchQuizzes()
    } catch (err) { addToast('Failed to save: ' + err.message, 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id)
      if (error) throw error
      setQuizzes(prev => prev.filter(q => q.id !== id))
      addToast('Quiz deleted.', 'info')
    } catch (err) { addToast('Delete failed: ' + err.message, 'error') }
    finally { setDeletingId(null) }
  }

  const OL = ['A','B','C','D']
  const totalQ = quizzes.reduce((s, q) => s + (Array.isArray(q.questions) ? q.questions.length : 0), 0)
  const totalAttempts = attempts.length
  const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + (a.total_marks > 0 ? a.score / a.total_marks * 100 : 0), 0) / totalAttempts) : 0
  const passCount = attempts.filter(a => { const q = quizzes.find(q => q.id === a.quiz_id); return q && a.total_marks > 0 && (a.score / a.total_marks * 100) >= q.pass_percentage }).length
  const passRate = totalAttempts > 0 ? Math.round(passCount / totalAttempts * 100) : 0

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', fontFamily:"'Inter',sans-serif", color:'#f1f5f9' }}>
      <Navbar />

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 1.5rem 4rem' }}>

        {/* Welcome banner */}
        <div style={{
          background:'linear-gradient(135deg,rgba(99,102,241,.18),rgba(139,92,246,.12))',
          border:'1px solid rgba(99,102,241,.25)', borderRadius:20,
          padding:'2rem 2.5rem', marginBottom:'2rem',
          display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem',
          backdropFilter:'blur(12px)',
        }}>
          <div>
            <h1 style={{ fontSize:'1.8rem', fontWeight:900, margin:0, letterSpacing:'-.02em', display:'flex', alignItems:'center', gap:12 }}>
              <LayoutDashboard size={32} color="#818cf8" /> Teacher Portal
            </h1>
            <p style={{ color:'#94a3b8', marginTop:6, margin:0 }}>
              Welcome back, <strong style={{ color:'#a5b4fc' }}>{profile?.name || 'Teacher'}</strong>
              {profile?.institution ? ` · ${profile.institution}` : ''}
              {profile?.class_code ? ` · Class: ${profile.class_code}` : ''}
            </p>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={() => { if (activeTab === 'create') { setEditingId(null); setForm(emptyForm); setQuestions([emptyQ()]); setActiveTab('quizzes') } else setActiveTab('create') }} style={{ padding:'.65rem 1.4rem', background: activeTab === 'create' ? 'rgba(51,65,85,.8)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, color:'#fff', fontFamily:'inherit', fontWeight:700, cursor:'pointer', fontSize:'.9rem', transition:'all .2s', display:'flex', alignItems:'center', gap:8 }}>
              {activeTab === 'create' ? <><ArrowLeft size={18}/> Back</> : <><Plus size={18}/> Create Quiz</>}
            </button>
            <button onClick={() => setActiveTab(activeTab === 'analytics' ? 'quizzes' : 'analytics')} style={{ padding:'.65rem 1.2rem', background: activeTab === 'analytics' ? 'rgba(34,197,94,.15)' : 'rgba(51,65,85,.6)', border:`1px solid ${activeTab === 'analytics' ? 'rgba(34,197,94,.4)' : '#334155'}`, borderRadius:10, color: activeTab === 'analytics' ? '#86efac' : '#94a3b8', fontFamily:'inherit', fontWeight:600, cursor:'pointer', fontSize:'.9rem', transition:'all .2s', display:'flex', alignItems:'center', gap:8 }}>
              <BarChart size={18}/> Analytics
            </button>
            <button onClick={logout} style={{ padding:'.65rem 1.2rem', background:'rgba(51,65,85,.6)', border:'1px solid #334155', borderRadius:10, color:'#94a3b8', fontFamily:'inherit', fontWeight:600, cursor:'pointer', fontSize:'.9rem', display:'flex', alignItems:'center', gap:8 }}>
              <LogOut size={18}/> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { icon:<BookOpen size={24}/>, num:quizzes.length, label:'Total Quizzes', color:'#6366f1' },
            { icon:<HelpCircle size={24}/>, num:totalQ, label:'Total Questions', color:'#22c55e' },
            { icon:<GraduationCap size={24}/>, num:totalAttempts, label:'Total Attempts', color:'#f59e0b' },
            { icon:<BarChart size={24}/>, num:avgScore+'%', label:'Avg Score', color:'#10b981' },
            { icon:<Trophy size={24}/>, num:passRate+'%', label:'Pass Rate', color:'#ec4899' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(30,41,59,.8)', border:'1px solid #1e293b', borderRadius:14, padding:'1.25rem 1.5rem', textAlign:'center', backdropFilter:'blur(8px)' }}>
              <div style={{ color:s.color, marginBottom:8, display:'flex', justifyContent:'center' }}>{s.icon}</div>
              <div style={{ fontSize:'2rem', fontWeight:900, color:s.color }}>{s.num}</div>
              <div style={{ fontSize:'.78rem', color:'#64748b', marginTop:2, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.02em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {activeTab === 'analytics' && (
          <div style={{ background:'rgba(30,41,59,.85)', border:'1px solid rgba(34,197,94,.2)', borderRadius:20, padding:'2rem', backdropFilter:'blur(12px)', marginBottom:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.5rem' }}>
              <BarChart size={24} color="#22c55e" />
              <h2 style={{ fontSize:'1.4rem', fontWeight:800, margin:0 }}>Analytics Overview</h2>
            </div>
            {quizzes.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'#64748b' }}>No quizzes yet. Create quizzes to see analytics.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {quizzes.map(quiz => {
                  const qAttempts = attempts.filter(a => a.quiz_id === quiz.id)
                  const qAvg = qAttempts.length > 0 ? Math.round(qAttempts.reduce((s,a) => s + (a.total_marks > 0 ? a.score/a.total_marks*100 : 0), 0) / qAttempts.length) : 0
                  const qPass = qAttempts.filter(a => a.total_marks > 0 && (a.score/a.total_marks*100) >= quiz.pass_percentage).length
                  const qPassRate = qAttempts.length > 0 ? Math.round(qPass/qAttempts.length*100) : 0
                  return (
                    <div key={quiz.id} style={{ background:'rgba(15,23,42,.6)', border:'1px solid #1e293b', borderRadius:12, padding:'1.25rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:'1rem' }}>
                        <div>
                          <div style={{ fontWeight:700 }}>{quiz.title}</div>
                          <div style={{ fontSize:'.8rem', color:'#64748b' }}>{quiz.subject}</div>
                        </div>
                        <div style={{ display:'flex', gap:'1.5rem' }}>
                          {[[<GraduationCap size={18}/>, qAttempts.length, 'Attempts'],[<BarChart size={18}/>, qAvg+'%', 'Avg Score'],[<Trophy size={18}/>, qPassRate+'%', 'Pass Rate']].map(([ic,val,lab]) => (
                            <div key={lab} style={{ textAlign:'center' }}>
                              <div style={{ fontSize:'1.25rem', fontWeight:800, color:'#a5b4fc', display:'flex', alignItems:'center', gap:6 }}>{ic} {val}</div>
                              <div style={{ fontSize:'.72rem', color:'#64748b', fontWeight:600, textTransform:'uppercase' }}>{lab}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {qAttempts.length > 0 && (
                        <div style={{ overflowX:'auto' }}>
                          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
                            <thead><tr>{['Student ID','Score','%','Result','Date'].map(h => <th key={h} style={{ textAlign:'left', padding:'.4rem .6rem', color:'#64748b', fontWeight:600, borderBottom:'1px solid #1e293b' }}>{h}</th>)}</tr></thead>
                            <tbody>{qAttempts.slice(0,5).map(a => { const pct = a.total_marks > 0 ? Math.round(a.score/a.total_marks*100) : 0; const pass = pct >= quiz.pass_percentage; return (
                              <tr key={a.id}>
                                <td style={{ padding:'.4rem .6rem', color:'#94a3b8' }}>{a.student_id.slice(0,8)}...</td>
                                <td style={{ padding:'.4rem .6rem' }}>{a.score}/{a.total_marks}</td>
                                <td style={{ padding:'.4rem .6rem' }}>{pct}%</td>
                                <td style={{ padding:'.4rem .6rem' }}><span style={{ display:'flex', alignItems:'center', gap:4, color: pass ? '#22c55e' : '#ef4444', fontWeight:700 }}>{pass ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} {pass?'Pass':'Fail'}</span></td>
                                <td style={{ padding:'.4rem .6rem', color:'#64748b' }}>{new Date(a.submitted_at).toLocaleDateString()}</td>
                              </tr>
                            )})}</tbody>
                          </table>
                          {qAttempts.length > 5 && <div style={{ fontSize:'.78rem', color:'#64748b', marginTop:6 }}>+{qAttempts.length-5} more attempts</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* CREATE / EDIT QUIZ FORM */}
        {activeTab === 'create' && (
          <div style={{ background:'rgba(30,41,59,.85)', border:'1px solid rgba(99,102,241,.2)', borderRadius:20, padding:'2rem', backdropFilter:'blur(12px)' }}>
            <h2 style={{ fontSize:'1.4rem', fontWeight:800, marginBottom:'1.75rem', display:'flex', alignItems:'center', gap:10 }}>
              <Edit size={24} color="#6366f1" />
              <span>{editingId ? 'Edit Quiz' : 'Create New Quiz'}</span>
            </h2>
            <form onSubmit={handleSaveQuiz}>
              {/* Quiz meta */}
              <div style={{ background:'rgba(15,23,42,.6)', borderRadius:12, padding:'1.5rem', marginBottom:'1.5rem' }}>
                <div style={sectionTitle}>Quiz Details</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                  <div>
                    <label style={lbl}>Quiz Title *</label>
                    <input style={inp} name="title" type="text" placeholder="e.g. Mid-Term Physics Test" value={form.title} onChange={handleFormChange} required
                      onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#334155'} />
                  </div>
                  <div>
                    <label style={lbl}>Subject</label>
                    <select style={inp} name="subject" value={form.subject} onChange={handleFormChange}>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={lbl}>Description (optional)</label>
                  <textarea style={{ ...inp, resize:'vertical' }} name="description" rows={2} placeholder="Brief overview of this quiz..." value={form.description} onChange={handleFormChange}
                    onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#334155'} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                  {[
                    { name:'duration', label:'Duration (min)', type:'number', min:1, max:300 },
                    { name:'pass_percentage', label:'Pass % (default 40)', type:'number', min:1, max:100 },
                    { name:'scheduled_at', label:'Schedule Date & Time', type:'datetime-local' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={lbl}>{f.label}</label>
                      <input style={inp} {...f} value={form[f.name]} onChange={handleFormChange}
                        onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#334155'} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions */}
              <div style={{ background:'rgba(15,23,42,.6)', borderRadius:12, padding:'1.5rem', marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                  <div style={sectionTitle}>Questions ({questions.length})</div>
                  <button type="button" onClick={() => setQuestions(p => [...p, emptyQ()])} style={{
                    padding:'.45rem 1rem', background:'rgba(99,102,241,.15)', border:'1px solid rgba(99,102,241,.3)',
                    borderRadius:8, color:'#a5b4fc', fontFamily:'inherit', fontWeight:700, cursor:'pointer', fontSize:'.85rem',
                    display:'flex', alignItems:'center', gap:8
                  }}><Plus size={16}/> Add Question</button>
                </div>

                {questions.map((q, qi) => (
                  <div key={qi} style={{ background:'rgba(30,41,59,.8)', border:'1px solid #334155', borderRadius:12, padding:'1.25rem', marginBottom:'1rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                      <span style={{ fontWeight:700, color:'#818cf8', fontSize:'.95rem' }}>Q{qi+1}</span>
                      <button type="button" onClick={() => questions.length > 1 && setQuestions(p => p.filter((_,i)=>i!==qi))}
                        disabled={questions.length===1}
                        style={{ background:'none', border:'none', color:'#64748b', cursor:questions.length===1?'not-allowed':'pointer', fontSize:'1.1rem', padding:'0 4px', opacity:questions.length===1?.3:1 }}>✕</button>
                    </div>
                    <div style={{ marginBottom:'1rem' }}>
                      <label style={lbl}>Question Text *</label>
                      <textarea style={{ ...inp, resize:'vertical' }} rows={2} placeholder="Enter your question..." value={q.question}
                        onChange={e=>handleQChange(qi,'question',e.target.value)} required
                        onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#334155'} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem', marginBottom:'1rem' }}>
                      {q.options.map((opt,oi) => (
                        <div key={oi}>
                          <label style={lbl}>Option {OL[oi]}</label>
                          <input style={inp} type="text" placeholder={`Option ${OL[oi]}`} value={opt}
                            onChange={e=>handleOptChange(qi,oi,e.target.value)} required
                            onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#334155'} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                      <div>
                        <label style={lbl}>Correct Answer</label>
                        <select style={inp} value={q.correct_answer} onChange={e=>handleQChange(qi,'correct_answer',e.target.value)}>
                          {OL.map(l => <option key={l} value={l}>Option {l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>Marks</label>
                        <input style={inp} type="number" min={1} value={q.marks} onChange={e=>handleQChange(qi,'marks',Number(e.target.value))}
                          onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='#334155'} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', gap:'1rem' }}>
                <button type="button" onClick={() => setActiveTab('quizzes')} style={{ padding:'.7rem 1.5rem', background:'transparent', border:'1.5px solid #334155', borderRadius:10, color:'#94a3b8', fontFamily:'inherit', fontWeight:600, cursor:'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'.7rem 2rem', background:saving?'#4338ca':'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, color:'#fff', fontFamily:'inherit', fontWeight:700, cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 16px rgba(99,102,241,.4)' }}>
                  {saving ? <><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }} />Saving...</> : <><CheckCircle size={18}/> Save Quiz</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── QUIZ LIST ─── */}
        {activeTab === 'quizzes' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.5rem' }}>
              <h2 style={{ fontSize:'1.2rem', fontWeight:800, margin:0 }}>Your Quizzes</h2>
              <span style={{ background:'rgba(99,102,241,.15)', border:'1px solid rgba(99,102,241,.3)', color:'#818cf8', padding:'.2rem .7rem', borderRadius:20, fontSize:'.8rem', fontWeight:700 }}>{quizzes.length}</span>
            </div>

            {loadingQuizzes ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background:'rgba(30,41,59,.5)', border:'1px solid #1e293b', borderRadius:16, padding:'1.5rem' }}>
                    <Skeleton width="30%" height="10px" marginBottom="10px" />
                    <Skeleton width="80%" height="20px" marginBottom="15px" />
                    <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                      <Skeleton width="50px" height="20px" />
                      <Skeleton width="50px" height="20px" />
                    </div>
                    <Skeleton width="100%" height="36px" borderRadius="8px" />
                  </div>
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div style={{ textAlign:'center', padding:'5rem 2rem', color:'#64748b', background:'rgba(30,41,59,.4)', border:'1.5px dashed #334155', borderRadius:20 }}>
                <div style={{ color:'#334155', marginBottom:'1.5rem', display:'flex', justifyContent:'center' }}><BookOpen size={64}/></div>
                <h3 style={{ color:'#94a3b8', fontWeight:700, marginBottom:'.5rem' }}>No quizzes yet</h3>
                <p style={{ marginBottom:'1.5rem' }}>Create your first quiz to get started</p>
                <button onClick={() => setActiveTab('create')} style={{ padding:'.65rem 1.5rem', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, color:'#fff', fontFamily:'inherit', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(99,102,241,.4)', display:'flex', alignItems:'center', gap:8, margin:'0 auto' }}>
                  <Plus size={18}/> Create First Quiz
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {quizzes.map(quiz => (
                  <div key={quiz.id} style={{
                    background:'rgba(30,41,59,.8)', border:'1px solid #1e293b',
                    borderRadius:16, padding:'1.5rem', backdropFilter:'blur(8px)',
                    transition:'border-color .2s', cursor:'default',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(99,102,241,.4)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='#1e293b'}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                          <h3 style={{ fontSize:'1rem', fontWeight:700, margin:0 }}>{quiz.title}</h3>
                          <span style={{
                            fontSize:'.72rem', padding:'.25rem .7rem', borderRadius:20, fontWeight:700, textTransform:'uppercase',
                            background: quiz.status==='active'?'rgba(34,197,94,.15)':quiz.status==='closed'?'rgba(100,116,139,.15)':'rgba(245,158,11,.15)',
                            color: quiz.status==='active'?'#86efac':quiz.status==='closed'?'#94a3b8':'#fbbf24',
                            border: `1px solid ${quiz.status==='active'?'rgba(34,197,94,.3)':quiz.status==='closed'?'rgba(100,116,139,.3)':'rgba(245,158,11,.3)'}`,
                          }}>{quiz.status}</span>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', fontSize:'.82rem', color:'#64748b' }}>
                          <span style={{ display:'flex', alignItems:'center', gap:4 }}><BookOpen size={14}/> {quiz.subject}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={14}/> {quiz.duration} min</span>
                          <span style={{ display:'flex', alignItems:'center', gap:4 }}><HelpCircle size={14}/> {Array.isArray(quiz.questions)?quiz.questions.length:0} Qs</span>
                          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Trophy size={14}/> {quiz.total_marks} pts</span>
                          {quiz.scheduled_at && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={14}/> {new Date(quiz.scheduled_at).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                        <button onClick={() => startEdit(quiz)} style={{ padding:'.45rem .9rem', background:'rgba(99,102,241,.1)', border:'1px solid rgba(99,102,241,.3)', borderRadius:10, color:'#a5b4fc', fontFamily:'inherit', fontWeight:600, cursor:'pointer', fontSize:'.85rem', display:'flex', alignItems:'center', gap:6 }}>
                          <Edit size={14}/> Edit
                        </button>
                        <button onClick={() => toggleStatus(quiz)} style={{ padding:'.45rem .9rem', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.25)', borderRadius:10, color:'#86efac', fontFamily:'inherit', fontWeight:600, cursor:'pointer', fontSize:'.85rem', display:'flex', alignItems:'center', gap:6 }}>
                          <CheckCircle size={14}/> {quiz.status === 'scheduled' ? 'Activate' : quiz.status === 'active' ? 'Close' : 'Reopen'}
                        </button>
                        <button onClick={() => handleDelete(quiz.id, quiz.title)} disabled={deletingId===quiz.id}
                          style={{ padding:'.45rem .9rem', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:10, color:'#fca5a5', fontFamily:'inherit', fontWeight:600, cursor:'pointer', fontSize:'.85rem', transition:'all .2s', flexShrink:0, display:'flex', alignItems:'center', gap:6 }}>
                          {deletingId===quiz.id ? '...' : <><Trash size={14}/> Delete</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const lbl = { display:'block', fontSize:'.8rem', color:'#94a3b8', fontWeight:600, marginBottom:6, letterSpacing:'.02em' }
const inp = { width:'100%', padding:'.68rem 1rem', background:'rgba(15,23,42,.8)', border:'1.5px solid #334155', borderRadius:8, color:'#f1f5f9', fontFamily:'inherit', fontSize:'.92rem', outline:'none', transition:'border-color .2s', boxSizing:'border-box' }
const sectionTitle = { fontSize:'.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#64748b', marginBottom:'1rem' }
