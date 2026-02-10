import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://svopsjcnfbhxhnepekog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2b3BzamNuZmJoeGhuZXBla29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODk2MTAsImV4cCI6MjA4NjA2NTYxMH0.6rLPdPos0BWzi9R9Lf_ozAssnNyKMdqYiyj0ZePWVRU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
