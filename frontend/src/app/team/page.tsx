'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout/Layout'
import { PlusIcon, MagnifyingGlassIcon, UserGroupIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { AdminUsersAPI, MasterDivisionAPI } from '@/lib/api'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  division: string
  sectionName?: string
  isActive: boolean
  lastLoginAt?: string
  avatar?: string
}

export default function TeamPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  // Password is optional - backend will use DEFAULT_USER_PASSWORD env var if not provided
  const [defaultPassword, setDefaultPassword] = useState('')
  const [showDefaultPassword, setShowDefaultPassword] = useState(false)
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'TA_TEAM',
    division: '',
    sectionName: ''
  })
  const [editMember, setEditMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    division: '',
    sectionName: '',
    resetPassword: false
  })
  const [divisions, setDivisions] = useState<{ id: string, divisionName: string, sectionName: string }[]>([])
  // Menu Access Management (SUPER_ADMIN only)
  const allRoles = ['SUPER_ADMIN','Management','Head of Division','HRBP','TA_TEAM','HIRING_MANAGER','INTERVIEWER']
  const routes: { path: string, label: string }[] = [
    { path: '/', label: 'Dashboard' },
    { path: '/candidates', label: 'Candidates' },
    { path: '/fptk', label: 'Open Position' },
    { path: '/summary-by-position', label: 'Summary by Position' },
    { path: '/reports', label: 'Reports' },
    { path: '/team', label: 'Team' },
    { path: '/masters/division', label: 'Master Division' },
    { path: '/masters/office-location', label: 'Master Office Location' },
    { path: '/settings', label: 'Settings' },
  ]
  const [menuAccessState, setMenuAccessState] = useState<any>({})

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isLoading) {
      // Wait for auth to finish loading
      return
    }
    
    loadTeamMembers()
  }, [isLoading])

  const loadTeamMembers = async () => {
    try {
      setLoading(true)
      const members = await AdminUsersAPI.list()
      // Map API response to TeamMember format
      const mappedMembers: TeamMember[] = members.map((m: any) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phoneNumber,
        role: m.role,
        division: m.division || '—',
        sectionName: m.sectionName,
        isActive: m.isActive,
        lastLoginAt: m.lastLoginAt,
      }))
      setTeamMembers(mappedMembers)
    } catch (error) {
      console.error('Error loading team members:', error)
      alert('Failed to load team members. Please try again.')
      setTeamMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load divisions from API
    const loadDivisions = async () => {
      try {
        const divs = await MasterDivisionAPI.getAll()
        setDivisions(divs.map((d: any) => ({
          id: d.id,
          divisionName: d.divisionName,
          sectionName: d.sectionName,
        })))
      } catch (error) {
        console.error('Error loading divisions:', error)
      }
    }
    loadDivisions()
    
    // Do not load passwords from localStorage for security reasons
    // Backend will use DEFAULT_USER_PASSWORD environment variable if password is not provided
  }, [])

  // Load menuAccess config
  useEffect(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('menuAccess') || 'null') || {}
      setMenuAccessState(cfg)
    } catch {
      setMenuAccessState({})
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Extract role name - handle both string and object formats
  let roleName = 'TA_TEAM'
  if (user) {
    if (typeof user.role === 'string') {
      roleName = user.role
    } else if (user.role?.name) {
      roleName = user.role.name
    }
  }
  
  // Check menu access permissions from localStorage
  const teamMenuAccess = menuAccessState['/team'] || {}
  const visibleRoles: string[] = teamMenuAccess.visibleRoles && teamMenuAccess.visibleRoles.length 
    ? teamMenuAccess.visibleRoles 
    : ['SUPER_ADMIN','TA_TEAM'] // Default fallback
  const permissions = teamMenuAccess.permissions || {}
  const createRoles: string[] = permissions.create || []
  const editRoles: string[] = permissions.edit || []
  
  // Check if user can view (based on visible roles or default)
  const canViewTeam = visibleRoles.includes(roleName) || ['SUPER_ADMIN','TA_TEAM'].includes(roleName)
  
  // Check if user can edit (based on edit roles from menu access, or default permission)
  // If menu access has edit roles configured, use those. Otherwise, fall back to default.
  const hasEditRolesConfigured = editRoles.length > 0
  const canEditFromMenuAccess = hasEditRolesConfigured && editRoles.includes(roleName)
  const canEditFromDefault = ['SUPER_ADMIN','TA_TEAM'].includes(roleName)
  const canEditTeam = canEditFromMenuAccess || (!hasEditRolesConfigured && canEditFromDefault)
  
  // Check if user can create (based on create roles from menu access, or default permission)
  const hasCreateRolesConfigured = createRoles.length > 0
  const canCreateFromMenuAccess = hasCreateRolesConfigured && createRoles.includes(roleName)
  const canCreateFromDefault = ['SUPER_ADMIN','TA_TEAM'].includes(roleName)
  const canCreateTeam = canCreateFromMenuAccess || (!hasCreateRolesConfigured && canCreateFromDefault)
  
  const canManageMenu = roleName === 'SUPER_ADMIN'
  
  if (!canViewTeam) {
    router.push('/')
    return null
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.division || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.sectionName || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800'
      case 'Management':
        return 'bg-purple-100 text-purple-800'
      case 'Head of Division':
        return 'bg-blue-100 text-blue-800'
      case 'HRBP':
        return 'bg-green-100 text-green-800'
      case 'TA_TEAM':
        return 'bg-indigo-100 text-indigo-800'
      case 'HIRING_MANAGER':
        return 'bg-yellow-100 text-yellow-800'
      case 'INTERVIEWER':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const validateMember = (member: typeof newMember | typeof editMember, isEdit = false): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!member.firstName?.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!member.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!member.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.email = 'Invalid email format'
    }
    // Password is optional - backend will use DEFAULT_USER_PASSWORD env var if not provided
    // But if provided, it must meet requirements
    if (!isEdit && 'password' in member && member.password && member.password.trim().length > 0 && member.password.trim().length < 8) {
      errors.password = 'Password must be at least 8 characters if provided'
    }
    return errors
  }

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member)
    setEditMember({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      division: member.division,
      sectionName: member.sectionName || '',
      resetPassword: false
    })
    setValidationErrors({})
    setIsEditOpen(true)
  }

  const handleToggleActive = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return
    await AdminUsersAPI.setStatus(memberId, !member.isActive)
    // Reload team members to get fresh data
    await loadTeamMembers()
  }

  const handleSaveMember = async () => {
    const errors = validateMember(newMember)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors({})
    
    try {
      const created = await AdminUsersAPI.create({
        firstName: newMember.firstName.trim(),
        lastName: newMember.lastName.trim(),
        email: newMember.email.trim(),
        phone: newMember.phone.trim() || undefined,
        role: newMember.role,
        division: newMember.division || '',
        sectionName: newMember.sectionName || '',
        // Password is optional - backend uses DEFAULT_USER_PASSWORD env var if not provided
        password: newMember.password || undefined,
      })
      // Reload team members to get fresh data
      await loadTeamMembers()
      setIsAddOpen(false)
      setNewMember({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'TA_TEAM', division: '', sectionName: '' })
      setValidationErrors({})
      setShowPassword(false)
      alert('Team member created successfully!')
    } catch (error: any) {
      console.error('Error creating team member:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create team member'
      alert(`Error: ${errorMessage}`)
      setValidationErrors({ submit: errorMessage })
    }
  }

  const handleUpdateMember = async () => {
    if (!editingMember) return
    
    const errors = validateMember(editMember, true)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors({})
    
    try {
      const updated = await AdminUsersAPI.update(editingMember.id, {
        firstName: editMember.firstName.trim(),
        lastName: editMember.lastName.trim(),
        email: editMember.email.trim(),
        phone: editMember.phone.trim() || undefined,
        role: editMember.role,
        division: editMember.division || '',
        sectionName: editMember.sectionName || '',
      })
      if (editMember.resetPassword && canManageMenu) {
        // Require explicit password for reset - no default fallback
        if (!defaultPassword || !defaultPassword.trim()) {
          alert('Please enter a new password for the user')
          return
        }
        await AdminUsersAPI.resetPassword(editingMember.id, defaultPassword)
      }
      // Reload team members to get fresh data
      await loadTeamMembers()
      setIsEditOpen(false)
      setEditingMember(null)
      setValidationErrors({})
      alert('Team member updated successfully!')
    } catch (error: any) {
      console.error('Error updating team member:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update team member'
      alert(`Error: ${errorMessage}`)
      setValidationErrors({ submit: errorMessage })
    }
  }

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage team members and their roles in the recruitment system
              </p>
            </div>
            <button
              disabled={!canCreateTeam}
              onClick={() => canCreateTeam && setIsAddOpen(true)}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${canCreateTeam ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Team Member
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="Management">Management</option>
            <option value="Head of Division">Head of Division</option>
            <option value="HRBP">HRBP</option>
            <option value="TA_TEAM">TA Team</option>
            <option value="HIRING_MANAGER">Hiring Manager</option>
            <option value="INTERVIEWER">Interviewer</option>
          </select>
        </div>

        {/* Team Members List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading team members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-6 text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding team members to the system.
              </p>
              <div className="mt-6">
                <button
                  disabled={!canCreateTeam}
                  onClick={() => canCreateTeam && setIsAddOpen(true)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${canCreateTeam ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Team Member
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <li key={member.id}>
                  <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        {member.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={member.avatar}
                            alt={`${member.firstName} ${member.lastName}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {getInitials(member.firstName, member.lastName)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              <span>{member.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              {member.role.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <BriefcaseIcon className="h-4 w-4 mr-1" />
                          <span>{member.division}{member.sectionName ? ` • ${member.sectionName}` : ''}</span>
                          {member.phone && (
                            <>
                              <PhoneIcon className="h-4 w-4 ml-3 mr-1" />
                              <span>{member.phone}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {member.lastLoginAt ? (
                            <p>Last login: {new Date(member.lastLoginAt).toLocaleDateString()}</p>
                          ) : (
                            <p>Never logged in</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (canEditTeam) {
                            handleEditClick(member)
                          }
                        }}
                        className={`text-sm font-medium ${canEditTeam ? 'text-indigo-600 hover:text-indigo-900 cursor-pointer' : 'text-gray-300 cursor-not-allowed pointer-events-none'}`}
                        type="button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (canEditTeam) {
                            handleToggleActive(member.id)
                          }
                        }}
                        className={`text-sm font-medium ${canEditTeam ? 'text-gray-400 hover:text-gray-600 cursor-pointer' : 'text-gray-300 cursor-not-allowed pointer-events-none'}`}
                        type="button"
                      >
                        {member.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Menu Access Management (SUPER_ADMIN only) */}
        {canManageMenu && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Menu Access Management</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visible Roles</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Create</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {routes.map((r) => {
                      const row = menuAccessState[r.path] || {}
                      const visibleRoles: string[] = row.visibleRoles && row.visibleRoles.length ? row.visibleRoles : (r.path === '/team' ? ['SUPER_ADMIN','TA_TEAM'] : ['SUPER_ADMIN','Management','Head of Division','HRBP','TA_TEAM','HIRING_MANAGER','INTERVIEWER'])
                      const permissions = row.permissions || {}
                      const createRoles: string[] = permissions.create || []
                      const editRoles: string[] = permissions.edit || []
                      const updateState = (key: 'visibleRoles' | 'create' | 'edit', role: string, checked: boolean) => {
                        setMenuAccessState((prev: any) => {
                          const prevRow = prev[r.path] || {}
                          const prevPerms = prevRow.permissions || {}
                          if (key === 'visibleRoles') {
                            const next = new Set<string>(visibleRoles)
                            checked ? next.add(role) : next.delete(role)
                            return { ...prev, [r.path]: { ...prevRow, visibleRoles: Array.from(next), permissions: prevPerms } }
                          }
                          const keyArr = key === 'create' ? new Set<string>(createRoles) : new Set<string>(editRoles)
                          checked ? keyArr.add(role) : keyArr.delete(role)
                          const nextPerms = { ...prevPerms, [key]: Array.from(keyArr) }
                          return { ...prev, [r.path]: { ...prevRow, visibleRoles, permissions: nextPerms } }
                        })
                      }
                      return (
                        <tr key={r.path}>
                          <td className="px-4 py-2 text-sm text-gray-900">{r.label}</td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              {allRoles.map((role) => (
                                <label key={role} className="inline-flex items-center gap-1 text-xs text-gray-700">
                                  <input type="checkbox" checked={visibleRoles.includes(role)} onChange={(e) => updateState('visibleRoles', role, e.target.checked)} />
                                  <span>{role}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              {allRoles.map((role) => (
                                <label key={role} className="inline-flex items-center gap-1 text-xs text-gray-700">
                                  <input type="checkbox" checked={createRoles.includes(role)} onChange={(e) => updateState('create', role, e.target.checked)} />
                                  <span>{role}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              {allRoles.map((role) => (
                                <label key={role} className="inline-flex items-center gap-1 text-xs text-gray-700">
                                  <input type="checkbox" checked={editRoles.includes(role)} onChange={(e) => updateState('edit', role, e.target.checked)} />
                                  <span>{role}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => localStorage.setItem('menuAccess', JSON.stringify(menuAccessState))}
                  className="px-4 py-2 text-sm rounded-md border border-transparent text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Access Rules
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Add Member Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => {
            setIsAddOpen(false)
            setValidationErrors({})
            setShowPassword(false)
            setNewMember({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'TA_TEAM', division: '', sectionName: '' })
          }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => {
                  setIsAddOpen(false)
                  setValidationErrors({})
                  setShowPassword(false)
                  setNewMember({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'TA_TEAM', division: '', sectionName: '' })
                }}>✕</button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                    <input 
                      className={`w-full border rounded-md px-3 py-2 text-sm ${validationErrors.firstName ? 'border-red-500' : ''}`} 
                      value={newMember.firstName} 
                      onChange={(e) => {
                        setNewMember({ ...newMember, firstName: e.target.value })
                        if (validationErrors.firstName) {
                          setValidationErrors({ ...validationErrors, firstName: '' })
                        }
                      }} 
                    />
                    {validationErrors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input 
                      className={`w-full border rounded-md px-3 py-2 text-sm ${validationErrors.lastName ? 'border-red-500' : ''}`} 
                      value={newMember.lastName} 
                      onChange={(e) => {
                        setNewMember({ ...newMember, lastName: e.target.value })
                        if (validationErrors.lastName) {
                          setValidationErrors({ ...validationErrors, lastName: '' })
                        }
                      }} 
                    />
                    {validationErrors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    className={`w-full border rounded-md px-3 py-2 text-sm ${validationErrors.email ? 'border-red-500' : ''}`} 
                    value={newMember.email} 
                    onChange={(e) => {
                      setNewMember({ ...newMember, email: e.target.value })
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: '' })
                      }
                    }} 
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Default Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className={`w-full border rounded-md px-3 py-2 pr-10 text-sm ${validationErrors.password ? 'border-red-500' : ''}`} 
                      value={newMember.password} 
                      onChange={(e) => {
                        setNewMember({ ...newMember, password: e.target.value })
                        if (validationErrors.password) {
                          setValidationErrors({ ...validationErrors, password: '' })
                        }
                      }}
                      placeholder="Set default password (user must change on first login)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-gray-500">User will be required to change this password on first login</p>
                    <button
                      type="button"
                      onClick={() => {
                        // Generate a random password
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
                        const password = Array.from(crypto.getRandomValues(new Uint8Array(12)))
                          .map(x => chars[x % chars.length])
                          .join('')
                        setNewMember({ ...newMember, password })
                        if (validationErrors.password) {
                          setValidationErrors({ ...validationErrors, password: '' })
                        }
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Generate Password
                    </button>
                  </div>
                  {newMember.password && (
                    <p className="mt-1 text-xs text-gray-600">
                      Password strength: {newMember.password.length < 6 ? 'Weak' : newMember.password.length < 10 ? 'Medium' : 'Strong'}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Phone</label>
                    <input className="w-full border rounded-md px-3 py-2 text-sm" value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Role</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="CHRO">CHRO</option>
                      <option value="DEPARTMENT_HEAD">Department Head</option>
                      <option value="HRBP">HRBP</option>
                      <option value="TA_TEAM">TA Team</option>
                      <option value="HIRING_MANAGER">Hiring Manager</option>
                      <option value="INTERVIEWER">Interviewer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Division</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={newMember.division} onChange={(e) => setNewMember({ ...newMember, division: e.target.value, sectionName: '' })}>
                      <option value="">Select Division</option>
                      {[...new Set(divisions.map(d => d.divisionName))].map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Section Name</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={newMember.sectionName} onChange={(e) => setNewMember({ ...newMember, sectionName: e.target.value })}>
                      <option value="">Select Section</option>
                      {divisions.filter(d => d.divisionName === newMember.division).map((d) => (
                        <option key={d.id} value={d.sectionName}>{d.sectionName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-2">
                <button 
                  className="px-4 py-2 text-sm rounded-md border text-gray-700 bg-white hover:bg-gray-50" 
                  onClick={() => {
                    setIsAddOpen(false)
                    setValidationErrors({})
                    setShowPassword(false)
                    setNewMember({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'TA_TEAM', division: '', sectionName: '' })
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm rounded-md border border-transparent text-white bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleSaveMember}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {isEditOpen && editingMember && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => {
            setIsEditOpen(false)
            setValidationErrors({})
          }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Edit Team Member</h2>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => {
                  setIsEditOpen(false)
                  setValidationErrors({})
                }}>✕</button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                    <input 
                      className={`w-full border rounded-md px-3 py-2 text-sm ${validationErrors.firstName ? 'border-red-500' : ''}`} 
                      value={editMember.firstName} 
                      onChange={(e) => {
                        setEditMember({ ...editMember, firstName: e.target.value })
                        if (validationErrors.firstName) {
                          setValidationErrors({ ...validationErrors, firstName: '' })
                        }
                      }} 
                    />
                    {validationErrors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input 
                      className={`w-full border rounded-md px-3 py-2 text-sm ${validationErrors.lastName ? 'border-red-500' : ''}`} 
                      value={editMember.lastName} 
                      onChange={(e) => {
                        setEditMember({ ...editMember, lastName: e.target.value })
                        if (validationErrors.lastName) {
                          setValidationErrors({ ...validationErrors, lastName: '' })
                        }
                      }} 
                    />
                    {validationErrors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    className={`w-full border rounded-md px-3 py-2 text-sm ${validationErrors.email ? 'border-red-500' : ''}`} 
                    value={editMember.email} 
                    onChange={(e) => {
                      setEditMember({ ...editMember, email: e.target.value })
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: '' })
                      }
                    }} 
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Phone</label>
                    <input className="w-full border rounded-md px-3 py-2 text-sm" value={editMember.phone} onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Role</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={editMember.role} onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="CHRO">CHRO</option>
                      <option value="DEPARTMENT_HEAD">Department Head</option>
                      <option value="HRBP">HRBP</option>
                      <option value="TA_TEAM">TA Team</option>
                      <option value="HIRING_MANAGER">Hiring Manager</option>
                      <option value="INTERVIEWER">Interviewer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Division</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={editMember.division} onChange={(e) => setEditMember({ ...editMember, division: e.target.value, sectionName: '' })}>
                      <option value="">Select Division</option>
                      {[...new Set(divisions.map(d => d.divisionName))].map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Section Name</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={editMember.sectionName} onChange={(e) => setEditMember({ ...editMember, sectionName: e.target.value })}>
                      <option value="">Select Section</option>
                      {divisions.filter(d => d.divisionName === editMember.division).map((d) => (
                        <option key={d.id} value={d.sectionName}>{d.sectionName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {canManageMenu && (
                  <div className="border-t pt-3 mt-3 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="resetPassword"
                        checked={editMember.resetPassword || false}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          console.log('Reset password checkbox changed:', newValue)
                          setEditMember({ ...editMember, resetPassword: newValue })
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="resetPassword" className="ml-2 block text-sm text-gray-700">
                        Reset Password to Default (user must change on first login)
                      </label>
                    </div>
                    {editMember.resetPassword === true && (
                      <div className="ml-6 space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Default Password:</label>
                          <div className="relative">
                            <input
                              type={showDefaultPassword ? "text" : "password"}
                              value={defaultPassword}
                              onChange={(e) => {
                                setDefaultPassword(e.target.value)
                                // Do not store passwords in localStorage for security
                              }}
                              className="w-full border rounded-md px-3 py-2 text-sm pr-10"
                              placeholder="Enter default password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowDefaultPassword(!showDefaultPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showDefaultPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            This password will be set when you save. The user will be required to change it on their first login.
                          </p>
                        </div>
                      </div>
                    )}
                    {!editMember.resetPassword && (
                      <p className="mt-1 text-xs text-gray-500 ml-6">
                        If checked, the user's password will be reset to the default password and they will be required to change it on their next login.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-2">
                <button 
                  className="px-4 py-2 text-sm rounded-md border text-gray-700 bg-white hover:bg-gray-50" 
                  onClick={() => {
                    setIsEditOpen(false)
                    setValidationErrors({})
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm rounded-md border border-transparent text-white bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleUpdateMember}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
