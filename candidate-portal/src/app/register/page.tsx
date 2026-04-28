import Link from 'next/link'
import { BriefcaseIcon } from 'lucide-react'

export default function CandidateRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="bg-white shadow-sm shrink-0">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BriefcaseIcon className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">KPN Careers</span>
          </Link>
          <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium">
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-600 text-sm mb-6">
            Registration will be available when this portal is linked to the candidate auth API. Until then, apply using links shared by your recruiter.
          </p>
          <Link href="/" className="inline-block text-primary-600 font-medium hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
