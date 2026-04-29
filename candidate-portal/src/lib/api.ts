import axios from 'axios'

export function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:4000/api`.replace(/\/$/, '')
  }
  return 'http://localhost:4000/api'.replace(/\/$/, '')
}

const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 25000,
})

export type PublishedJob = {
  id: string
  fptkNumber?: string | null
  positionTitle?: string | null
  position?: string | null
  department?: string | null
  location?: string | null
  employmentType?: string | null
  level?: string | null
  numberOfPositions?: number | null
  filledPositions?: number | null
  minEducation?: string | null
  minExperience?: number | null
  requiredSkills?: string[] | null
  jobDescription?: string | null
  publishedAt?: string | null
}

export type JobsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PublishedJobsParams = {
  page?: number
  limit?: number
  search?: string
  department?: string
  location?: string
  employmentType?: string
}

export async function fetchPublishedJobs(
  params: PublishedJobsParams
): Promise<{ data: PublishedJob[]; pagination: JobsPagination }> {
  const res = await client.get<{
    success?: boolean
    data: PublishedJob[]
    pagination: JobsPagination
  }>('/fptk/published', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      search: params.search?.trim() || undefined,
      department: params.department?.trim() || undefined,
      location: params.location?.trim() || undefined,
      employmentType: params.employmentType?.trim() || undefined,
    },
  })

  const pagination = res.data.pagination || {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    total: 0,
    totalPages: 0,
  }

  return {
    data: Array.isArray(res.data.data) ? res.data.data : [],
    pagination,
  }
}
