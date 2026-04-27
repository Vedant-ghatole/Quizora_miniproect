import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import { Zap, LogOut } from './Icons'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  async function handleLogout() { await logout(); navigate('/auth') }
  const dashLink = profile?.role === 'teacher' ? '/teacher' : profile?.role === 'student' ? '/student' : '/'

  return (
    <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.9rem 1.5rem',background:'rgba(15,23,42,.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid #1e293b',position:'sticky',top:0,zIndex:100}}>
      <Link to={dashLink} style={{fontWeight:900,fontSize:'1.4rem',display:'flex',alignItems:'center',gap:'.5rem',color:'#f1f5f9',textDecoration:'none', letterSpacing:'-0.02em'}}>
        <Zap size={28} color="#6366f1" fill="#6366f1" style={{filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))'}} />
        <span style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Quizora</span>
      </Link>
      <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
        {user && profile ? (
          <>
            <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:700}}>
                {(profile.name || profile.email || '?')[0].toUpperCase()}
              </div>
              <div style={{display:'flex',flexDirection:'column',lineHeight:1.2}}>
                <span style={{fontSize:'.88rem',fontWeight:600,color:'#f1f5f9'}}>{profile.name || profile.email}</span>
                <span style={{fontSize:'.7rem',textTransform:'uppercase',letterSpacing:'.05em',color: profile.role==='teacher'?'#a5b4fc':'#6ee7b7',fontWeight:700}}>{profile.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} style={{padding:'.5rem 1rem', background:'rgba(51,65,85,.3)', border:'1.5px solid #334155', borderRadius:10, color:'#94a3b8', cursor:'pointer', fontFamily:'inherit', fontSize:'.85rem', fontWeight:600, display:'flex', alignItems:'center', gap:8, transition:'all .2s'}}
              onMouseEnter={e=>{e.target.style.borderColor='#ef4444';e.target.style.color='#ef4444';e.target.style.background='rgba(239,68,68,0.05)'}}
              onMouseLeave={e=>{e.target.style.borderColor='#334155';e.target.style.color='#94a3b8';e.target.style.background='rgba(51,65,85,0.3)'}}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <Link to="/auth" style={{padding:'.45rem 1.1rem',background:'#6366f1',border:'none',borderRadius:8,color:'#fff',fontWeight:600,fontSize:'.88rem',cursor:'pointer',textDecoration:'none'}}>Get Started</Link>
        )}
      </div>
    </nav>
  )
}
