import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Trophy, Zap, AlertTriangle, ArrowLeft, CheckCircle, BarChart } from '../components/Icons'

const LABELS = ['A','B','C','D']

export default function ResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  if (!state) { navigate('/student',{replace:true}); return null }

  const { score, total_marks, pass_percentage, title, subject, review } = state
  const pct = total_marks > 0 ? Math.round(score/total_marks*100) : 0
  const passed = pct >= pass_percentage
  const correct = review?.filter(r=>r.is_correct).length || 0

  return (
    <div style={{minHeight:'100vh',background:'#0f172a'}}>
      <Navbar />
      <div style={{maxWidth:800,margin:'0 auto',padding:'2rem 1.5rem 4rem'}}>
        {/* Score card */}
        {/* Score card */}
        <div style={{
          background: passed
            ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.05))'
            : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.05))',
          border: `1px solid ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: 24, padding: '3.5rem 2rem', textAlign: 'center', marginBottom: '2.5rem',
          backdropFilter: 'blur(12px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: passed ? '#22c55e' : '#ef4444', filter: 'blur(120px)', opacity: 0.15 }} />

          <div style={{ fontSize: '4.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center', color: passed ? '#fbbf24' : '#818cf8' }}>
            {passed ? <Trophy size={80} /> : <Zap size={80} />}
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '.5rem', letterSpacing: '-.02em', color: '#f8fafc' }}>
            {passed ? 'Excellent Work!' : 'Keep Pushing!'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem' }}>{title} • {subject}</p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, color: passed ? '#4ade80' : '#f87171' }}>{score}<span style={{ fontSize: '1.8rem', color: '#64748b', fontWeight: 700 }}>/{total_marks}</span></div>
              <div style={{ fontSize: '.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: 10, letterSpacing: '.1em' }}>Total Score</div>
            </div>
            <div style={{ width: 2, height: 80, background: 'rgba(51,65,85,0.4)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, color: passed ? '#4ade80' : '#f87171' }}>{pct}<span style={{ fontSize: '1.8rem', color: '#64748b', fontWeight: 700 }}>%</span></div>
              <div style={{ fontSize: '.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: 10, letterSpacing: '.1em' }}>Accuracy</div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '.6rem 1.8rem', borderRadius: 50,
            background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1.5px solid ${passed ? '#22c55e' : '#ef4444'}`,
            color: passed ? '#86efac' : '#fca5a5', fontWeight: 800, fontSize: '1.1rem'
          }}>
            {passed ? <><CheckCircle size={20}/> PASSED</> : <><AlertTriangle size={20}/> FAILED</>}
          </div>
          <p style={{ color: '#64748b', fontSize: '.85rem', marginTop: 12, fontWeight: 600 }}>Minimum Required: {pass_percentage}%</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '3rem' }}>
          {[
            { n: correct, l: 'Correct', c: '#22c55e', bg: 'rgba(34,197,94,0.05)' },
            { n: (review?.length || 0) - correct, l: 'Incorrect', c: '#ef4444', bg: 'rgba(239,68,68,0.05)' },
            { n: review?.length || 0, l: 'Total Questions', c: '#94a3b8', bg: 'rgba(148,163,184,0.05)' }
          ].map(s => (
            <div key={s.l} style={{ background: s.bg, border: '1px solid rgba(51,65,85,0.4)', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Review */}
        {review?.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
              <div style={{ width: 32, height: 2, background: 'rgba(99,102,241,0.4)', borderRadius: 2 }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f1f5f9' }}>Answer Review</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {review.map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(30,41,59,0.5)',
                  border: `1px solid ${item.is_correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  borderLeft: `5px solid ${item.is_correct ? '#22c55e' : '#ef4444'}`,
                  borderRadius: 16, padding: '1.75rem', position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: item.is_correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: item.is_correct ? '#4ade80' : '#f87171',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900
                    }}>
                      {item.is_correct ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#94a3b8' }}>QUESTION {i + 1}</span>
                    <span style={{
                      marginLeft: 'auto', fontSize: '.75rem', fontWeight: 800, padding: '.3rem .75rem', borderRadius: 6,
                      background: 'rgba(15,23,42,0.6)', color: item.is_correct ? '#4ade80' : '#f87171'
                    }}>
                      {item.is_correct ? `+${item.marks} PTS` : '0 PTS'}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6, color: '#e2e8f0' }}>{item.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    {item.options.map((opt, oi) => {
                      const lbl = LABELS[oi]
                      const isCor = lbl === item.correct_answer
                      const isSel = lbl === item.selected_answer
                      return (
                        <div key={oi} style={{
                          display: 'flex', alignItems: 'center', gap: '1rem', padding: '.8rem 1.1rem', borderRadius: 10,
                          background: isCor ? 'rgba(34,197,94,0.1)' : isSel && !isCor ? 'rgba(239,68,68,0.1)' : 'rgba(15,23,42,0.3)',
                          border: `1.5px solid ${isCor ? 'rgba(34,197,94,0.4)' : isSel && !isCor ? 'rgba(239,68,68,0.4)' : 'transparent'}`,
                          fontSize: '.95rem'
                        }}>
                          <span style={{
                            width: 26, height: 26, borderRadius: 8,
                            background: isCor ? '#22c55e' : isSel ? '#ef4444' : '#334155',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '.8rem', fontWeight: 800, color: '#fff', flexShrink: 0
                          }}>{lbl}</span>
                          <span style={{ flex: 1, fontWeight: (isCor || isSel) ? 600 : 400, color: (isCor || isSel) ? '#f1f5f9' : '#94a3b8' }}>{opt}</span>
                          {isCor && <span style={{ color: '#4ade80', fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Correct Answer</span>}
                          {isSel && !isCor && <span style={{ color: '#f87171', fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Your Choice</span>}
                        </div>
                      )
                    })}
                    {!item.selected_answer && <p style={{ fontSize: '.82rem', color: '#64748b', fontStyle: 'italic', marginTop: '.75rem', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} color="#f59e0b" /> Not answered</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
          <button onClick={() => window.location.href = '/student'} style={{
            padding: '1rem 2.5rem', background: 'rgba(51,65,85,0.6)', border: '1px solid #334155', borderRadius: 12,
            color: '#f1f5f9', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.target.style.background = 'rgba(51,65,85,0.8)'}
            onMouseLeave={e => e.target.style.background = 'rgba(51,65,85,0.6)'}
          >
            ← Back to Dashboard
          </button>
          <button onClick={() => window.location.href = '/student'} style={{
            padding: '1rem 2.5rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 12,
            color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '1rem', transition: 'all 0.2s',
            boxShadow: '0 10px 25px rgba(99,102,241,0.3)'
          }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            Try Another Quiz →
          </button>
        </div>
      </div>
    </div>
  )
}
