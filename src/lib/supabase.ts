import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jbxquybaldieanlibojx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHF1eWJhbGRpZWFubGlib2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ0MDAsImV4cCI6MjA3MTc1MDQwMH0.SIHlP3fxnWkATQFGkplN1SuYdwRZ5bwITUvnmZ1hAxA'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for HWID License
export interface HWIDLicense {
  id: string
  hwid: string
  customer_name: string | null
  customer_email: string | null
  license_type: string
  is_active: boolean
  created_at: string
  updated_at: string
  expires_at: string | null
  notes: string | null
}
