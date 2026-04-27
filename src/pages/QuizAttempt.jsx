import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
import { Clock, CheckCircle, AlertTriangle, LayoutDashboard, ArrowLeft, ArrowRight } from '../components/Icons'

const LABELS = ['A','B','C','D']

export default function QuizAttempt() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => { load(); return () => clearInterval(timerRef.current) }, [id])

  async function load() {
    try {
      const { data: ex } = await supabase.from('attempts').select('id').eq('quiz_id',id).eq('student_id',profile.id).single()
      if (ex) { navigate('/student', {replace:true}); return }
      const { data, error } = await supabase.from('quizzes').select('*').eq('id',id).single()
      if (error) throw error
      setQuiz(data)
      setTimeLeft(data.duration * 60)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!timeLeft || !quiz) return
    timerRef.current = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(timerRef.current); submit(true); return 0 } return p - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [!!quiz])

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  async function submit(auto = false) {
    if (!auto && Object.keys(answers).length < quiz.questions.length) {
      if (!window.confirm(`Only ${Object.keys(answers).length}/${quiz.questions.length} answered. Submit?`)) return
    }
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      let score = 0
      const review = quiz.questions.map((q,i) => {
        const sel = answers[i] || null
        const ok = sel === q.correct_answer
        if (ok) score += Number(q.marks)
        return {...q, selected_answer: sel, is_correct: ok}
      })

      // Get logged-in user from Supabase directly
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("User not authenticated")
      }

      console.log("auth uid:", user.id)
      console.log("student_id (from profile):", profile?.id)

      // Prevent Duplicate Attempts
      const { data: existing } = await supabase
        .from("attempts")
        .select("*")
        .eq("quiz_id", id)
        .eq("student_id", user.id)
        .single();

      if (existing) {
        alert("You have already attempted this quiz");
        navigate("/student", { replace: true });
        return;
      }

      const { error } = await supabase.from('attempts').insert([{ 
        quiz_id: id, 
        student_id: user.id, 
        score, 
        total_marks: quiz.total_marks, 
        answers: review 
      }])

      if (error) throw error
      navigate('/result', { state: { score, total_marks: quiz.total_marks, pass_percentage: quiz.pass_percentage, title: quiz.title, subject: quiz.subject, review } })
    } catch(e) { setError(e.message); setSubmitting(false) }
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1rem'}}><Spinner size="large"/><p style={{color:'#94a3b8'}}>Loading quiz...</p></div>
  if (error) return <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center',color:'#94a3b8'}}><div style={{fontSize:'3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: '#ef4444'}}><AlertTriangle size={64}/></div><h3 style={{color:'#f1f5f9'}}>{error}</h3><button onClick={()=>navigate('/student')} style={{marginTop:'1rem',padding:'.6rem 1.4rem',background:'#6366f1',border:'none',borderRadius:8,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontWeight:600, display: 'inline-flex', alignItems: 'center', gap: 8}}><ArrowLeft size={18}/> Back to Dashboard</button></div></div>
  if (!quiz) return null

  const qs = quiz.questions
  const q = qs[current]
  const answered = Object.keys(answers).length
  const low = timeLeft !== null && timeLeft < 60

  return (
    <div style={{minHeight:'100vh',background:'#0f172a'}}>
      <Navbar />
      {/* Sticky header */}
      {/* Sticky header */}
      <div style={{background:'rgba(30,41,59,0.95)', borderBottom:'1px solid rgba(51,65,85,0.8)', position:'sticky', top:57, zIndex:50, backdropFilter:'blur(10px)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'.75rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap'}}>
          <div>
            <div style={{fontWeight:800, fontSize:'1.1rem', color:'#e2e8f0'}}>{quiz.title}</div>
            <div style={{fontSize:'.82rem', color:'#64748b', marginTop:2}}>{quiz.subject} • <strong>{answered}</strong> of <strong>{qs.length}</strong> answered</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'1.25rem'}}>
            {timeLeft !== null && (
              <div style={{
                fontWeight:900, fontSize:'1.2rem', color:low?'#f87171':'#34d399',
                fontVariantNumeric:'tabular-nums', animation:low?'pulse 1s infinite':'none',
                display:'flex', alignItems:'center', gap:6, background:'rgba(15,23,42,0.6)', padding:'.4rem .8rem', borderRadius:10
              }}>
                <Clock size={20} /> {fmt(timeLeft)}
              </div>
            )}
            <button onClick={()=>submit(false)} disabled={submitting} style={{
              padding:'.6rem 1.4rem', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10,
              color:'#fff', cursor:'pointer', fontFamily:'inherit', fontWeight:800, fontSize:'.9rem',
              boxShadow:'0 4px 12px rgba(99,102,241,0.3)', opacity:submitting?.7:1, transition:'all 0.2s'
            }}
              onMouseEnter={e=>{if(!submitting) e.target.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{if(!submitting) e.target.style.transform='translateY(0)'}}
            >
              {submitting ? 'Submitting...' : <><CheckCircle size={18} /> Finish Attempt</>}
            </button>
          </div>
        </div>
        <div style={{height:4, background:'rgba(15,23,42,0.8)'}}>
          <div style={{height:'100%', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', width:`${answered/qs.length*100}%`, transition:'width .5s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow:'0 0 10px rgba(99,102,241,0.5)'}} />
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'2rem 1.5rem',display:'grid',gridTemplateColumns:'1fr 220px',gap:'1.5rem'}}>
        {/* Question Area */}
        <div style={{background:'rgba(30,41,59,0.8)', border:'1px solid rgba(51,65,85,0.6)', borderRadius:20, padding:'2.5rem', backdropFilter:'blur(10px)', boxShadow:'0 20px 50px rgba(0,0,0,0.3)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem'}}>
            <div style={{
              fontSize:'.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em',
              background:'rgba(99,102,241,0.1)', color:'#818cf8', padding:'.4rem .8rem', borderRadius:8
            }}>
              Question {current+1} / {qs.length}
            </div>
            <div style={{fontSize:'.82rem', color:'#64748b', fontWeight:600}}>
              Points: <span style={{color:'#a5b4fc'}}>{q.marks}</span>
            </div>
          </div>

          <h2 style={{fontSize:'1.35rem', fontWeight:700, lineHeight:1.5, marginBottom:'2.5rem', color:'#f1f5f9'}}>{q.question}</h2>

          <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2.5rem'}}>
            {q.options.map((opt,oi) => {
              const lbl = LABELS[oi]
              const sel = answers[current] === lbl
              return (
                <button key={oi} onClick={()=>setAnswers(p=>({...p,[current]:lbl}))}
                  style={{
                    display:'flex', alignItems:'center', gap:'1.25rem', padding:'1.25rem 1.5rem',
                    background:sel?'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))':'rgba(15,23,42,0.4)',
                    border:`2px solid ${sel?'#6366f1':'rgba(51,65,85,0.5)'}`,
                    borderRadius:14, cursor:'pointer', textAlign:'left', color:'#f1f5f9',
                    fontFamily:'inherit', fontSize:'1.05rem', width:'100%', transition:'all .25s',
                    boxShadow: sel ? '0 8px 24px rgba(99,102,241,0.2)' : 'none',
                    transform: sel ? 'scale(1.01)' : 'scale(1)'
                  }}
                  onMouseEnter={e => { if(!sel) { e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.background='rgba(30,41,59,0.6)' } }}
                  onMouseLeave={e => { if(!sel) { e.currentTarget.style.borderColor='rgba(51,65,85,0.5)'; e.currentTarget.style.background='rgba(15,23,42,0.4)' } }}
                >
                  <span style={{
                    width:36, height:36, borderRadius:10,
                    background:sel?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(30,41,59,0.8)',
                    border:`1px solid ${sel?'#6366f1':'#334155'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1rem', fontWeight:800, flexShrink:0,
                    color: sel ? '#fff' : '#64748b', transition:'all 0.2s'
                  }}>{lbl}</span>
                  <span style={{fontWeight:500}}>{opt}</span>
                </button>
              )
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <button onClick={()=>setCurrent(p=>p-1)} disabled={current===0} style={{padding:'.5rem 1rem',background:'transparent',border:'1.5px solid #334155',borderRadius:8,color:'#94a3b8',cursor:'pointer',fontFamily:'inherit',opacity:current===0?.4:1,display:'flex',alignItems:'center',gap:8}}><ArrowLeft size={18}/> Prev</button>
            {current < qs.length-1 ? (
              <button onClick={()=>setCurrent(p=>p+1)} style={{padding:'.5rem 1rem',background:'#6366f1',border:'none',borderRadius:8,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontWeight:600,display:'flex',alignItems:'center',gap:8}}>Next <ArrowRight size={18}/></button>
            ) : (
              <button onClick={()=>submit(false)} style={{padding:'.5rem 1.2rem',background:'#22c55e',border:'none',borderRadius:8,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontWeight:700,display:'flex',alignItems:'center',gap:8}}><CheckCircle size={18}/> Submit</button>
            )}
          </div>
        </div>
        {/* Question Navigator */}
        <div style={{background:'rgba(30,41,59,0.8)', border:'1px solid rgba(51,65,85,0.6)', borderRadius:20, padding:'1.5rem', position:'sticky', top:140, height:'fit-content', backdropFilter:'blur(10px)'}}>
          <div style={{fontSize:'.75rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:15, display:'flex', alignItems:'center', gap:8}}>
            <LayoutDashboard size={18}/> Navigator
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(36px, 1fr))', gap:8, marginBottom:'1.5rem'}}>
            {qs.map((_,i) => (
              <button key={i} onClick={()=>setCurrent(i)} style={{
                height:38, borderRadius:10,
                border:`2px solid ${i===current?'#6366f1':answers[i]?'rgba(99,102,241,0.5)':'rgba(51,65,85,0.3)'}`,
                background:i===current?'linear-gradient(135deg,#6366f1,#8b5cf6)':answers[i]?'rgba(99,102,241,0.15)':'transparent',
                color:i===current?'#fff':answers[i]?'#a5b4fc':'#64748b',
                fontSize:'.85rem', fontWeight:800, cursor:'pointer', transition:'all 0.2s',
                boxShadow: i===current ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
              }}
                onMouseEnter={e => { if(i!==current) e.target.style.borderColor='#6366f1' }}
                onMouseLeave={e => { if(i!==current) e.target.style.borderColor=answers[i]?'rgba(99,102,241,0.5)':'rgba(51,65,85,0.3)' }}
              >{i+1}</button>
            ))}
          </div>
          <div style={{fontSize:'.7rem', color:'#64748b', display:'flex', flexDirection:'column', gap:8, background:'rgba(15,23,42,0.4)', padding:'1rem', borderRadius:12}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}><div style={{width:10,height:10,borderRadius:3,background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}/> Current</div>
            <div style={{display:'flex', alignItems:'center', gap:8}}><div style={{width:10,height:10,borderRadius:3,background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.5)'}}/> Answered</div>
            <div style={{display:'flex', alignItems:'center', gap:8}}><div style={{width:10,height:10,borderRadius:3,border:'1px solid rgba(51,65,85,0.3)'}}/> Unanswered</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}
