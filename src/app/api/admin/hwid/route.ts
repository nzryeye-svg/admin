import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: List all HWID licenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get('admin_password')

    const expectedPassword = process.env.ADMIN_PASSWORD || 'bintang088'
    console.log('Admin password from request:', adminPassword)
    console.log('Expected admin password:', expectedPassword)

    if (adminPassword !== expectedPassword) {
      return NextResponse.json(
        { error: 'Unauthorized', debug: { received: adminPassword, expected: expectedPassword } },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('hwid_licenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ licenses: data })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Add new HWID license
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, hwid, customer_name, customer_email, license_type, expires_at, notes } = body

    const expectedPassword = process.env.ADMIN_PASSWORD || 'bintang088'
    if (admin_password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!hwid) {
      return NextResponse.json(
        { error: 'HWID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('hwid_licenses')
      .insert({
        hwid: hwid.toUpperCase(),
        customer_name,
        customer_email,
        license_type: license_type || 'basic',
        expires_at,
        notes,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'HWID already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'HWID license added successfully',
      license: data 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update HWID license
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_password, id, is_active, customer_name, customer_email, license_type, expires_at, notes } = body

    const expectedPassword = process.env.ADMIN_PASSWORD || 'bintang088'
    if (admin_password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    
    if (is_active !== undefined) updateData.is_active = is_active
    if (customer_name !== undefined) updateData.customer_name = customer_name
    if (customer_email !== undefined) updateData.customer_email = customer_email
    if (license_type !== undefined) updateData.license_type = license_type
    if (expires_at !== undefined) updateData.expires_at = expires_at
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('hwid_licenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'HWID license updated successfully',
      license: data 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove HWID license
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get('admin_password')
    const id = searchParams.get('id')

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('hwid_licenses')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'HWID license deleted successfully' 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
