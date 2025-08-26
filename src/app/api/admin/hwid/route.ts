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
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ licenses: data })

  } catch (err) {
    console.error('Error in GET /api/admin/hwid:', err)
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
    const { admin_password, hwid, customer_name, customer_email, license_type, notes } = body
    
    console.log('POST Request body:', body)

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

    const insertData = {
      hwid: hwid.toUpperCase(),
      customer_name: customer_name || null,
      customer_email: customer_email || null,
      license_type: license_type || 'free',
      notes: notes || null,
      is_active: true
    }

    console.log('Inserting data:', insertData)

    const { data, error } = await supabase
      .from('hwid_licenses')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
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

  } catch (err) {
    console.error('Error in POST /api/admin/hwid:', err)
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

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    
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
      console.error('Database error:', error)
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

  } catch (err) {
    console.error('Error in PUT /api/admin/hwid:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove HWID license
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE request received')
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get('admin_password')
    const id = searchParams.get('id')

    console.log('🔑 Admin password check:', adminPassword ? 'provided' : 'missing')
    console.log('🆔 License ID:', id)

    const expectedPassword = process.env.ADMIN_PASSWORD || 'bintang088'
    if (adminPassword !== expectedPassword) {
      console.log('❌ Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!id) {
      console.log('❌ Missing license ID')
      return NextResponse.json(
        { error: 'License ID is required' },
        { status: 400 }
      )
    }

    console.log('🗄️ Attempting to delete from database...')
    const { error } = await supabase
      .from('hwid_licenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      )
    }

    console.log('✅ License deleted successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'HWID license deleted successfully' 
    })

  } catch (err) {
    console.error('Error in DELETE /api/admin/hwid:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}