'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Shield, Users, Activity, Trash2, Eye, EyeOff } from 'lucide-react'
import { HWIDLicense } from '@/lib/supabase'

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [licenses, setLicenses] = useState<HWIDLicense[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  // const [editingLicense, setEditingLicense] = useState<HWIDLicense | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0
  })

  // New license form data
  const [newLicense, setNewLicense] = useState({
    hwid: '',
    customer_name: '',
    customer_email: '',
    license_type: 'basic',
    expires_at: '',
    notes: ''
  })

  const fetchLicenses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/hwid?admin_password=bintang088`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      console.log('Raw response:', text)
      
      const data = JSON.parse(text)
      
      if (data.licenses) {
        setLicenses(data.licenses)
        calculateStats(data.licenses)
      }
    } catch (err) {
      console.error('Error fetching licenses:', err)
      alert('Failed to load licenses. Check console for details.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchLicenses()
    }
  }, [isAuthenticated, fetchLicenses])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check - in production, use proper authentication
    if (password === 'bintang088') {
      setIsAuthenticated(true)
    } else {
      alert('Invalid password')
    }
  }

  const calculateStats = (licenseData: HWIDLicense[]) => {
    const now = new Date()
    const active = licenseData.filter(l => 
      l.is_active && (!l.expires_at || new Date(l.expires_at) > now)
    ).length
    const expired = licenseData.filter(l => 
      l.expires_at && new Date(l.expires_at) <= now
    ).length

    setStats({
      total: licenseData.length,
      active,
      expired
    })
  }

  const handleAddLicense = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/hwid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_password: 'bintang088',
          ...newLicense
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      const data = JSON.parse(text)
      
      if (data.success) {
        setNewLicense({
          hwid: '',
          customer_name: '',
          customer_email: '',
          license_type: 'basic',
          expires_at: '',
          notes: ''
        })
        setShowAddForm(false)
        fetchLicenses()
        alert('HWID license added successfully!')
      } else {
        alert(data.error || 'Failed to add license')
      }
    } catch (err) {
      console.error('Error adding license:', err)
      alert('Error adding license. Check console for details.')
    }
    setLoading(false)
  }

  const toggleLicenseStatus = async (license: HWIDLicense) => {
    try {
      const response = await fetch('/api/admin/hwid', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_password: 'bintang088',
          id: license.id,
          is_active: !license.is_active
        })
      })

      const data = await response.json()
      
      if (data.success) {
        fetchLicenses()
      } else {
        alert(data.error || 'Failed to update license')
      }
    } catch (err) {
      console.error('Error updating license:', err)
      alert('Error updating license')
    }
  }

  const deleteLicense = async (licenseId: string) => {
    if (!confirm('Are you sure you want to delete this license?')) return

    try {
      const response = await fetch(`/api/admin/hwid?admin_password=bintang088&id=${licenseId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        fetchLicenses()
        alert('License deleted successfully!')
      } else {
        alert(data.error || 'Failed to delete license')
      }
    } catch (err) {
      console.error('Error deleting license:', err)
      alert('Error deleting license')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <Shield className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h1 className="text-2xl font-bold text-white">Yeyodra Admin</h1>
            <p className="text-gray-400">HWID License Management</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold">Yeyodra Admin Dashboard</h1>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Licenses</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Active Licenses</p>
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Expired/Inactive</p>
                <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add License Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New License
          </button>
        </div>

        {/* Add License Form */}
        {showAddForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Add New HWID License</h2>
            <form onSubmit={handleAddLicense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  HWID *
                </label>
                <input
                  type="text"
                  value={newLicense.hwid}
                  onChange={(e) => setNewLicense({...newLicense, hwid: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter HWID (e.g., A1B2C3D4E5F6G7H8)"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={newLicense.customer_name}
                  onChange={(e) => setNewLicense({...newLicense, customer_name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Customer name"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={newLicense.customer_email}
                  onChange={(e) => setNewLicense({...newLicense, customer_email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="customer@email.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  License Type
                </label>
                <select
                  value={newLicense.license_type}
                  onChange={(e) => setNewLicense({...newLicense, license_type: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={newLicense.expires_at}
                  onChange={(e) => setNewLicense({...newLicense, expires_at: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Notes
                </label>
                <textarea
                  value={newLicense.notes}
                  onChange={(e) => setNewLicense({...newLicense, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add License'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Licenses Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">HWID Licenses</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-400">Loading licenses...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">HWID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {licenses.map((license) => (
                    <tr key={license.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                        {license.hwid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          <div className="font-medium">{license.customer_name || 'N/A'}</div>
                          <div className="text-gray-500">{license.customer_email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          license.license_type === 'premium' ? 'bg-purple-900 text-purple-300' :
                          license.license_type === 'enterprise' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-gray-900 text-gray-300'
                        }`}>
                          {license.license_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          license.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {license.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {license.expires_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(license.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(license.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleLicenseStatus(license)}
                            className={`p-1 rounded hover:bg-gray-600 ${
                              license.is_active ? 'text-red-500' : 'text-green-500'
                            }`}
                            title={license.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {license.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => deleteLicense(license.id)}
                            className="p-1 rounded hover:bg-gray-600 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {licenses.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  No licenses found. Add your first license above.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}