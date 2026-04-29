import { Suspense } from 'react'
import JobsBrowse from './JobsBrowse'

function JobsFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <p className="text-gray-600 text-sm">Loading job search…</p>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsFallback />}>
      <JobsBrowse />
    </Suspense>
  )
}
