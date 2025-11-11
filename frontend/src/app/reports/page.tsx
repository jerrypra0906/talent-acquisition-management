'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout/Layout'
import { ChartBarIcon, DocumentArrowDownIcon, CalendarIcon, UsersIcon, BriefcaseIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface ReportData {
  id: string
  name: string
  description: string
  type: 'recruitment' | 'performance' | 'analytics' | 'compliance'
  lastGenerated?: string
  status: 'ready' | 'generating' | 'error'
}

export default function ReportsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // TODO: Fetch reports from API
    // This will be implemented when the backend API endpoints are ready
    const mockReports: ReportData[] = [
      {
        id: '1',
        name: 'Monthly Recruitment Summary',
        description: 'Overview of all recruitment activities for the current month',
        type: 'recruitment',
        lastGenerated: '2024-01-15',
        status: 'ready'
      },
      {
        id: '2',
        name: 'Time-to-Hire Analysis',
        description: 'Analysis of average time to hire by department and position',
        type: 'analytics',
        lastGenerated: '2024-01-14',
        status: 'ready'
      },
      {
        id: '3',
        name: 'Candidate Pipeline Report',
        description: 'Current status of all candidates in the recruitment pipeline',
        type: 'recruitment',
        status: 'ready'
      },
      {
        id: '4',
        name: 'Interview Performance Metrics',
        description: 'Success rates and feedback analysis for interviews',
        type: 'performance',
        lastGenerated: '2024-01-13',
        status: 'ready'
      },
      {
        id: '5',
        name: 'Diversity & Inclusion Report',
        description: 'Demographic breakdown of candidates and hires',
        type: 'compliance',
        status: 'generating'
      }
    ]
    setReports(mockReports)
    setLoading(false)
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

  const filteredReports = selectedType === 'all' 
    ? reports 
    : reports.filter(report => report.type === selectedType)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recruitment':
        return <UsersIcon className="h-5 w-5" />
      case 'performance':
        return <ChartBarIcon className="h-5 w-5" />
      case 'analytics':
        return <ChartBarIcon className="h-5 w-5" />
      case 'compliance':
        return <CheckCircleIcon className="h-5 w-5" />
      default:
        return <DocumentArrowDownIcon className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recruitment':
        return 'bg-blue-100 text-blue-800'
      case 'performance':
        return 'bg-green-100 text-green-800'
      case 'analytics':
        return 'bg-purple-100 text-purple-800'
      case 'compliance':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'generating':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">
                Generate and view recruitment reports and analytics
              </p>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Candidates</dt>
                    <dd className="text-lg font-medium text-gray-900">1,234</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BriefcaseIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Open Positions</dt>
                    <dd className="text-lg font-medium text-gray-900">45</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Hired This Month</dt>
                    <dd className="text-lg font-medium text-gray-900">23</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Time to Hire</dt>
                    <dd className="text-lg font-medium text-gray-900">28 days</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Report Types</option>
            <option value="recruitment">Recruitment</option>
            <option value="performance">Performance</option>
            <option value="analytics">Analytics</option>
            <option value="compliance">Compliance</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-6 text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by generating a new report.
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <li key={report.id}>
                  <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {getTypeIcon(report.type)}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {report.name}
                            </p>
                            <p className="text-sm text-gray-500">{report.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                              {report.type}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {report.lastGenerated ? (
                            <p>Last generated: {new Date(report.lastGenerated).toLocaleDateString()}</p>
                          ) : (
                            <p>Not yet generated</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        disabled={report.status !== 'ready'}
                        className={`text-sm font-medium ${
                          report.status === 'ready' 
                            ? 'text-indigo-600 hover:text-indigo-900' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Download
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                        Generate
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}
