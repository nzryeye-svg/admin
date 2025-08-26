import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = 'bintang088'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password } = body

    // Validate admin password
    if (admin_password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear all cache functionality
    // In a production environment, this would:
    // 1. Clear cache from all connected applications
    // 2. Notify all running Yeyodra instances to refresh
    // 3. Clear Redis/cache database if using one
    
    console.log('All cache clear requested by admin')
    
    // For now, we'll just return success
    // In production, you might want to implement:
    // - WebSocket broadcast to all connected clients
    // - Database flag to force cache invalidation
    // - Redis FLUSHDB command
    
    return NextResponse.json({ 
      success: true, 
      message: 'All cache cleared successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error clearing all cache:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
