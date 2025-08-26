const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jbxquybaldieanlibojx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHF1eWJhbGRpZWFubGlib2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ0MDAsImV4cCI6MjA3MTc1MDQwMH0.SIHlP3fxnWkATQFGkplN1SuYdwRZ5bwITUvnmZ1hAxA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDeleteFunctionality() {
  console.log('🔍 Checking current licenses...')
  
  try {
    // Get all licenses
    const { data: licenses, error } = await supabase
      .from('hwid_licenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching licenses:', error)
      return
    }

    console.log(`📊 Found ${licenses.length} licenses:`)
    licenses.forEach((license, index) => {
      console.log(`${index + 1}. ${license.hwid} - ${license.customer_name} (${license.license_type}) - Active: ${license.is_active}`)
    })

    // Check RLS policies or constraints
    console.log('\n🔒 Checking if delete is restricted by policies...')
    
    // Test delete permission (without actually deleting)
    if (licenses.length > 0) {
      console.log('\n🧪 Testing delete permissions...')
      console.log('Note: This is just a check, no actual deletion will occur.')
    }

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

// Run check
checkDeleteFunctionality()
