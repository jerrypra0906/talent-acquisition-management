import Link from 'next/link'
import { BriefcaseIcon } from 'lucide-react'

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BriefcaseIcon className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">KPN Careers</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/jobs" className="text-primary-600 font-medium">
              Browse Jobs
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Open positions</h1>
        <p className="text-gray-600 mb-8">
          Job listings will appear here when connected to your talent acquisition backend. For now, use the team portal or contact HR for open roles.
        </p>
        <Link href="/" className="text-primary-600 font-medium hover:underline">
          ← Back to home
        </Link>
      </main>
    </div>
  )
}
