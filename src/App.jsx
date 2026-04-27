import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import QuizAttempt from './pages/QuizAttempt'
import ResultPage from './pages/ResultPage'

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (!loading && user) {
    if (profile?.role === 'teacher') return <Navigate to="/teacher" replace />
    if (profile?.role === 'student') return <Navigate to="/student" replace />
  }
  return <Landing />
}

function AppRoutes() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/teacher" element={<ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/quiz/:id" element={<ProtectedRoute requiredRole="student"><QuizAttempt /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute requiredRole="student"><ResultPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
