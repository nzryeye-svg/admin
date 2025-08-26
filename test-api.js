// Test script untuk API endpoints
// Run dengan: node test-api.js

const BASE_URL = 'http://localhost:3000'

async function testCheckHWID(hwid) {
  console.log(`\n🔍 Testing HWID: ${hwid}`)
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/check-hwid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hwid })
    })
    
    const data = await response.json()
    console.log('✅ Response:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

async function testAddHWID() {
  console.log('\n➕ Testing Add New HWID')
  
  const newHWID = 'TEST' + Math.random().toString(36).substr(2, 8).toUpperCase()
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/hwid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admin_password: 'bintang088',
        hwid: newHWID,
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        license_type: 'basic',
        notes: 'API test license'
      })
    })
    
    const data = await response.json()
    console.log('✅ Response:', JSON.stringify(data, null, 2))
    
    // Test the newly added HWID
    await testCheckHWID(newHWID)
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

async function runTests() {
  console.log('🚀 Testing Yeyodra HWID API Endpoints')
  console.log('=====================================')
  
  // Test existing HWIDs
  await testCheckHWID('A1B2C3D4E5F6G7H8') // Should be authorized
  await testCheckHWID('INVALID_HWID_TEST') // Should be unauthorized
  
  // Test adding new HWID
  await testAddHWID()
  
  console.log('\n✨ Tests completed!')
}

// Run tests
runTests().catch(console.error)
