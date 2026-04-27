import { supabase } from '../lib/supabase'

// Fetch a user profile by ID
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

// Create a new profile (called during signup)
export async function createProfile({ id, name, email, role, institution, department, semester, roll_number, class_code }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id, name, email, role, institution, department, semester, roll_number, class_code })
    .select()
    .single()
  if (error) throw error
  return data
}

// Update profile fields
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Get all students (for teacher view)
export async function getAllStudents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, department, semester, roll_number')
    .eq('role', 'student')
    .order('name')
  if (error) throw error
  return data || []
}
