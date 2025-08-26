const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jbxquybaldieanlibojx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHF1eWJhbGRpZWFubGlib2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ0MDAsImV4cCI6MjA3MTc1MDQwMH0.SIHlP3fxnWkATQFGkplN1SuYdwRZ5bwITUvnmZ1hAxA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function migrateRoles() {
  console.log('🔄 Starting role migration...')
  
  try {
    // Update all "basic" license_type to "free"
    const { data, error } = await supabase
      .from('hwid_licenses')
      .update({ license_type: 'free' })
      .eq('license_type', 'basic')
      .select()

    if (error) {
      console.error('❌ Migration failed:', error)
      return
    }

    console.log(`✅ Successfully migrated ${data.length} records from "basic" to "free"`)
    console.log('Updated records:', data)
    
  } catch (err) {
    console.error('❌ Migration error:', err)
  }
}

// Run migration
migrateRoles()
