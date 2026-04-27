import { supabase } from '../lib/supabase'

// Store a quiz attempt result
export async function submitAttempt({ quizId, studentId, score, answers }) {
  const { data, error } = await supabase
    .from('attempts')
    .insert({ quiz_id: quizId, student_id: studentId, score, answers })
    .select()
    .single()
  if (error) throw error
  return data
}

// Get all attempts by a student
export async function getStudentAttempts(studentId) {
  const { data, error } = await supabase
    .from('attempts')
    .select('id, quiz_id, score, submitted_at')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Check if student already attempted a quiz
export async function hasAttempted(quizId, studentId) {
  const { data, error } = await supabase
    .from('attempts')
    .select('id')
    .eq('quiz_id', quizId)
    .eq('student_id', studentId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Get attempts for a teacher's quizzes
export async function getQuizAttempts(quizId) {
  const { data, error } = await supabase
    .from('attempts')
    .select('id, student_id, score, submitted_at, answers')
    .eq('quiz_id', quizId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data || []
}
