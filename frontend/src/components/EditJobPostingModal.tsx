'use client'

import { useState, useEffect, useMemo } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { FPTK } from '@/types'
import { MasterOfficeLocationAPI, MasterDivisionAPI, CandidatesAPI } from '@/lib/api'

interface EditJobPostingModalProps {
  isOpen: boolean
  onClose: () => void
  jobPosting: FPTK | null
  onSave: (updatedData: any) => void
  onStatusUpdate?: (jobPostingId: string, newStatus: string) => void
  onCandidateStatusUpdate?: (jobPostingId: string, candidateId: string, newStatus: string) => void
}

export default function EditJobPostingModal({ 
  isOpen, 
  onClose, 
  jobPosting, 
  onSave, 
  onStatusUpdate,
  onCandidateStatusUpdate 
}: EditJobPostingModalProps) {
  const [formData, setFormData] = useState({
    pt: '',
    noFktk: '',
    statusFktk: '',
    division: '',
    section: '',
    hiringManager: '',
    position: '',
    employmentType: '',
    typeGrade: '',
    grade2: '',
    urgentNormal: '',
    priorityByMonthYear: '',
    jobSpecification: '',
    criteria: '',
    area: '',
    areaDetail: '',
    additionalOrReplacement: '',
    replacementName: '',
    resignReason: '',
    totalRequest: '',
    requestDate: '',
    status: '',
    skills: [] as string[],
    yearsOfExperience: '',
    remark: ''
  })

  const [newSkill, setNewSkill] = useState('')
  const [appliedCandidates, setAppliedCandidates] = useState<any[]>([])
  const [suggestedCandidates, setSuggestedCandidates] = useState<any[]>([])
  const [allCandidates, setAllCandidates] = useState<any[]>([])
  const [officeLocations, setOfficeLocations] = useState<any[]>([])
  const [areaDetails, setAreaDetails] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [originalFormSnapshot, setOriginalFormSnapshot] = useState<any | null>(null)

  const mapAppliedStatusLabel = (status?: string) => {
    if (!status) return 'Applied'
    const normalized = status.toString().toUpperCase()
    const lookup: Record<string, string> = {
      DRAFT: 'Applied',
      SUBMITTED: 'Applied',
      SCREENING: 'Under Review',
      PSYCHOMETRIC_TEST: 'Under Review',
      TECHNICAL_TEST: 'Technical Test',
      INTERVIEW_SCHEDULED: 'Interview Scheduled',
      INTERVIEW_COMPLETED: 'Interviewed',
      DOCUMENT_VERIFICATION: 'Document Verification',
      OFFER_PROPOSED: 'Offer Extended',
      OFFER_APPROVED: 'Offer Approved',
      OFFER_SENT: 'Offer Sent',
      OFFER_ACCEPTED: 'Offer Accepted',
      OFFER_REJECTED: 'Offer Declined',
      MEDICAL_CHECKUP_SCHEDULED: 'Medical Checkup Scheduled',
      MEDICAL_CHECKUP_COMPLETED: 'Medical Checkup Completed',
      CONTRACT_SENT: 'Contract Sent',
      CONTRACT_SIGNED: 'Contract Signed',
      ONBOARDING: 'On Boarding',
      HIRED: 'Hired',
      REJECTED: 'Rejected',
      WITHDRAWN: 'Withdrawn',
    }
    if (lookup[normalized]) return lookup[normalized]
    return normalized
      .toLowerCase()
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const mergeAppliedCandidateData = (candidate: any, candidateInfo?: any) => {
    const baseInfo = candidateInfo || {}
    const id = candidate.candidateId || candidate.id || baseInfo.candidateId || baseInfo.id
    const personalInfo = baseInfo.personalInfo || {}
    const fullName =
      candidate.fullName ||
      candidate.name ||
      [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(' ') ||
      baseInfo.fullName ||
      baseInfo.name ||
      (id ? `Candidate ${id.substring(0, 6)}` : 'Unknown Candidate')

    const email =
      candidate.email ||
      baseInfo.email ||
      baseInfo.contactInfo?.email ||
      baseInfo.user?.email ||
      ''

    const skills =
      candidate.skills ||
      baseInfo.skills ||
      baseInfo.professionalInfo?.skills ||
      []

    const experience =
      candidate.experience ??
      candidate.yearsOfExperience ??
      baseInfo.experience ??
      baseInfo.professionalInfo?.experience ??
      0

    return {
      ...baseInfo,
      ...candidate,
      id,
      candidateId: id,
      fullName,
      name: fullName,
      email,
      status: candidate.status || mapAppliedStatusLabel(candidate.backendStatus),
      backendStatus: candidate.backendStatus || candidate.status,
      appliedDate: candidate.appliedDate || candidate.appliedAt || new Date().toISOString(),
      skills,
      experience,
      yearsOfExperience: experience,
      division: candidate.division || baseInfo.division || baseInfo.user?.division || null,
      jobPostingId: jobPosting?.id || candidate.jobPostingId || baseInfo.jobPostingId,
      interviews: candidate.interviews || baseInfo.interviews || [],
    }
  }

  // Load office locations from Master Office Location
  useEffect(() => {
    let isMounted = true

    const loadOfficeLocations = async () => {
      try {
        const data = await MasterOfficeLocationAPI.getAll()
        if (isMounted) {
          setOfficeLocations(data || [])
          try {
            localStorage.setItem('masterOfficeLocations', JSON.stringify(data || []))
          } catch (_) {
            // ignore localStorage errors
          }
        }
      } catch (error) {
        console.error('Error loading office locations:', error)
        if (isMounted) {
          const officeLocationsData = localStorage.getItem('masterOfficeLocations')
          if (officeLocationsData) {
            setOfficeLocations(JSON.parse(officeLocationsData))
          } else {
            setOfficeLocations([])
          }
        }
      }
    }

    loadOfficeLocations()

    return () => {
      isMounted = false
    }
  }, [])

  // Load divisions from Master Division
  useEffect(() => {
    let isMounted = true

    const loadDivisions = async () => {
      try {
        const data = await MasterDivisionAPI.getAll()
        if (isMounted) {
          setDivisions(data || [])
          try {
            localStorage.setItem('masterDivisions', JSON.stringify(data || []))
          } catch (_) {
            // ignore localStorage errors
          }
        }
      } catch (error) {
        console.error('Error loading divisions:', error)
        if (isMounted) {
          const divisionsData = localStorage.getItem('masterDivisions')
          if (divisionsData) {
            setDivisions(JSON.parse(divisionsData))
          } else {
            setDivisions([])
          }
        }
      }
    }

    loadDivisions()

    return () => {
      isMounted = false
    }
  }, [])

  const ptOptions = useMemo(() => {
    const set = new Set<string>()
    officeLocations.forEach((location: any) => {
      if (location?.pt) {
        set.add(location.pt)
      }
    })
    return Array.from(set)
  }, [officeLocations])

  const areaOptions = useMemo(() => {
    if (!formData.pt) return []
    const set = new Set<string>()
    officeLocations.forEach((location: any) => {
      if (location?.pt === formData.pt && location.area) {
        set.add(location.area)
      }
    })
    return Array.from(set)
  }, [formData.pt, officeLocations])

  const areaDetailOptions = useMemo(() => {
    const set = new Set<string>()
    areaDetails.forEach((detail: any) => {
      if (detail?.areaDetail) {
        set.add(detail.areaDetail)
      }
    })
    return Array.from(set)
  }, [areaDetails])

  const sectionOptions = useMemo(() => {
    if (!formData.division) return []
    const set = new Set<string>()
    divisions.forEach((division: any) => {
      if (division.divisionName === formData.division && division.sectionName) {
        set.add(division.sectionName)
      }
    })
    return Array.from(set)
  }, [formData.division, divisions])

  // Update area details when area changes
  useEffect(() => {
    if (formData.area && officeLocations.length > 0) {
      const filteredAreaDetails = officeLocations.filter((location: any) => 
        location.area === formData.area && (!formData.pt || location.pt === formData.pt)
      )
      setAreaDetails(filteredAreaDetails)
      if (!filteredAreaDetails.some((detail: any) => detail.areaDetail === formData.areaDetail)) {
        setFormData(prev => (
          prev.areaDetail === ''
            ? prev
            : { ...prev, areaDetail: '' }
        ))
      }
    } else {
      setAreaDetails([])
      if (formData.areaDetail) {
        setFormData(prev => ({ ...prev, areaDetail: '' }))
      }
    }
  }, [formData.pt, formData.area, officeLocations])

  // Validate and reset section when division changes
  useEffect(() => {
    if (formData.division && formData.section && sectionOptions.length > 0) {
      if (!sectionOptions.includes(formData.section)) {
        setFormData(prev => ({ ...prev, section: '' }))
      }
    } else if (!formData.division && formData.section) {
      setFormData(prev => ({ ...prev, section: '' }))
    }
  }, [formData.division, sectionOptions])

  useEffect(() => {
    if (jobPosting && isOpen) {
      setFormData({
        pt: (jobPosting as any).pt || '',
        noFktk: (jobPosting as any).noFktk || '',
        statusFktk: (jobPosting as any).statusFktk || '',
        division: jobPosting.department || '',
        section: (jobPosting as any).section || '',
        hiringManager: jobPosting.hiringManager || '',
        position: jobPosting.title || '',
        employmentType: jobPosting.type === 'contract' ? 'Kontrak' : jobPosting.type === 'full-time' ? 'Probation' : '',
        typeGrade: (jobPosting as any).typeGrade || '',
        grade2: (jobPosting as any).grade2 || '',
        // Map priority back to P0, P1, P2
        urgentNormal: jobPosting.priority === 'urgent' ? 'P0' : 
                      jobPosting.priority === 'high' ? 'P1' : 
                      jobPosting.priority === 'medium' ? 'P2' : 
                      (jobPosting as any).urgentNormal || '',
        priorityByMonthYear: (jobPosting as any).priorityByMonthYear || '',
        jobSpecification: jobPosting.description || '',
        criteria: (jobPosting as any).criteria || '',
        area: jobPosting.location === 'Site' ? 'Site' : jobPosting.location === 'Head Office' ? 'HO' : '',
        areaDetail: (jobPosting as any).areaDetail || '',
        additionalOrReplacement: (jobPosting as any).additionalOrReplacement || '',
        replacementName: (jobPosting as any).replacementName || '',
        resignReason: (jobPosting as any).resignReason || '',
        totalRequest: (jobPosting as any).totalRequest || '',
        requestDate: formatDateInput((jobPosting as any).requestDate),
        status: (jobPosting as any).currentStatus || (jobPosting as any).status || 'Raise FPTK',
        skills: (jobPosting as any).skills || [],
        yearsOfExperience: (jobPosting as any).yearsOfExperience || '',
        remark: (jobPosting as any).remark || ''
      })
      // Keep an original snapshot for diffing on save
      setOriginalFormSnapshot({
        pt: (jobPosting as any).pt || '',
        noFktk: (jobPosting as any).noFktk || '',
        statusFktk: (jobPosting as any).statusFktk || '',
        division: jobPosting.department || '',
        section: (jobPosting as any).section || '',
        hiringManager: jobPosting.hiringManager || '',
        position: jobPosting.title || '',
        employmentType: jobPosting.type === 'contract' ? 'Kontrak' : jobPosting.type === 'full-time' ? 'Probation' : '',
        typeGrade: (jobPosting as any).typeGrade || '',
        grade2: (jobPosting as any).grade2 || '',
        // Map priority back to P0, P1, P2
        urgentNormal: jobPosting.priority === 'urgent' ? 'P0' : 
                      jobPosting.priority === 'high' ? 'P1' : 
                      jobPosting.priority === 'medium' ? 'P2' : 
                      (jobPosting as any).urgentNormal || '',
        priorityByMonthYear: (jobPosting as any).priorityByMonthYear || '',
        jobSpecification: jobPosting.description || '',
        criteria: (jobPosting as any).criteria || '',
        area: jobPosting.location === 'Site' ? 'Site' : jobPosting.location === 'Head Office' ? 'HO' : '',
        areaDetail: (jobPosting as any).areaDetail || '',
        additionalOrReplacement: (jobPosting as any).additionalOrReplacement || '',
        replacementName: (jobPosting as any).replacementName || '',
        resignReason: (jobPosting as any).resignReason || '',
        totalRequest: (jobPosting as any).totalRequest || '',
        requestDate: formatDateInput((jobPosting as any).requestDate),
        status: (jobPosting as any).currentStatus || (jobPosting as any).status || 'Raise FPTK',
        skills: (jobPosting as any).skills || [],
        yearsOfExperience: (jobPosting as any).yearsOfExperience || '',
        remark: (jobPosting as any).remark || ''
      })
      
      const jobAppliedRaw = Array.isArray((jobPosting as any).appliedCandidates)
        ? (jobPosting as any).appliedCandidates
        : []

      if (jobAppliedRaw.length > 0) {
        const initialApplied = jobAppliedRaw.map((candidate: any) =>
          mergeAppliedCandidateData(candidate)
        )
        setAppliedCandidates(initialApplied)
      } else {
        setAppliedCandidates([])
      }

      // Load candidates from API
      const loadCandidates = async () => {
        try {
          const response = await CandidatesAPI.getAll({}, { page: 1, limit: 100 })
          const rawCandidates = response.data || []
          const mappedCandidates = rawCandidates.map(mapApiCandidate).filter((c: any) => c !== null)
          setAllCandidates(mappedCandidates)
          return mappedCandidates
        } catch (error) {
          console.error('Error loading candidates:', error)
          setAllCandidates([])
          return []
        }
      }
      
      loadCandidates().then((candidates) => {
        const candidateMap = new Map<string, any>(
          candidates.map((candidate: any) => [candidate.id, candidate])
        )

        const enrichedFromJob = jobAppliedRaw.map((candidate: any) => {
          const info = candidateMap.get(candidate.candidateId || candidate.id)
          return mergeAppliedCandidateData(candidate, info)
        })

        const appliedIds = new Set(enrichedFromJob.map((candidate: any) => candidate.id))

        // Load real applied candidates for this specific open position (fallback for legacy data)
        const legacyApplied = candidates
          .filter((candidate: any) => {
            const appliedField = (candidate as any).positionAppliedFor
            const hasAppliedToThis = Array.isArray(appliedField)
              ? appliedField.includes(jobPosting.title)
              : appliedField === jobPosting.title
            const currentPositionMatch =
              candidate.professionalInfo && candidate.professionalInfo.currentPosition === jobPosting.title
            return hasAppliedToThis || currentPositionMatch
          })
          .filter((candidate: any) => !appliedIds.has(candidate.id))
          .map((candidate: any) =>
            mergeAppliedCandidateData(
              {
                id: candidate.id,
                candidateId: candidate.id,
                fullName: candidate.fullName,
                name:
                  candidate.fullName ||
                  `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`.trim(),
                email: candidate.email || candidate.contactInfo.email,
                status: candidate.status || 'Applied',
                appliedDate: candidate.createdAt,
                skills: candidate.skills || candidate.professionalInfo?.skills || [],
                experience: parseInt(
                  candidate.yearsOfExperience || candidate.professionalInfo?.experience || 0
                ),
                jobPostingId: jobPosting.id,
                interviews: candidate.interviews || [],
              },
              candidate
            )
          )

        legacyApplied.forEach((candidate: any) => appliedIds.add(candidate.id))

        setAppliedCandidates([...enrichedFromJob, ...legacyApplied])

        // Generate suggested candidates based on division and skills
        const requiredSkills = (jobPosting as any).skills || []
        const jobDivision = jobPosting.department || formData.division || ''
        
        // Helper function to parse divisions from candidate data
        const parseCandidateDivisions = (candidate: any): string[] => {
          const divisions = new Set<string>()
          
          // Check candidate.division (array or string)
          if (candidate.division !== undefined && candidate.division !== null) {
            if (Array.isArray(candidate.division)) {
              candidate.division.forEach((div: string) => {
                if (div && String(div).trim()) divisions.add(String(div).trim())
              })
            } else if (candidate.division) {
              const trimmed = String(candidate.division).trim()
              if (trimmed) divisions.add(trimmed)
            }
          }
          
          // Check candidate.divisionList (array or string)
          if (candidate.divisionList !== undefined && candidate.divisionList !== null) {
            if (Array.isArray(candidate.divisionList)) {
              candidate.divisionList.forEach((div: string) => {
                if (div && String(div).trim()) divisions.add(String(div).trim())
              })
            } else if (candidate.divisionList) {
              const trimmed = String(candidate.divisionList).trim()
              if (trimmed) divisions.add(trimmed)
            }
          }
          
          // Check candidate.user?.division (string)
          if (candidate.user?.division) {
            const trimmed = String(candidate.user.division).trim()
            if (trimmed) divisions.add(trimmed)
          }
          
          // Check candidate.languages?.divisions (array or string)
          const languagesData = typeof candidate.languages === 'string' 
            ? (() => { try { return JSON.parse(candidate.languages) } catch { return null } })()
            : candidate.languages
          if (languagesData && languagesData.divisions !== undefined) {
            if (Array.isArray(languagesData.divisions)) {
              languagesData.divisions.forEach((div: string) => {
                if (div && String(div).trim()) divisions.add(String(div).trim())
              })
            } else if (languagesData.divisions) {
              const trimmed = String(languagesData.divisions).trim()
              if (trimmed) divisions.add(trimmed)
            }
          }
          
          return Array.from(divisions)
        }
        
        // Helper function to map API candidate to frontend structure
        const mapApiCandidate = (candidate: any) => {
          if (!candidate) return null
          
          // Parse languages data
          const parseLanguagesData = (c: any) => {
            if (!c || !c.languages) return null
            if (typeof c.languages === 'string') {
              try { return JSON.parse(c.languages) } catch { return null }
            }
            return c.languages
          }
          
          // Parse form data diri
          const parseFormDataDiri = (value: any) => {
            if (!value) return null
            if (typeof value === 'string') {
              try { return JSON.parse(value) } catch { return null }
            }
            return value
          }
          
          const languagesData = parseLanguagesData(candidate)
          const formDataDiri = parseFormDataDiri(candidate.formDataDiri)
          
          // Get name from multiple sources
          const firstName = candidate.user?.firstName || formDataDiri?.firstName || ''
          const lastName = candidate.user?.lastName || formDataDiri?.lastName || ''
          
          // Get email
          const email = candidate.user?.email || formDataDiri?.email || ''
          
          // Get skills
          const skills = candidate.skills || candidate.professionalInfo?.skills || []
          
          // Get years of experience
          const yearsOfExperience = candidate.yearsOfExperience || candidate.professionalInfo?.experience || 0
          
          return {
            id: candidate.id,
            personalInfo: {
              firstName,
              lastName,
              dateOfBirth: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().split('T')[0] : '',
              gender: candidate.gender || '',
              nationality: candidate.nationality || '',
              maritalStatus: candidate.maritalStatus || '',
            },
            contactInfo: {
              email,
              phone: candidate.user?.phoneNumber || candidate.phoneNumber || '',
              address: candidate.currentAddress || '',
              city: candidate.city || '',
              state: candidate.state || '',
              country: candidate.country || '',
              zipCode: candidate.zipCode || '',
            },
            professionalInfo: {
              currentPosition: candidate.currentJobTitle || candidate.currentPosition || '',
              currentCompany: candidate.currentCompany || '',
              experience: yearsOfExperience,
              skills,
              education: candidate.educations || [],
              workHistory: candidate.workExperiences || [],
              certifications: candidate.certifications || [],
            },
            yearsOfExperience,
            skills,
            user: candidate.user,
            division: candidate.division,
            divisionList: candidate.divisionList,
            languages: candidate.languages,
          }
        }
        
        // Map candidates to frontend structure
        const mappedCandidates = candidates.map(mapApiCandidate).filter((c: any) => c !== null)
        
        const suggested = mappedCandidates.filter((candidate: any) => {
        const candidateSkills = candidate.professionalInfo?.skills || candidate.skills || []
          
          // Parse divisions from all possible sources
          const allDivisions = parseCandidateDivisions(candidate)
          
          // Check if candidate has matching division (case-insensitive)
          const hasMatchingDivision = jobDivision && allDivisions.some(div => 
            div.toLowerCase() === jobDivision.toLowerCase()
          )
          
          // Don't suggest candidates who already applied
          const notApplied = !appliedIds.has(candidate.id)
          
          // Show candidates with matching division (regardless of skills)
          return hasMatchingDivision && notApplied
        }).slice(0, 10) // Limit to 10 suggestions
        
        setSuggestedCandidates(suggested)
      })
    }
  }, [jobPosting, isOpen])

  // Helper function to parse divisions from candidate data (same as candidates page)
  const parseCandidateDivisions = (candidate: any): string[] => {
    const divisions = new Set<string>()
    
    // Check candidate.division (array or string)
    if (candidate.division !== undefined && candidate.division !== null) {
      if (Array.isArray(candidate.division)) {
        candidate.division.forEach((div: string) => {
          if (div && String(div).trim()) divisions.add(String(div).trim())
        })
      } else if (candidate.division) {
        const trimmed = String(candidate.division).trim()
        if (trimmed) divisions.add(trimmed)
      }
    }
    
    // Check candidate.divisionList (array or string)
    if (candidate.divisionList !== undefined && candidate.divisionList !== null) {
      if (Array.isArray(candidate.divisionList)) {
        candidate.divisionList.forEach((div: string) => {
          if (div && String(div).trim()) divisions.add(String(div).trim())
        })
      } else if (candidate.divisionList) {
        const trimmed = String(candidate.divisionList).trim()
        if (trimmed) divisions.add(trimmed)
      }
    }
    
    // Check candidate.user?.division (string)
    if (candidate.user?.division) {
      const trimmed = String(candidate.user.division).trim()
      if (trimmed) divisions.add(trimmed)
    }
    
    // Check candidate.languages?.divisions (array or string)
    const languagesData = typeof candidate.languages === 'string' 
      ? (() => { try { return JSON.parse(candidate.languages) } catch { return null } })()
      : candidate.languages
    if (languagesData && languagesData.divisions !== undefined) {
      if (Array.isArray(languagesData.divisions)) {
        languagesData.divisions.forEach((div: string) => {
          if (div && String(div).trim()) divisions.add(String(div).trim())
        })
      } else if (languagesData.divisions) {
        const trimmed = String(languagesData.divisions).trim()
        if (trimmed) divisions.add(trimmed)
      }
    }
    
    return Array.from(divisions)
  }

  const formatDateInput = (value: any) => {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  }

  // Helper function to map API candidate to frontend structure
  const mapApiCandidate = (candidate: any) => {
    if (!candidate) return null
    
    // Parse languages data
    const parseLanguagesData = (c: any) => {
      if (!c || !c.languages) return null
      if (typeof c.languages === 'string') {
        try { return JSON.parse(c.languages) } catch { return null }
      }
      return c.languages
    }
    
    // Parse form data diri
    const parseFormDataDiri = (value: any) => {
      if (!value) return null
      if (typeof value === 'string') {
        try { return JSON.parse(value) } catch { return null }
      }
      return value
    }
    
    const languagesData = parseLanguagesData(candidate)
    const formDataDiri = parseFormDataDiri(candidate.formDataDiri)
    
    const fallbackFullName = formDataDiri?.fullName || candidate.fullName || candidate.name || ''
    const [fallbackFirst, ...fallbackRest] = fallbackFullName ? fallbackFullName.split(' ') : ['']
    const fallbackLast = fallbackRest.join(' ')
    
    // Get name from multiple sources
    const firstName = candidate.user?.firstName
      || candidate.personalInfo?.firstName
      || formDataDiri?.firstName
      || fallbackFirst
      || candidate.firstName
      || ''
    const lastName = candidate.user?.lastName
      || candidate.personalInfo?.lastName
      || formDataDiri?.lastName
      || fallbackLast
      || candidate.lastName
      || ''
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || fallbackFullName || 'Unknown Candidate'
    
    // Get email
    const email = candidate.user?.email
      || candidate.contactInfo?.email
      || formDataDiri?.email
      || candidate.email
      || ''
    
    // Get skills
    const skills = candidate.skills || candidate.professionalInfo?.skills || []
    
    // Get years of experience
    const yearsOfExperience = Number(candidate.yearsOfExperience ?? candidate.professionalInfo?.experience ?? 0) || 0
    
    return {
      id: candidate.id,
      fullName,
      name: fullName,
      email,
      yearsOfExperience,
      experience: yearsOfExperience,
      personalInfo: {
        firstName,
        lastName,
        dateOfBirth: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().split('T')[0] : '',
        gender: candidate.gender || '',
        nationality: candidate.nationality || '',
        maritalStatus: candidate.maritalStatus || '',
      },
      contactInfo: {
        email,
        phone: candidate.user?.phoneNumber || candidate.phoneNumber || '',
        address: candidate.currentAddress || '',
        city: candidate.city || '',
        state: candidate.state || '',
        country: candidate.country || '',
        zipCode: candidate.zipCode || '',
      },
      professionalInfo: {
        currentPosition: candidate.currentJobTitle || candidate.currentPosition || '',
        currentCompany: candidate.currentCompany || '',
        experience: yearsOfExperience,
        skills,
        education: candidate.educations || [],
        workHistory: candidate.workExperiences || [],
        certifications: candidate.certifications || [],
      },
      skills,
      user: candidate.user,
      division: candidate.division,
      divisionList: candidate.divisionList,
      languages: candidate.languages,
    }
  }

  // Update suggested candidates when division changes
  useEffect(() => {
    if (formData.division) {
      const loadSuggestedCandidates = async () => {
        try {
          console.log('[EditJobPostingModal] Loading suggested candidates for division:', formData.division)
          const response = await CandidatesAPI.getAll({}, { page: 1, limit: 100 })
          const rawCandidates = response.data || []
          console.log('[EditJobPostingModal] Loaded candidates:', rawCandidates.length)
          
          // Map candidates to frontend structure
        const candidates = rawCandidates.map(mapApiCandidate).filter((c: any) => c !== null)
          const jobDivision = formData.division
          
          const suggested = candidates.filter((candidate: any) => {
            // Parse divisions from all possible sources
            const allDivisions = parseCandidateDivisions(candidate)
            console.log('[EditJobPostingModal] Candidate divisions:', allDivisions, 'for candidate:', candidate.id)
            
            // Check if candidate has matching division (case-insensitive)
            const hasMatchingDivision = jobDivision && allDivisions.some(div => 
              div.toLowerCase() === jobDivision.toLowerCase()
            )
            
            // Don't suggest candidates who already applied
            const notApplied = !appliedCandidates.find((applied: any) => applied.id === candidate.id)
            
            const shouldInclude = hasMatchingDivision && notApplied
            if (shouldInclude) {
              console.log('[EditJobPostingModal] Including candidate:', candidate.id, 'with divisions:', allDivisions)
            }
            
            // Show candidates with matching division (regardless of skills)
            return shouldInclude
          }).slice(0, 10) // Limit to 10 suggestions
          
          console.log('[EditJobPostingModal] Suggested candidates:', suggested.length)
          setSuggestedCandidates(suggested)
        } catch (error) {
          console.error('Error loading suggested candidates:', error)
          setSuggestedCandidates([])
        }
      }
      
      loadSuggestedCandidates()
    } else if (!formData.division) {
      setSuggestedCandidates([])
    }
  }, [formData.division, appliedCandidates])

  // Simple localStorage logger
  const appendOpenPositionLog = (entry: any) => {
    try {
      const existing = localStorage.getItem('openPositionLogs')
      const logs = existing ? JSON.parse(existing) : []
      logs.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        jobPostingId: jobPosting?.id,
        ...entry,
      })
      localStorage.setItem('openPositionLogs', JSON.stringify(logs))
    } catch (_) {
      // ignore logging failures
    }
  }

  const handleStatusChange = (newStatus: string) => {
    setFormData(prev => {
      const oldStatus = prev.status
      const updated = { ...prev, status: newStatus }
      if (jobPosting) {
        appendOpenPositionLog({
          type: 'JOB_STATUS_UPDATE',
          details: { oldStatus, newStatus },
        })
      }
      return updated
    })
    if (onStatusUpdate && jobPosting) {
      onStatusUpdate(jobPosting.id, newStatus)
    }
  }

  const handleCandidateStatusChange = (candidateId: string, newStatus: string) => {
    setAppliedCandidates(prev => {
      const target = prev.find(c => c.id === candidateId)
      const oldStatus = target ? target.status : undefined
      const updated = prev.map(candidate => 
        candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate
      )
      if (jobPosting) {
        appendOpenPositionLog({
          type: 'CANDIDATE_STATUS_UPDATE',
          details: {
            candidateId,
            candidateName: target?.name,
            oldStatus,
            newStatus,
          },
        })
      }
      return updated
    })
    
    if (onCandidateStatusUpdate && jobPosting) {
      onCandidateStatusUpdate(jobPosting.id, candidateId, newStatus)
    }
  }

  const handleAddSuggestedCandidate = (candidate: any) => {
    const newAppliedCandidate = mergeAppliedCandidateData(
      {
        ...candidate,
        id: candidate.id,
        candidateId: candidate.id,
        status: 'Applied',
        appliedDate: new Date().toISOString(),
        jobPostingId: jobPosting?.id,
      },
      candidate
    )

    setAppliedCandidates(prev => [...prev, newAppliedCandidate])
    setSuggestedCandidates(prev => prev.filter(c => c.id !== candidate.id))
    if (jobPosting) {
      appendOpenPositionLog({
        type: 'APPLIED_CANDIDATE_ADDED',
        details: {
          candidateId: candidate.id,
          candidateName: candidate.fullName || candidate.name,
        },
      })
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'pt') {
      setFormData(prev => ({
        ...prev,
        pt: value,
        area: '',
        areaDetail: ''
      }))
      return
    }

    if (name === 'area') {
      setFormData(prev => ({
        ...prev,
        area: value,
        areaDetail: ''
      }))
      return
    }

    if (name === 'division') {
      setFormData(prev => ({
        ...prev,
        division: value,
        section: '' // Reset section when division changes
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Save applied candidates data back to localStorage
    const candidatesData = localStorage.getItem('candidates')
    const candidates = candidatesData ? JSON.parse(candidatesData) : []
    
    // Update candidates with interview details
    const updatedCandidates = candidates.map((candidate: any) => {
      const appliedCandidate = appliedCandidates.find(applied => applied.id === candidate.id)
      if (appliedCandidate) {
        return {
          ...candidate,
          status: appliedCandidate.status,
          interviews: appliedCandidate.interviews || [],
          updatedAt: new Date().toISOString()
        }
      }
      return candidate
    })
    
    // Save updated candidates to localStorage
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates))
    
    // Log form diffs
    if (jobPosting && originalFormSnapshot) {
      const changed: Record<string, { old: any, new: any }> = {}
      Object.keys(originalFormSnapshot).forEach((key) => {
        const oldVal = (originalFormSnapshot as any)[key]
        const newVal = (formData as any)[key]
        const isArray = Array.isArray(oldVal) || Array.isArray(newVal)
        const equal = isArray ? JSON.stringify(oldVal) === JSON.stringify(newVal) : oldVal === newVal
        if (!equal) {
          changed[key] = { old: oldVal, new: newVal }
        }
      })
      if (Object.keys(changed).length > 0) {
        appendOpenPositionLog({
          type: 'JOB_POSTING_UPDATED',
          details: changed,
        })
      }
    }
    
    onSave({ ...formData, appliedCandidates })
    onClose()
  }

  if (!isOpen || !jobPosting) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '95%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Edit Open Position - {jobPosting.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#6b7280'
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <form onSubmit={handleSubmit}>
            {/* Job Posting Information */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Open Position Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* PT */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    PT
                  </label>
                  <select
                    name="pt"
                    value={formData.pt}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select PT</option>
                    {ptOptions.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                    {formData.pt && !ptOptions.includes(formData.pt) && (
                      <option value={formData.pt}>{formData.pt}</option>
                    )}
                  </select>
                </div>

                {/* Division */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Division
                  </label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Division</option>
                    {Array.from(new Set(divisions.map((d: any) => d.divisionName))).map((divisionName) => (
                      <option key={divisionName} value={divisionName}>
                        {divisionName}
                      </option>
                    ))}
                    {formData.division && !Array.from(new Set(divisions.map((d: any) => d.divisionName))).includes(formData.division) && (
                      <option value={formData.division}>{formData.division}</option>
                    )}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Hiring Manager */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Hiring Manager
                  </label>
                  <input
                    type="text"
                    name="hiringManager"
                    value={formData.hiringManager}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Employment Type */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Probation">Probation</option>
                  </select>
                </div>

                {/* Area */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Area
                  </label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    disabled={!formData.pt}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: formData.pt ? 'white' : '#f3f4f6'
                    }}
                  >
                    <option value="">{formData.pt ? 'Select Area' : 'Select PT first'}</option>
                    {areaOptions.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                    {formData.area && !areaOptions.includes(formData.area) && (
                      <option value={formData.area}>{formData.area}</option>
                    )}
                  </select>
                </div>

                {/* Area Detail */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Area Detail
                  </label>
                  <select
                    name="areaDetail"
                    value={formData.areaDetail}
                    onChange={handleInputChange}
                    disabled={!formData.area}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: formData.area ? 'white' : '#f3f4f6'
                    }}
                  >
                    <option value="">{formData.area ? 'Select Area Detail' : 'Select Area first'}</option>
                    {areaDetailOptions.map((detail) => (
                      <option key={detail} value={detail}>
                        {detail}
                      </option>
                    ))}
                    {formData.areaDetail && !areaDetailOptions.includes(formData.areaDetail) && (
                      <option value={formData.areaDetail}>{formData.areaDetail}</option>
                    )}
                  </select>
                </div>

                {/* No FKTK */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    No FKTK
                  </label>
                  <input
                    type="text"
                    name="noFktk"
                    value={formData.noFktk}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Status FKTK */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Status FKTK
                  </label>
                  <select
                    name="statusFktk"
                    value={formData.statusFktk}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Section
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Section</option>
                    {sectionOptions.map((section, index) => (
                      <option key={index} value={section}>
                        {section}
                      </option>
                    ))}
                    {formData.section && !sectionOptions.includes(formData.section) && (
                      <option value={formData.section}>{formData.section}</option>
                    )}
                  </select>
                </div>

                {/* Type Grade */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Type Grade
                  </label>
                  <input
                    type="text"
                    name="typeGrade"
                    value={formData.typeGrade}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Grade2 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Grade2
                  </label>
                  <input
                    type="text"
                    name="grade2"
                    value={formData.grade2}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Priority
                  </label>
                  <select
                    name="urgentNormal"
                    value={formData.urgentNormal}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Priority</option>
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                </div>

                {/* Priority by Month-Year */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Priority by Month-Year
                  </label>
                  <input
                    type="month"
                    name="priorityByMonthYear"
                    value={formData.priorityByMonthYear}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  />
                </div>

                {/* Criteria */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Criteria
                  </label>
                  <select
                    name="criteria"
                    value={formData.criteria}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Criteria</option>
                    <option value="Staff">Staff</option>
                    <option value="Non Staff">Non Staff</option>
                  </select>
                </div>

                {/* Additional or Replacement */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Additional or Replacement
                  </label>
                  <select
                    name="additionalOrReplacement"
                    value={formData.additionalOrReplacement}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="Additional">Additional</option>
                    <option value="Replacement">Replacement</option>
                  </select>
                </div>

                {/* Replacement Name */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Replacement Name
                  </label>
                  <input
                    type="text"
                    name="replacementName"
                    value={formData.replacementName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Resign Reason */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Resign Reason
                  </label>
                  <input
                    type="text"
                    name="resignReason"
                    value={formData.resignReason}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Total Request */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Total Request
                  </label>
                  <input
                    type="text"
                    name="totalRequest"
                    value={formData.totalRequest}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Request Date */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Request Date
                  </label>
                  <input
                    type="date"
                    name="requestDate"
                    value={formData.requestDate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Job Specification */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Job Specification
                </label>
                <textarea
                  name="jobSpecification"
                  value={formData.jobSpecification}
                  onChange={handleInputChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Status Management */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Job Posting Status
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Current Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="Raise FPTK">Raise FPTK</option>
                  <option value="CV Hunting (Sourcing Candidate)">CV Hunting (Sourcing Candidate)</option>
                  <option value="Piskotest & Technical Test">Piskotest & Technical Test</option>
                  <option value="Interview User">Interview User</option>
                  <option value="Offering Process">Offering Process</option>
                  <option value="Medical Check Up (MCU)">Medical Check Up (MCU)</option>
                  <option value="Signing">Signing</option>
                  <option value="On Boarding">On Boarding</option>
                </select>
              </div>
            </div>

            {/* Remark */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Remark
              </h3>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                rows={3}
                maxLength={2048}
                placeholder="Enter any additional notes (max 2048 characters)"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Years of Experience */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Years of Experience
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Required Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Skills Management */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Required Skills
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Previously Saved Skills:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{
                          marginLeft: '4px',
                          background: 'none',
                          border: 'none',
                          color: '#3730a3',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#4f46e5',
                    cursor: 'pointer'
                  }}
                >
                  Add Skill
                </button>
              </div>
            </div>

            {/* Applied Candidates */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Applied Candidates Management
              </h3>
              
              {/* Applied Candidates */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Applied Candidates ({appliedCandidates.length})
                </h4>
                {appliedCandidates.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {appliedCandidates.map((candidate) => (
                    <div key={candidate.id} style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                            {candidate.name || candidate.fullName || 'Unknown Candidate'}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                            {candidate.email || 'No email available'}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                            Applied: {formatDate(candidate.appliedDate)} | Experience: {candidate.experience || candidate.yearsOfExperience || 0} years
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(candidate.skills || candidate.professionalInfo?.skills || []).map((skill: string, index: number) => (
                              <span key={index} style={{
                                padding: '2px 6px',
                                backgroundColor: '#e0e7ff',
                                color: '#3730a3',
                                borderRadius: '3px',
                                fontSize: '10px',
                                fontWeight: '500'
                              }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                            Status
                          </label>
                          <select
                            value={candidate.status}
                            onChange={(e) => handleCandidateStatusChange(candidate.id, e.target.value)}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px',
                              backgroundColor: 'white'
                            }}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Interviewed">Interviewed</option>
                            <option value="Offer Extended">Offer Extended</option>
                            <option value="Offer Accepted">Offer Accepted</option>
                            <option value="Offer Declined">Offer Declined</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Withdrawn">Withdrawn</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Interview Scheduling Section */}
                      {candidate.status === 'Interview Scheduled' && (
                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Interview Details
                          </div>
                          
                          {/* Existing Interviews */}
                          {(candidate.interviews || []).map((interview: any, interviewIndex: number) => (
                            <div key={interviewIndex} style={{ 
                              marginBottom: '12px', 
                              padding: '8px', 
                              backgroundColor: 'white', 
                              borderRadius: '4px', 
                              border: '1px solid #e5e7eb' 
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                                  Interview {interviewIndex + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAppliedCandidates(prev => prev.map(c => 
                                      c.id === candidate.id ? { 
                                        ...c, 
                                        interviews: (c.interviews || []).filter((_: any, i: number) => i !== interviewIndex)
                                      } : c
                                    ))
                                    appendOpenPositionLog({
                                      type: 'INTERVIEW_REMOVED',
                                      details: {
                                        candidateId: candidate.id,
                                        candidateName: candidate.name || candidate.fullName,
                                        interviewIndex,
                                      },
                                    })
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                              
                              {/* Interviewer */}
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                                  Interviewer
                                </label>
                                <input
                                  type="text"
                                  value={interview.interviewer || ''}
                                  onChange={(e) => {
                                    const updatedInterviews = [...(candidate.interviews || [])]
                                    updatedInterviews[interviewIndex] = { ...updatedInterviews[interviewIndex], interviewer: e.target.value }
                                    setAppliedCandidates(prev => prev.map(c => 
                                      c.id === candidate.id ? { ...c, interviews: updatedInterviews } : c
                                    ))
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '11px'
                                  }}
                                />
                              </div>
                              
                              {/* Date and Time */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    value={interview.date || ''}
                                    onChange={(e) => {
                                      const updatedInterviews = [...(candidate.interviews || [])]
                                      updatedInterviews[interviewIndex] = { ...updatedInterviews[interviewIndex], date: e.target.value }
                                      setAppliedCandidates(prev => prev.map(c => 
                                        c.id === candidate.id ? { ...c, interviews: updatedInterviews } : c
                                      ))
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '4px 6px',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '4px',
                                      fontSize: '11px'
                                    }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                                    Time
                                  </label>
                                  <input
                                    type="time"
                                    value={interview.time || ''}
                                    onChange={(e) => {
                                      const updatedInterviews = [...(candidate.interviews || [])]
                                      updatedInterviews[interviewIndex] = { ...updatedInterviews[interviewIndex], time: e.target.value }
                                      setAppliedCandidates(prev => prev.map(c => 
                                        c.id === candidate.id ? { ...c, interviews: updatedInterviews } : c
                                      ))
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '4px 6px',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '4px',
                                      fontSize: '11px'
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Interview Results */}
                              <div style={{ marginTop: '8px' }}>
                                <label style={{ fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                                  Interview Results <span style={{ fontSize: '10px', color: '#6b7280' }}>(max 1024 chars)</span>
                                </label>
                                <textarea
                                  value={interview.results || ''}
                                  onChange={(e) => {
                                    const updatedInterviews = [...(candidate.interviews || [])]
                                    updatedInterviews[interviewIndex] = { ...updatedInterviews[interviewIndex], results: e.target.value.substring(0, 1024) }
                                    setAppliedCandidates(prev => prev.map(c => 
                                      c.id === candidate.id ? { ...c, interviews: updatedInterviews } : c
                                    ))
                                  }}
                                  maxLength={1024}
                                  rows={3}
                                  style={{
                                    width: '100%',
                                    padding: '4px 6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    resize: 'vertical'
                                  }}
                                  placeholder="Enter interview results..."
                                />
                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', textAlign: 'right' }}>
                                  {(interview.results || '').length}/1024 characters
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add New Interview Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCandidates(prev => prev.map(c => 
                                c.id === candidate.id ? { 
                                  ...c, 
                                  interviews: [...(c.interviews || []), { interviewer: '', date: '', time: '', results: '' }]
                                } : c
                              ))
                              appendOpenPositionLog({
                                type: 'INTERVIEW_ADDED',
                                details: {
                                  candidateId: candidate.id,
                                  candidateName: candidate.name || candidate.fullName,
                                },
                              })
                            }}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '500',
                              color: '#374151',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            + Add Interview
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      No candidates have applied to this position yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Suggested Candidates */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Suggested Candidates ({suggestedCandidates.length})
                </h4>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                  Candidates with more than 3 matching required skills
                </p>
                {suggestedCandidates.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {suggestedCandidates.map((candidate) => (
                      <div key={candidate.id} style={{
                        padding: '16px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                              {candidate.fullName || candidate.name || [candidate.personalInfo?.firstName, candidate.personalInfo?.lastName].filter(Boolean).join(' ') || 'Unknown Candidate'}
                            </h5>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                              {candidate.email || candidate.contactInfo?.email || 'No email available'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                              Experience: {candidate.experience || candidate.yearsOfExperience || candidate.professionalInfo?.experience || 0} years
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {(candidate.skills || candidate.professionalInfo?.skills || []).map((skill: string, index: number) => (
                                <span key={index} style={{
                                  padding: '2px 6px',
                                  backgroundColor: '#e0e7ff',
                                  color: '#3730a3',
                                  borderRadius: '3px',
                                  fontSize: '10px',
                                  fontWeight: '500'
                                }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedCandidate(candidate)}
                            style={{
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: 'white',
                              backgroundColor: '#10b981',
                              cursor: 'pointer'
                            }}
                          >
                            Add to Applied
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      No candidates found with more than 3 matching required skills.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#4f46e5',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
