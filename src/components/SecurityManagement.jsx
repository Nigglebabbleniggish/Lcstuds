import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Shield, Ban, UserCheck, Search, AlertCircle } from 'lucide-react'

function SecurityManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')

      if (profileError) throw profileError

      // Create a map of existing profiles
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      // Get auth users (this will fail without service role, so we'll just use profiles)
      // For now, just use profiles since we can't access auth API from client
      const users = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || '',
        username: profile.username || '',
        avatar_url: profile.avatar_url || null,
        is_admin: profile.is_admin || false,
        status: profile.status || 'active',
        admin_id: profile.admin_id || null,
        created_at: profile.created_at
      })) || []

      setUsers(users)
    } catch (error) {
      console.error('Error fetching users:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ))

      alert(`User ${newStatus === 'banned' ? 'banned' : newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`)
    } catch (error) {
      console.error('Error updating user status:', error.message)
      alert('Failed to update user status')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'suspended': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'banned': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <UserCheck size={16} />
      case 'suspended': return <AlertCircle size={16} />
      case 'banned': return <Ban size={16} />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-blue-400" size={32} />
        <h2 className="text-3xl font-bold text-gray-100">Security Management</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-gray-100">{users.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Suspended</p>
          <p className="text-2xl font-bold text-yellow-400">{users.filter(u => u.status === 'suspended').length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Banned</p>
          <p className="text-2xl font-bold text-red-400">{users.filter(u => u.status === 'banned').length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                      {user.username?.charAt(0).toUpperCase() || user.full_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-100">{user.full_name || user.username || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">@{user.username || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{user.email || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                    {getStatusIcon(user.status)}
                    {user.status || 'unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.is_admin ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Shield size={12} />
                      Admin
                    </span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(user.id, 'banned')}
                        className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                        title="Ban user"
                      >
                        Ban
                      </button>
                    )}
                    {user.status === 'banned' && (
                      <button
                        onClick={() => handleStatusChange(user.id, 'active')}
                        className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        title="Unban user"
                      >
                        Unban
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SecurityManagement
