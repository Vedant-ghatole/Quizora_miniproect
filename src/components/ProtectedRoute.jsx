import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  // Show spinner briefly while auth resolves (max 6s due to timeout in AuthContext)
  if (loading) {
    return (
      <div className="full-page-center">
        <Spinner size="large" />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '.9rem' }}>
          Checking session...
        </p>
      </div>
    )
  }

  // Not logged in → go to auth
  if (!user) return <Navigate to="/auth" replace />

  // Profile still loading (can happen briefly after login) — wait for it
  if (!profile) {
    return (
      <div className="full-page-center">
        <Spinner size="large" />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '.9rem' }}>
          Loading profile...
        </p>
      </div>
    )
  }

  // Wrong role → redirect to correct dashboard
  if (requiredRole && profile.role !== requiredRole) {
    const redirect = profile.role === 'teacher' ? '/teacher' : '/student'
    return <Navigate to={redirect} replace />
  }

  return children
}
