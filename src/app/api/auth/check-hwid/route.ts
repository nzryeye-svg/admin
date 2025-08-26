import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { hwid } = await request.json()

    if (!hwid) {
      return NextResponse.json(
        { error: 'HWID is required' },
        { status: 400 }
      )
    }

    // Check if HWID exists and is active
    const { data, error } = await supabase
      .from('hwid_licenses')
      .select('*')
      .eq('hwid', hwid.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    const isAuthorized = !!data
    let message = 'Access granted'

    if (!isAuthorized) {
      message = 'HWID not found or inactive. Please contact admin.'
    } else {
      // Check if license is expired
      if (data.expires_at) {
        const expiryDate = new Date(data.expires_at)
        if (expiryDate < new Date()) {
          message = 'License has expired. Please renew your license.'
          return NextResponse.json({
            hwid,
            is_authorized: false,
            message,
            license_info: data
          })
        }
      }
    }

    return NextResponse.json({
      hwid,
      is_authorized: isAuthorized,
      message,
      license_info: data || null
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
