import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file.',
    '\nVITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing',
    '\nVITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing'
  )
  
  // Provide helpful error message for development
  if (import.meta.env.DEV) {
    console.info(
      '\nTo set up Supabase:',
      '\n1. Copy .env.example to .env.local',
      '\n2. Add your Supabase URL and anon key',
      '\n3. Restart the development server'
    )
  }
}

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Helper function to check connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { connected: false, error }
    }
    
    return { connected: true, count: data }
  } catch (error) {
    console.error('Supabase connection check failed:', error)
    return { connected: false, error }
  }
}

// Export types for convenience
export type { Database } from '../types/supabase'