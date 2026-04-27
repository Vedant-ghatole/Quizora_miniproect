import { supabase } from '../lib/supabase'

// Fetch all quizzes for a teacher
export async function getTeacherQuizzes(teacherId) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, subject, duration, status, scheduled_at, total_marks, pass_percentage, questions, created_at')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Fetch all scheduled quizzes for students
export async function getScheduledQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, subject, duration, status, scheduled_at, total_marks, pass_percentage, questions')
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
  if (error) throw error
  return data || []
}

// Fetch a single quiz by ID
export async function getQuizById(id) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Create a new quiz
export async function createQuiz(quizData) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert(quizData)
    .select()
    .single()
  if (error) throw error
  return data
}

// Delete a quiz
export async function deleteQuiz(id) {
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) throw error
}

// Update quiz status
export async function updateQuizStatus(id, status) {
  const { error } = await supabase.from('quizzes').update({ status }).eq('id', id)
  if (error) throw error
}
