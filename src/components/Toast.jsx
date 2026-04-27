import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Info } from './Icons'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const config = {
    success: { bg: 'linear-gradient(135deg,#052e16,#064e3b)', border: '#166534', color: '#86efac', icon: <CheckCircle size={20} /> },
    error:   { bg: 'linear-gradient(135deg,#450a0a,#7f1d1d)', border: '#991b1b', color: '#fca5a5', icon: <AlertTriangle size={20} /> },
    info:    { bg: 'linear-gradient(135deg,#1e1b4b,#312e81)', border: '#4338ca', color: '#a5b4fc', icon: <Info size={20} /> },
    warning: { bg: 'linear-gradient(135deg,#431407,#7c2d12)', border: '#c2410c', color: '#fdba74', icon: <AlertTriangle size={20} /> },
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 12,
        maxWidth: 380, width: 'calc(100vw - 48px)',
      }}>
        {toasts.map(toast => {
          const c = config[toast.type] || config.success
          return (
            <div key={toast.id} style={{
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 12, padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,.4)',
              animation: 'toastIn .35s cubic-bezier(.21,1.02,.73,1)',
              backdropFilter: 'blur(12px)',
            }}>
              <span style={{ flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center' }}>{c.icon}</span>
              <span style={{ color: c.color, fontSize: '.9rem', lineHeight: 1.5, flex: 1 }}>
                {toast.message}
              </span>
              <button onClick={() => removeToast(toast.id)} style={{
                background: 'none', border: 'none', color: c.color,
                cursor: 'pointer', fontSize: '1rem', opacity: .7,
                padding: '0 0 0 4px', flexShrink: 0, lineHeight: 1,
              }}>×</button>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
