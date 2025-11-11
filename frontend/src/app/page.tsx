'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout/Layout'
import {
  UsersIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { DashboardStats } from '@/types'
import { DashboardAPI, CandidatesAPI, FPTKAPI, ApplicationsAPI } from '@/lib/api'

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCandidates: 0,
    activeApplications: 0,
    openPositions: 0,
    interviewsThisWeek: 0,
    hiredThisMonth: 0,
    pendingOffers: 0,
    recentActivity: [] as any[],
    positionStatusByLocation: [],
    openPositionProgress: [],
    slaByLocation: []
  })
  const [detailModal, setDetailModal] = useState<{ title: string, items: any[] } | null>(null)

  const stats = [
    {
      name: 'Total Candidates',
      value: dashboardStats.totalCandidates.toString(),
      icon: UsersIcon,
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Open Positions',
      value: dashboardStats.openPositions.toString(),
      icon: BriefcaseIcon,
      change: '+3%',
      changeType: 'positive',
    },
    {
      name: 'Interviews This Week',
      value: dashboardStats.interviewsThisWeek.toString(),
      icon: CalendarDaysIcon,
      change: '-2%',
      changeType: 'negative',
    },
    {
      name: 'Hired This Month',
      value: dashboardStats.hiredThisMonth.toString(),
      icon: DocumentTextIcon,
      change: '+15%',
      changeType: 'positive',
    },
    {
      name: 'Pending Offers',
      value: dashboardStats.pendingOffers.toString(),
      icon: ChartBarIcon,
      change: '+5%',
      changeType: 'positive',
    },
  ]

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated, isLoading, router])

  const loadDashboardData = async () => {
    try {
      // Load dashboard stats from API
      const stats = await DashboardAPI.getStats()
      console.log('Dashboard API Response:', stats)
      console.log('Position Status by Location:', stats.positionStatusByLocation)
      console.log('Open Position Progress:', stats.openPositionProgress)
      console.log('SLA by Location:', stats.slaByLocation)
      
      // Fallback compute open positions if API returns zero
      let openPositionsComputed = stats.openPositions ?? 0
      if (!openPositionsComputed || openPositionsComputed === 0) {
        try {
          const jobPostingsData = localStorage.getItem('jobPostings')
          const jobPostings = jobPostingsData ? JSON.parse(jobPostingsData) : []
          openPositionsComputed = jobPostings.filter((j: any) => j.status !== 'On Boarding' && j.status !== 'Cancelled').length
        } catch {}
      }

      // Map API response to frontend format
      const dashboardData = {
        totalCandidates: stats.totalCandidates || 0,
        activeApplications: stats.activeApplications || 0,
        openPositions: (openPositionsComputed || stats.activeFPTKs || stats.totalFPTKs || 0),
        interviewsThisWeek: stats.interviewsThisWeek || 0,
        hiredThisMonth: stats.hiredThisMonth || 0,
        pendingOffers: stats.pendingOffers || 0,
        recentActivity: stats.recentActivity || [],
        positionStatusByLocation: Array.isArray(stats.positionStatusByLocation) ? stats.positionStatusByLocation : [],
        openPositionProgress: Array.isArray(stats.openPositionProgress) ? stats.openPositionProgress : [],
        slaByLocation: Array.isArray(stats.slaByLocation) ? stats.slaByLocation : [],
      }
      console.log('Setting Dashboard Stats:', dashboardData)
      setDashboardStats(dashboardData)
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      console.error('Error details:', error.response?.data || error.message)
      // Fallback to localStorage if API fails
      const candidatesData = localStorage.getItem('candidates')
      const candidates = candidatesData ? JSON.parse(candidatesData) : []
      
      const jobPostingsData = localStorage.getItem('jobPostings')
      const jobPostings = jobPostingsData ? JSON.parse(jobPostingsData) : []
      
      const applicationsData = localStorage.getItem('applications')
      const applications = applicationsData ? JSON.parse(applicationsData) : []
      
      // Calculate statistics
      const totalCandidates = candidates.length
      const activeApplications = applications.length
      const openPositions = jobPostings.filter((job: any) => job.status !== 'On Boarding').length
    
    // Calculate interviews this week
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    
    const interviewsThisWeek = candidates.filter((candidate: any) => {
      if (candidate.interviews && candidate.interviews.length > 0) {
        return candidate.interviews.some((interview: any) => {
          const interviewDate = new Date(interview.date)
          return interviewDate >= startOfWeek && interviewDate <= endOfWeek
        })
      }
      return false
    }).length
    
    // Calculate hired this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const hiredThisMonth = candidates.filter((candidate: any) => {
      return candidate.status === 'hired' && 
             new Date(candidate.updatedAt) >= startOfMonth && 
             new Date(candidate.updatedAt) <= endOfMonth
    }).length
    
    // Calculate pending offers
    const pendingOffers = candidates.filter((candidate: any) => 
      candidate.status === 'Offer Extended'
    ).length
    
    // Calculate position status by location (using Area Detail)
    const positionStatusByLocation = jobPostings.reduce((acc: any, job: any) => {
      // Use areaDetail if available, otherwise fall back to area
      const location = job.areaDetail || job.area || 'Unknown'
      if (!acc[location]) {
        acc[location] = {
          location,
          total: 0,
          closed: 0,
          open: 0
        }
      }
      
      acc[location].total += 1
      
      // Closed Positions = Current Status = "On Boarding" or Current Status = "Cancelled"
      if (job.status === 'On Boarding' || job.status === 'Cancelled') {
        acc[location].closed += 1
      } else {
        // Open Positions = Current Status != "On Boarding" or Current Status != "Cancelled"
        acc[location].open += 1
      }
      
      return acc
    }, {})

    // Calculate open position progress by area detail (Area Detail as X-axis, Status as Y-axis)
    const openPositionProgress = jobPostings.reduce((acc: any, job: any) => {
      // Use areaDetail if available, otherwise fall back to area
      const areaDetail = job.areaDetail || job.area || 'Unknown'
      const status = job.status || 'Raise FPTK'
      
      if (!acc[areaDetail]) {
        acc[areaDetail] = {
          areaDetail,
          statusCounts: {},
          total: 0
        }
      }
      
      if (!acc[areaDetail].statusCounts[status]) {
        acc[areaDetail].statusCounts[status] = 0
      }
      
      acc[areaDetail].statusCounts[status] += 1
      acc[areaDetail].total += 1
      
      return acc
    }, {})

    // Calculate percentages for each area detail
    const totalOpenPositions = jobPostings.length
    Object.values(openPositionProgress).forEach((areaData: any) => {
      areaData.percentage = totalOpenPositions > 0 ? Math.round((areaData.total / totalOpenPositions) * 100) : 0
    })

    // Calculate SLA by location (Area Detail)
    const nowDate = new Date()
    const slaByLocation = jobPostings.reduce((acc: any, job: any) => {
      const areaDetail = job.areaDetail || job.area || 'Unknown'
      const requestDate = job.requestDate ? new Date(job.requestDate) : null
      if (!acc[areaDetail]) {
        acc[areaDetail] = {
          areaDetail,
          buckets: {
            '0-30 Days': 0,
            '31-60 Days': 0,
            '61-90 Days': 0,
            'Above 91 Days': 0,
          },
          total: 0,
        }
      }
      if (requestDate && !isNaN(requestDate.getTime())) {
        const diffDays = Math.floor((nowDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays <= 30) acc[areaDetail].buckets['0-30 Days'] += 1
        else if (diffDays <= 60) acc[areaDetail].buckets['31-60 Days'] += 1
        else if (diffDays <= 90) acc[areaDetail].buckets['61-90 Days'] += 1
        else acc[areaDetail].buckets['Above 91 Days'] += 1
        acc[areaDetail].total += 1
      }
      return acc
    }, {})

    // Generate recent activity
    const recentActivity = [
      ...candidates.slice(0, 3).map((candidate: any) => ({
        type: 'candidate_added',
        message: `New candidate ${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName} added`,
        timestamp: candidate.createdAt,
        icon: 'user'
      })),
        ...jobPostings.slice(0, 2).map((job: any) => ({
          type: 'job_posting_created',
          message: `New position "${job.title}" created`,
          timestamp: job.createdAt,
          icon: 'briefcase'
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)
    
    setDashboardStats({
      totalCandidates,
      activeApplications,
      openPositions,
      interviewsThisWeek,
      hiredThisMonth,
      pendingOffers,
      recentActivity,
      positionStatusByLocation: Object.values(positionStatusByLocation),
      openPositionProgress: Object.values(openPositionProgress),
      slaByLocation: Object.values(slaByLocation)
    })
    }
  }

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

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome to the KPN Talent Acquisition System
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <button
              key={item.name}
              className="text-left relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6 hover:ring-2 hover:ring-indigo-500 focus:outline-none"
              onClick={async () => {
                setDetailModal({ title: item.name, items: [] }) // Show loading state
                
                try {
                  let items: any[] = []
                  const now = new Date()
                  
                  if (item.name === 'Total Candidates') {
                    // Fetch candidates with max limit of 100 (API validation limit)
                    const response = await CandidatesAPI.getAll({}, { page: 1, limit: 100 })
                    const candidates = response.data || []
                    items = candidates.map((c: any) => ({
                      title: `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim() || 'Unknown',
                      subtitle: c.user?.email || 'No email',
                      meta: c._count?.applications ? `${c._count.applications} application(s)` : 'No applications',
                    }))
                  } else if (item.name === 'Open Positions') {
                    // Fetch FPTKs with max limit of 100
                    const response = await FPTKAPI.getAll({}, { page: 1, limit: 100 })
                    const fptks = response.data || []
                    items = fptks
                      .filter((f: any) => f.status !== 'FILLED' && f.status !== 'CANCELLED')
                      .map((f: any) => ({
                        title: f.positionTitle || f.position || 'Unknown Position',
                        subtitle: `${f.department || 'N/A'} • ${f.location || 'N/A'}`,
                        meta: f.currentStatus || f.status || 'N/A',
                      }))
                  } else if (item.name === 'Interviews This Week') {
                    const startOfWeek = new Date(now)
                    startOfWeek.setDate(now.getDate() - now.getDay())
                    startOfWeek.setHours(0, 0, 0, 0)
                    const endOfWeek = new Date(now)
                    endOfWeek.setDate(now.getDate() - now.getDay() + 6)
                    endOfWeek.setHours(23, 59, 59, 999)
                    
                    // Fetch applications with interviews
                    const response = await ApplicationsAPI.getAll({}, { page: 1, limit: 100 })
                    const applications = response.data || []
                    
                    items = applications.flatMap((app: any) => {
                      const interviews = app.interviews || []
                      return interviews
                        .filter((iv: any) => {
                          if (!iv.scheduledAt) return false
                          const interviewDate = new Date(iv.scheduledAt)
                          return interviewDate >= startOfWeek && interviewDate <= endOfWeek &&
                                 (iv.status === 'SCHEDULED' || iv.status === 'CONFIRMED')
                        })
                        .map((iv: any) => ({
                          title: `${app.candidate?.user?.firstName || ''} ${app.candidate?.user?.lastName || ''}`.trim() || 'Unknown',
                          subtitle: `${new Date(iv.scheduledAt).toLocaleDateString()} ${iv.duration ? `${iv.duration} min` : ''}`.trim(),
                          meta: iv.interviewer?.firstName && iv.interviewer?.lastName 
                            ? `${iv.interviewer.firstName} ${iv.interviewer.lastName}`
                            : iv.interviewType || 'N/A',
                        }))
                    })
                    
                    if (items.length === 0) {
                      items = [{
                        title: 'No interviews scheduled this week',
                        subtitle: 'Check the Interviews page for all interview information',
                        meta: 'No data',
                      }]
                    }
                  } else if (item.name === 'Hired This Month') {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    
                    // Fetch applications with HIRED status
                    const response = await ApplicationsAPI.getAll({ status: 'HIRED' }, { page: 1, limit: 100 })
                    const applications = response.data || []
                    
                    items = applications
                      .filter((app: any) => {
                        if (!app.hiredAt) return false
                        const hiredDate = new Date(app.hiredAt)
                        return hiredDate >= startOfMonth && hiredDate <= endOfMonth
                      })
                      .map((app: any) => ({
                        title: `${app.candidate?.user?.firstName || ''} ${app.candidate?.user?.lastName || ''}`.trim() || 'Unknown',
                        subtitle: app.candidate?.user?.email || 'No email',
                        meta: `Hired on ${new Date(app.hiredAt).toLocaleDateString()}`,
                      }))
                    
                    if (items.length === 0) {
                      items = [{
                        title: 'No candidates hired this month',
                        subtitle: 'Check the Applications page for all hiring information',
                        meta: 'No data',
                      }]
                    }
                  } else if (item.name === 'Pending Offers') {
                    // Fetch applications and check their offers
                    const response = await ApplicationsAPI.getAll({}, { page: 1, limit: 100 })
                    const applications = response.data || []
                    
                    items = applications
                      .filter((app: any) => {
                        const offers = app.offers || []
                        return offers.some((offer: any) => 
                          ['PENDING_HRBP_REVIEW', 'PENDING_HEAD_APPROVAL', 'SENT_TO_CANDIDATE'].includes(offer.status)
                        )
                      })
                      .map((app: any) => ({
                        title: `${app.candidate?.user?.firstName || ''} ${app.candidate?.user?.lastName || ''}`.trim() || 'Unknown',
                        subtitle: app.candidate?.user?.email || 'No email',
                        meta: app.offers?.[0]?.status || 'Pending',
                      }))
                    
                    if (items.length === 0) {
                      items = [{
                        title: 'No pending offers',
                        subtitle: 'Check the Offers page for all offer information',
                        meta: 'No data',
                      }]
                    }
                  }
                  
                  setDetailModal({ title: item.name, items })
                } catch (error: any) {
                  console.error(`Error loading ${item.name} details:`, error)
                  setDetailModal({ title: item.name, items: [] })
                }
              }}
            >
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900 underline decoration-dotted">{item.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.change}
                </p>
              </dd>
            </button>
          ))}
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Position Status by Location */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Position Status by Location
              </h3>
              <div className="mt-5">
                {dashboardStats.positionStatusByLocation.length > 0 ? (
                  <div className="space-y-6">
                    {dashboardStats.positionStatusByLocation.map((locationData: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-900">{locationData.location}</h4>
                          <div className="flex space-x-4 text-sm text-gray-600">
                            <button
                              className="hover:underline"
                              onClick={() => {
                                const jobPostings = JSON.parse(localStorage.getItem('jobPostings') || '[]')
                                const items = jobPostings
                                  .filter((j: any) => (j.areaDetail || j.area || 'Unknown') === locationData.location)
                                  .map((j: any) => ({ title: j.title, subtitle: `${j.department} • ${j.location}`, meta: j.status }))
                                setDetailModal({ title: `Total Positions • ${locationData.location}`, items })
                              }}
                            >
                              Total: <span className="font-semibold">{locationData.total}</span>
                            </button>
                            <button
                              className="text-green-600 hover:underline"
                              onClick={() => {
                                const jobPostings = JSON.parse(localStorage.getItem('jobPostings') || '[]')
                                const items = jobPostings
                                  .filter((j: any) => (j.areaDetail || j.area || 'Unknown') === locationData.location)
                                  .filter((j: any) => j.status !== 'On Boarding' && j.status !== 'Cancelled')
                                  .map((j: any) => ({ title: j.title, subtitle: `${j.department} • ${j.location}`, meta: j.status }))
                                setDetailModal({ title: `Open Positions • ${locationData.location}`, items })
                              }}
                            >
                              Open: <span className="font-semibold">{locationData.open}</span>
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => {
                                const jobPostings = JSON.parse(localStorage.getItem('jobPostings') || '[]')
                                const items = jobPostings
                                  .filter((j: any) => (j.areaDetail || j.area || 'Unknown') === locationData.location)
                                  .filter((j: any) => j.status === 'On Boarding' || j.status === 'Cancelled')
                                  .map((j: any) => ({ title: j.title, subtitle: `${j.department} • ${j.location}`, meta: j.status }))
                                setDetailModal({ title: `Closed Positions • ${locationData.location}`, items })
                              }}
                            >
                              Closed: <span className="font-semibold">{locationData.closed}</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Bar Chart */}
                        <div className="relative">
                          <div className="flex items-end space-x-1 h-8">
                            {/* Open Positions Bar */}
                            <div className="flex-1 flex flex-col items-center">
                              <div 
                                className="bg-green-500 rounded-t w-full transition-all duration-300 hover:bg-green-600"
                                style={{ 
                                  height: `${Math.max((locationData.open / locationData.total) * 100, 5)}%`,
                                  minHeight: locationData.open > 0 ? '8px' : '0px'
                                }}
                                title={`Open: ${locationData.open}`}
                              ></div>
                              <span className="text-xs text-gray-500 mt-1">Open</span>
                            </div>
                            
                            {/* Closed Positions Bar */}
                            <div className="flex-1 flex flex-col items-center">
                              <div 
                                className="bg-red-500 rounded-t w-full transition-all duration-300 hover:bg-red-600"
                                style={{ 
                                  height: `${Math.max((locationData.closed / locationData.total) * 100, 5)}%`,
                                  minHeight: locationData.closed > 0 ? '8px' : '0px'
                                }}
                                title={`Closed: ${locationData.closed}`}
                              ></div>
                              <span className="text-xs text-gray-500 mt-1">Closed</span>
                            </div>
                          </div>
                          
                          {/* Percentage Labels */}
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>{Math.round((locationData.open / locationData.total) * 100)}% Open</span>
                            <span>{Math.round((locationData.closed / locationData.total) * 100)}% Closed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No position data available. Create some positions to see the chart.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Open Position Current Progress */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Open Position Progress by Area Detail
              </h3>
              <div className="mt-5">
                {dashboardStats.openPositionProgress.length > 0 ? (
                  <div className="space-y-6">
                    {dashboardStats.openPositionProgress.map((areaData: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-900">{areaData.areaDetail}</h4>
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">{areaData.total}</span> total positions ({areaData.percentage}%)
                          </div>
                        </div>
                        
                        {/* Grouped Status Bars */}
                        <div className="space-y-2">
                          {Object.entries(areaData.statusCounts).map(([status, count]: [string, any]) => (
                            <div key={status} className="flex items-center">
                              <div className="w-24 text-xs text-gray-600 truncate mr-2">
                                {status}
                              </div>
                              <button
                                className="flex-1 bg-gray-200 rounded-full h-2 group"
                                onClick={() => {
                                  const jobPostings = JSON.parse(localStorage.getItem('jobPostings') || '[]')
                                  const items = jobPostings
                                    .filter((j: any) => (j.areaDetail || j.area || 'Unknown') === areaData.areaDetail)
                                    .filter((j: any) => (j.status || 'Raise FPTK') === status)
                                    .map((j: any) => ({ title: j.title, subtitle: `${j.department} • ${j.location}`, meta: j.status }))
                                  setDetailModal({ title: `${status} • ${areaData.areaDetail}`, items })
                                }}
                                title={`${status}: ${count} positions`}
                              >
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 group-hover:bg-blue-600"
                                  style={{ width: `${(count / areaData.total) * 100}%` }}
                                ></div>
                              </button>
                              <button
                                className="w-8 text-xs text-gray-600 text-right ml-2 hover:underline"
                                onClick={() => {
                                  const jobPostings = JSON.parse(localStorage.getItem('jobPostings') || '[]')
                                  const items = jobPostings
                                    .filter((j: any) => (j.areaDetail || j.area || 'Unknown') === areaData.areaDetail)
                                    .filter((j: any) => (j.status || 'Raise FPTK') === status)
                                    .map((j: any) => ({ title: j.title, subtitle: `${j.department} • ${j.location}`, meta: j.status }))
                                  setDetailModal({ title: `${status} • ${areaData.areaDetail}`, items })
                                }}
                              >
                                {count}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No position progress data available. Create some positions to see the chart.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SLA by Location */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                SLA by Location (from Request Date)
              </h3>
              <div className="mt-5">
                {dashboardStats.slaByLocation.length > 0 ? (
                  <div className="space-y-6">
                    {dashboardStats.slaByLocation.map((areaData: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-900">{areaData.areaDetail}</h4>
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">{areaData.total}</span> positions with SLA
                          </div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(areaData.buckets).map(([bucket, count]: [string, any]) => (
                            <div key={bucket} className="flex items-center">
                              <div className="w-28 text-xs text-gray-600 truncate mr-2">{bucket}</div>
                              <button
                                className="flex-1 bg-gray-200 rounded-full h-2 group"
                                onClick={() => {
                                  const jobPostings = JSON.parse(localStorage.getItem('jobPostings') || '[]')
                                  const bucketMatch = (req: any) => {
                                    const nowDate = new Date()
                                    if (!req) return false
                                    const d = new Date(req)
                                    const diffDays = Math.floor((nowDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
                                    if (bucket === '0-30 Days') return diffDays <= 30
                                    if (bucket === '31-60 Days') return diffDays > 30 && diffDays <= 60
                                    if (bucket === '61-90 Days') return diffDays > 60 && diffDays <= 90
                                    return diffDays > 90
                                  }
                                  const items = jobPostings
                                    .filter((j: any) => (j.areaDetail || j.area || 'Unknown') === areaData.areaDetail)
                                    .filter((j: any) => bucketMatch(j.requestDate))
                                    .map((j: any) => ({ title: j.title, subtitle: `${j.department} • ${j.location}`, meta: `Request: ${j.requestDate || '-'}` }))
                                  setDetailModal({ title: `${bucket} • ${areaData.areaDetail}`, items })
                                }}
                                title={`${bucket}: ${count} positions`}
                              >
                                <div
                                  className="bg-purple-500 h-2 rounded-full transition-all duration-300 group-hover:bg-purple-600"
                                  style={{ width: `${areaData.total > 0 ? (count / areaData.total) * 100 : 0}%` }}
                                ></div>
                              </button>
                              <button
                                className="w-8 text-xs text-gray-600 text-right ml-2 hover:underline"
                                onClick={() => {
                                  const jobPostings = JSON.parse(localStorage.getItem('jobPostings') || '[]')
                                  const bucketMatch = (req: any) => {
                                    const nowDate = new Date()
                                    if (!req) return false
                                    const d = new Date(req)
                                    const diffDays = Math.floor((nowDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
                                    if (bucket === '0-30 Days') return diffDays <= 30
                                    if (bucket === '31-60 Days') return diffDays > 30 && diffDays <= 60
                                    if (bucket === '61-90 Days') return diffDays > 60 && diffDays <= 90
                                    return diffDays > 90
                                  }
                                  const items = jobPostings
                                    .filter((j: any) => (j.areaDetail || j.area || 'Unknown') === areaData.areaDetail)
                                    .filter((j: any) => bucketMatch(j.requestDate))
                                    .map((j: any) => ({ title: j.title, subtitle: `${j.department} • ${j.location}`, meta: `Request: ${j.requestDate || '-'}` }))
                                  setDetailModal({ title: `${bucket} • ${areaData.areaDetail}`, items })
                                }}
                              >
                                {count}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No SLA data available.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button 
                  onClick={() => router.push('/candidates')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add New Candidate
                </button>
                <button 
                  onClick={() => router.push('/fptk')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Position
                </button>
                {/* Removed Schedule Interview as requested */}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
              <div className="mt-5">
                {dashboardStats.recentActivity.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {dashboardStats.recentActivity.map((activity, activityIdx) => (
                        <li key={activityIdx}>
                          <div className="relative pb-8">
                            {activityIdx !== dashboardStats.recentActivity.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  activity.icon === 'user' ? 'bg-indigo-500' : 'bg-green-500'
                                }`}>
                                  {activity.icon === 'user' ? (
                                    <UsersIcon className="h-5 w-5 text-white" />
                                  ) : (
                                    <BriefcaseIcon className="h-5 w-5 text-white" />
                                  )}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">{activity.message}</p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={activity.timestamp}>
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No recent activity to display. Start by adding candidates or creating positions.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Details Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{detailModal.title}</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div className="max-h-[60vh] overflow-auto px-6 py-4">
              {detailModal.items.length > 0 ? (
                <ul className="divide-y">
                  {detailModal.items.map((it, idx) => (
                    <li key={idx} className="py-3">
                      <div className="text-sm font-medium text-gray-900">{it.title}</div>
                      {it.subtitle && <div className="text-sm text-gray-600">{it.subtitle}</div>}
                      {it.meta && <div className="text-xs text-gray-500 mt-1">{it.meta}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">No data available.</div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button className="px-4 py-2 text-sm rounded-md border text-gray-700 bg-white hover:bg-gray-50" onClick={() => setDetailModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}