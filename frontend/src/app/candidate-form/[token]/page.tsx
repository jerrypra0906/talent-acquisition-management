'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

interface FormData {
  // Personal Information
  fullName: string
  placeOfBirth: string
  dateOfBirth: string
  gender: string
  ethnicity: string
  maritalStatus: string
  height: string
  weight: string
  idNumber: string
  taxNumber: string
  bpjsNumber: string
  healthStatus: string
  drivingLicense: string
  bloodType: string
  currentAddress: string
  permanentAddress: string
  phoneNumber: string
  email: string

  // Family Members
  familyMembers: Array<{
    relationType: string
    name: string
    gender: string
    dateOfBirth: string
    education: string
    occupation: string
  }>

  // Education
  education: Array<{
    type: string
    startMonth: string
    startYear: string
    endMonth: string
    endYear: string
    institutionName: string
    major: string
    place: string
    certification: string
  }>

  // Languages
  languages: Array<{
    language: string
    speaking: string
    writing: string
  }>

  // Social Activities
  socialActivities: Array<{
    startMonth: string
    startYear: string
    endMonth: string
    endYear: string
    organizationName: string
    place: string
    position: string
    organizationDescription: string
  }>

  // References
  references: Array<{
    name: string
    companyName: string
    address: string
    phoneNo: string
    position: string
    relation: string
  }>

  // Work Experience
  workExperience: Array<{
    startMonth: string
    startYear: string
    endMonth: string
    endYear: string
    companyName: string
    companyAddress: string
    startingPosition: string
    lastPosition: string
    startingSalary: string
    lastSalary: string
    resignationReason: string
    jobDescription: string
  }>

  // Other Information
  emergencyContactName: string
  emergencyContactAddress: string
  emergencyRelation: string
  emergencyPhoneNo: string
  canContactReferences: boolean
  previousEmployment: boolean
  previousEmploymentDetails: string
  familyInCompany: boolean
  familyInCompanyDetails: string
  seriousIllness: boolean
  seriousIllnessDetails: string
  authorityProblems: boolean
  authorityProblemsDetails: string
  hobbies: string
  physicalProblems: boolean
  physicalProblemsDetails: string
  motivationToJoin: string
  willingToRelocate: boolean
  relocationReason: string
  willingToTravel: boolean
  travelReason: string
  currentBenefits: string
  expectedSalary: string
  availableStartDate: string
  declarationAccepted: boolean
}

const normalizeLanguages = (value: any) => {
  if (!value) return []

  let parsed = value
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return []
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item) => ({
      language: item?.language || item?.name || '',
      speaking: item?.speaking || item?.level || '',
      writing: item?.writing || item?.level || '',
    }))
  }

  if (typeof parsed === 'object') {
    if (Array.isArray(parsed.languages)) {
      return parsed.languages.map((item: any) => ({
        language: item?.language || item?.name || '',
        speaking: item?.speaking || item?.level || '',
        writing: item?.writing || item?.level || '',
      }))
    }
  }

  return []
}

export default function CandidateFormPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tokenInfo, setTokenInfo] = useState<{ token: string; expiresAt: string; submittedAt?: string | null; createdAt: string } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    placeOfBirth: '',
    dateOfBirth: '',
    gender: '',
    ethnicity: '',
    maritalStatus: '',
    height: '',
    weight: '',
    idNumber: '',
    taxNumber: '',
    bpjsNumber: '',
    healthStatus: '',
    drivingLicense: '',
    bloodType: '',
    currentAddress: '',
    permanentAddress: '',
    phoneNumber: '',
    email: '',
    familyMembers: [],
    education: [],
    languages: [],
    socialActivities: [],
    references: [],
    workExperience: [],
    emergencyContactName: '',
    emergencyContactAddress: '',
    emergencyRelation: '',
    emergencyPhoneNo: '',
    canContactReferences: false,
    previousEmployment: false,
    previousEmploymentDetails: '',
    familyInCompany: false,
    familyInCompanyDetails: '',
    seriousIllness: false,
    seriousIllnessDetails: '',
    authorityProblems: false,
    authorityProblemsDetails: '',
    hobbies: '',
    physicalProblems: false,
    physicalProblemsDetails: '',
    motivationToJoin: '',
    willingToRelocate: false,
    relocationReason: '',
    willingToTravel: false,
    travelReason: '',
    currentBenefits: '',
    expectedSalary: '',
    availableStartDate: '',
    declarationAccepted: false,
  })

  useEffect(() => {
    if (!token) {
      return
    }

    setIsLoading(true)
    setSubmitError(null)

    ;(async () => {
      try {
          const response = await api.get(`/candidates/by-token/${token}`)

        if (response.data?.success && response.data.data) {
          const { candidate, token: tokenDetails } = response.data.data
          setTokenInfo(tokenDetails)
          setIsValid(true)

          setFormData(prev => ({
            ...prev,
            // Personal Information
            fullName: `${candidate.user?.firstName || ''} ${candidate.user?.lastName || ''}`.trim() || '',
            placeOfBirth: candidate.placeOfBirth || '',
            dateOfBirth: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().split('T')[0] : '',
            gender: candidate.gender || '',
            ethnicity: candidate.ethnicity || '', // Extracted earlier from languages
            maritalStatus: candidate.maritalStatus || '',
            height: candidate.height?.toString() || '',
            weight: candidate.weight?.toString() || '',
            idNumber: candidate.nationalId || '',
            taxNumber: candidate.npwpNumber || '',
            bpjsNumber: candidate.bpjsHealthNumber || '',
            healthStatus: candidate.healthStatus || '',
            drivingLicense: Array.isArray(candidate.drivingLicense) ? candidate.drivingLicense.join(', ') : (candidate.drivingLicense || ''),
            bloodType: candidate.bloodType || '',
            currentAddress: candidate.currentAddress || '',
            permanentAddress: candidate.permanentAddress || '',
            phoneNumber: candidate.user?.phoneNumber || '',
            email: candidate.user?.email || '',

            // Arrays - load from relations
            familyMembers: [], // Not yet supported
            education: candidate.educations?.map((edu: any) => ({
              type: edu.degree || '',
              startMonth: edu.startDate ? (new Date(edu.startDate).getMonth() + 1).toString() : '',
              startYear: edu.startDate ? new Date(edu.startDate).getFullYear().toString() : '',
              endMonth: edu.endDate ? (new Date(edu.endDate).getMonth() + 1).toString() : '',
              endYear: edu.endDate ? new Date(edu.endDate).getFullYear().toString() : '',
              institutionName: edu.institution || '',
              major: edu.fieldOfStudy || '',
              place: edu.location || '',
              certification: edu.certificateNumber || '',
            })) || [],
            languages: normalizeLanguages(candidate.languages),
            socialActivities: [], // Not yet supported
            references: candidate.references?.map((ref: any) => ({
              name: ref.name || '',
              companyName: ref.company || '',
              address: ref.address || '',
              phoneNo: ref.phone || '',
              position: ref.position || '',
              relation: ref.relationship || '',
            })) || [],
            workExperience: candidate.workExperiences?.map((exp: any) => ({
              startMonth: exp.startDate ? (new Date(exp.startDate).getMonth() + 1).toString() : '',
              startYear: exp.startDate ? new Date(exp.startDate).getFullYear().toString() : '',
              endMonth: exp.endDate ? (new Date(exp.endDate).getMonth() + 1).toString() : '',
              endYear: exp.endDate ? new Date(exp.endDate).getFullYear().toString() : '',
              companyName: exp.companyName || '',
              companyAddress: exp.location || '',
              startingPosition: exp.jobTitle || '',
              lastPosition: exp.jobTitle || '',
              startingSalary: exp.salary?.toString() || '',
              lastSalary: exp.salary?.toString() || '',
              resignationReason: exp.reasonForLeaving || '',
              jobDescription: exp.description || '',
            })) || [],

            // Other Information
            emergencyContactName: candidate.emergencyContact || '',
            emergencyContactAddress: '',
            emergencyRelation: candidate.emergencyRelation || '',
            emergencyPhoneNo: candidate.emergencyPhone || '',
            canContactReferences: false,
            previousEmployment: false,
            previousEmploymentDetails: '',
            familyInCompany: false,
            familyInCompanyDetails: '',
            seriousIllness: false,
            seriousIllnessDetails: '',
            authorityProblems: false,
            authorityProblemsDetails: '',
            hobbies: '',
            physicalProblems: false,
            physicalProblemsDetails: '',
            motivationToJoin: '',
            willingToRelocate: false,
            relocationReason: '',
            willingToTravel: false,
            travelReason: '',
            currentBenefits: '',
            expectedSalary: candidate.expectedSalary?.toString() || '',
            availableStartDate: candidate.availableFrom ? new Date(candidate.availableFrom).toISOString().split('T')[0] : '',
            declarationAccepted: false,
          }))
        } else {
          setIsValid(false)
          setSubmitError(response.data?.message || 'Invalid or expired link.')
        }
      } catch (error: any) {
        console.error('Error loading candidate data:', error)
        setIsValid(false)
        setSubmitError(error?.response?.data?.message || (error instanceof Error ? error.message : 'This link is invalid, expired, or has already been used.'))
      } finally {
        setIsLoading(false)
      }
    })()
  }, [token])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const addArrayItem = (field: keyof FormData, item: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), item]
    }))
  }

  const removeArrayItem = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field: keyof FormData, index: number, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => i === index ? { ...item, ...updates } : item)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.declarationAccepted) {
      setSubmitError('You must accept the declaration to submit the form.')
      return
    }

    if (!isValid) {
      setSubmitError('Invalid or expired link.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Submit form data to API
      const response = await api.put(`/candidates/by-token/${token}`, {
        formData: formData,
      })

      if (response.data.success) {
        alert('Form submitted successfully! Thank you for completing the form.')
        window.close()
      } else {
        setSubmitError(response.data.message || 'Failed to submit form.')
      }
    } catch (error: any) {
      console.error('Error submitting form:', error)
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message)
      } else if (error.response?.status === 404) {
        setSubmitError('Candidate not found.')
      } else {
        setSubmitError('An error occurred while submitting the form. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Invalid Link</h3>
            <p className="mt-2 text-sm text-gray-500">
              {submitError || 'This link is invalid, expired, or has already been used.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Data Diri</h1>
          <p className="text-sm text-gray-600">Please fill in all the required information below.</p>
        </div>

        {tokenInfo && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-4 mb-6">
            Please submit this form before{' '}
            <span className="font-medium">
              {new Date(tokenInfo.expiresAt).toLocaleString()}
            </span>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Place of Birth *</label>
                <input
                  type="text"
                  name="placeOfBirth"
                  required
                  value={formData.placeOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ethnicity *</label>
                <input
                  type="text"
                  name="ethnicity"
                  required
                  value={formData.ethnicity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Marital Status (PTKP) *</label>
                <select
                  name="maritalStatus"
                  required
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Status</option>
                  <option value="TK/0">TK/0</option>
                  <option value="K/0">K/0</option>
                  <option value="K/1">K/1</option>
                  <option value="K/2">K/2</option>
                  <option value="K/3">K/3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm) *</label>
                <input
                  type="number"
                  name="height"
                  required
                  value={formData.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg) *</label>
                <input
                  type="number"
                  name="weight"
                  required
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Number (KTP) *</label>
                <input
                  type="text"
                  name="idNumber"
                  required
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Number (NPWP) *</label>
                <input
                  type="text"
                  name="taxNumber"
                  required
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">BPJS Number *</label>
                <input
                  type="text"
                  name="bpjsNumber"
                  required
                  value={formData.bpjsNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Health Status *</label>
                <select
                  name="healthStatus"
                  required
                  value={formData.healthStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Status</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Not Healthy">Not Healthy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driving License</label>
                <input
                  type="text"
                  name="drivingLicense"
                  value={formData.drivingLicense}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Type *</label>
                <select
                  name="bloodType"
                  required
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Current Address *</label>
                <textarea
                  name="currentAddress"
                  required
                  rows={3}
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Permanent Address *</label>
                <textarea
                  name="permanentAddress"
                  required
                  rows={3}
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Family Members Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Family Members</h2>
              <button
                type="button"
                onClick={() => addArrayItem('familyMembers', {
                  relationType: '',
                  name: '',
                  gender: '',
                  dateOfBirth: '',
                  education: '',
                  occupation: ''
                })}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                + Add Family Member
              </button>
            </div>
            {formData.familyMembers.map((member, index) => (
              <div key={index} className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relation Type *</label>
                    <select
                      required
                      value={member.relationType}
                      onChange={(e) => updateArrayItem('familyMembers', index, { relationType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select Relation</option>
                      <option value="Parents">Parents</option>
                      <option value="Brother/Sister">Brother/Sister</option>
                      <option value="Spouse(Wife/Husband)">Spouse(Wife/Husband)</option>
                      <option value="Child">Child</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={member.name}
                      onChange={(e) => updateArrayItem('familyMembers', index, { name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender *</label>
                    <select
                      required
                      value={member.gender}
                      onChange={(e) => updateArrayItem('familyMembers', index, { gender: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={member.dateOfBirth}
                      onChange={(e) => updateArrayItem('familyMembers', index, { dateOfBirth: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education</label>
                    <input
                      type="text"
                      value={member.education}
                      onChange={(e) => updateArrayItem('familyMembers', index, { education: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Occupation</label>
                    <input
                      type="text"
                      value={member.occupation}
                      onChange={(e) => updateArrayItem('familyMembers', index, { occupation: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('familyMembers', index)}
                  className="mt-2 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Education</h2>
              <button
                type="button"
                onClick={() => addArrayItem('education', {
                  type: '',
                  startMonth: '',
                  startYear: '',
                  endMonth: '',
                  endYear: '',
                  institutionName: '',
                  major: '',
                  place: '',
                  certification: ''
                })}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                + Add Education
              </button>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      required
                      value={edu.type}
                      onChange={(e) => updateArrayItem('education', index, { type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select Type</option>
                      <option value="Formal">Formal</option>
                      <option value="Non-Formal">Non-Formal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Period (Month-Year) *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Month"
                        required
                        value={edu.startMonth}
                        onChange={(e) => updateArrayItem('education', index, { startMonth: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="Year"
                        required
                        value={edu.startYear}
                        onChange={(e) => updateArrayItem('education', index, { startYear: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Period (Month-Year)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Month"
                        value={edu.endMonth}
                        onChange={(e) => updateArrayItem('education', index, { endMonth: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="Year"
                        value={edu.endYear}
                        onChange={(e) => updateArrayItem('education', index, { endYear: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution Name *</label>
                    <input
                      type="text"
                      required
                      value={edu.institutionName}
                      onChange={(e) => updateArrayItem('education', index, { institutionName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Major</label>
                    <input
                      type="text"
                      value={edu.major}
                      onChange={(e) => updateArrayItem('education', index, { major: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Place</label>
                    <input
                      type="text"
                      value={edu.place}
                      onChange={(e) => updateArrayItem('education', index, { place: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Certification</label>
                    <input
                      type="text"
                      value={edu.certification}
                      onChange={(e) => updateArrayItem('education', index, { certification: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('education', index)}
                  className="mt-2 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Languages Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Languages</h2>
              <button
                type="button"
                onClick={() => addArrayItem('languages', {
                  language: '',
                  speaking: '',
                  writing: ''
                })}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                + Add Language
              </button>
            </div>
            {formData.languages.map((lang, index) => (
              <div key={index} className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language *</label>
                    <input
                      type="text"
                      required
                      value={lang.language}
                      onChange={(e) => updateArrayItem('languages', index, { language: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Speaking *</label>
                    <select
                      required
                      value={lang.speaking}
                      onChange={(e) => updateArrayItem('languages', index, { speaking: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Fluent">Fluent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Writing *</label>
                    <select
                      required
                      value={lang.writing}
                      onChange={(e) => updateArrayItem('languages', index, { writing: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Fluent">Fluent</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('languages', index)}
                  className="mt-2 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Social Activities Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Social Activities</h2>
              <button
                type="button"
                onClick={() => addArrayItem('socialActivities', {
                  startMonth: '',
                  startYear: '',
                  endMonth: '',
                  endYear: '',
                  organizationName: '',
                  place: '',
                  position: '',
                  organizationDescription: ''
                })}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                + Add Social Activity
              </button>
            </div>
            {formData.socialActivities.map((activity, index) => (
              <div key={index} className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Period (Month-Year) *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Month"
                        required
                        value={activity.startMonth}
                        onChange={(e) => updateArrayItem('socialActivities', index, { startMonth: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="Year"
                        required
                        value={activity.startYear}
                        onChange={(e) => updateArrayItem('socialActivities', index, { startYear: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Period (Month-Year)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Month"
                        value={activity.endMonth}
                        onChange={(e) => updateArrayItem('socialActivities', index, { endMonth: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="Year"
                        value={activity.endYear}
                        onChange={(e) => updateArrayItem('socialActivities', index, { endYear: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={activity.organizationName}
                      onChange={(e) => updateArrayItem('socialActivities', index, { organizationName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Place</label>
                    <input
                      type="text"
                      value={activity.place}
                      onChange={(e) => updateArrayItem('socialActivities', index, { place: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      value={activity.position}
                      onChange={(e) => updateArrayItem('socialActivities', index, { position: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Organization Description</label>
                    <textarea
                      rows={3}
                      value={activity.organizationDescription}
                      onChange={(e) => updateArrayItem('socialActivities', index, { organizationDescription: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('socialActivities', index)}
                  className="mt-2 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* References Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">References</h2>
              <button
                type="button"
                onClick={() => addArrayItem('references', {
                  name: '',
                  companyName: '',
                  address: '',
                  phoneNo: '',
                  position: '',
                  relation: ''
                })}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                + Add Reference
              </button>
            </div>
            {formData.references.map((ref, index) => (
              <div key={index} className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={ref.name}
                      onChange={(e) => updateArrayItem('references', index, { name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={ref.companyName}
                      onChange={(e) => updateArrayItem('references', index, { companyName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address *</label>
                    <textarea
                      rows={2}
                      required
                      value={ref.address}
                      onChange={(e) => updateArrayItem('references', index, { address: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone No *</label>
                    <input
                      type="tel"
                      required
                      value={ref.phoneNo}
                      onChange={(e) => updateArrayItem('references', index, { phoneNo: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position *</label>
                    <input
                      type="text"
                      required
                      value={ref.position}
                      onChange={(e) => updateArrayItem('references', index, { position: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relation</label>
                    <input
                      type="text"
                      value={ref.relation}
                      onChange={(e) => updateArrayItem('references', index, { relation: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('references', index)}
                  className="mt-2 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Work Experience Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
              <button
                type="button"
                onClick={() => addArrayItem('workExperience', {
                  startMonth: '',
                  startYear: '',
                  endMonth: '',
                  endYear: '',
                  companyName: '',
                  companyAddress: '',
                  startingPosition: '',
                  lastPosition: '',
                  startingSalary: '',
                  lastSalary: '',
                  resignationReason: '',
                  jobDescription: ''
                })}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                + Add Work Experience
              </button>
            </div>
            {formData.workExperience.map((work, index) => (
              <div key={index} className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Period (Month-Year) *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Month"
                        required
                        value={work.startMonth}
                        onChange={(e) => updateArrayItem('workExperience', index, { startMonth: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="Year"
                        required
                        value={work.startYear}
                        onChange={(e) => updateArrayItem('workExperience', index, { startYear: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Period (Month-Year)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Month"
                        value={work.endMonth}
                        onChange={(e) => updateArrayItem('workExperience', index, { endMonth: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="Year"
                        value={work.endYear}
                        onChange={(e) => updateArrayItem('workExperience', index, { endYear: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={work.companyName}
                      onChange={(e) => updateArrayItem('workExperience', index, { companyName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Company Address *</label>
                    <textarea
                      rows={2}
                      required
                      value={work.companyAddress}
                      onChange={(e) => updateArrayItem('workExperience', index, { companyAddress: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Starting Position *</label>
                    <input
                      type="text"
                      required
                      value={work.startingPosition}
                      onChange={(e) => updateArrayItem('workExperience', index, { startingPosition: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Position *</label>
                    <input
                      type="text"
                      required
                      value={work.lastPosition}
                      onChange={(e) => updateArrayItem('workExperience', index, { lastPosition: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Starting Salary</label>
                    <input
                      type="text"
                      value={work.startingSalary}
                      onChange={(e) => updateArrayItem('workExperience', index, { startingSalary: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Salary</label>
                    <input
                      type="text"
                      value={work.lastSalary}
                      onChange={(e) => updateArrayItem('workExperience', index, { lastSalary: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resignation Reason</label>
                    <input
                      type="text"
                      value={work.resignationReason}
                      onChange={(e) => updateArrayItem('workExperience', index, { resignationReason: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Job Description</label>
                    <textarea
                      rows={4}
                      value={work.jobDescription}
                      onChange={(e) => updateArrayItem('workExperience', index, { jobDescription: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('workExperience', index)}
                  className="mt-2 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Other Information Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Other Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact Name *</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    required
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relation *</label>
                  <input
                    type="text"
                    name="emergencyRelation"
                    required
                    value={formData.emergencyRelation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact Address *</label>
                  <textarea
                    name="emergencyContactAddress"
                    required
                    rows={2}
                    value={formData.emergencyContactAddress}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Phone No *</label>
                  <input
                    type="tel"
                    name="emergencyPhoneNo"
                    required
                    value={formData.emergencyPhoneNo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="canContactReferences"
                    checked={formData.canContactReferences}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Can we contact your reference to get more detail information about yourself?</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="previousEmployment"
                    checked={formData.previousEmployment}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Have you ever been employed by our company/group previously?</span>
                </label>
                {formData.previousEmployment && (
                  <textarea
                    name="previousEmploymentDetails"
                    placeholder="If yes, when and what company?"
                    rows={2}
                    value={formData.previousEmploymentDetails}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="familyInCompany"
                    checked={formData.familyInCompany}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Do you have family/relative employed by our company/group?</span>
                </label>
                {formData.familyInCompany && (
                  <textarea
                    name="familyInCompanyDetails"
                    placeholder="If yes, who and in what company?"
                    rows={2}
                    value={formData.familyInCompanyDetails}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="seriousIllness"
                    checked={formData.seriousIllness}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Have you ever suffered from a serious illness or accident?</span>
                </label>
                {formData.seriousIllness && (
                  <textarea
                    name="seriousIllnessDetails"
                    placeholder="If yes, when and what illness/accident?"
                    rows={2}
                    value={formData.seriousIllnessDetails}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="authorityProblems"
                    checked={formData.authorityProblems}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Have you ever had any problems with the authorities?</span>
                </label>
                {formData.authorityProblems && (
                  <textarea
                    name="authorityProblemsDetails"
                    placeholder="If yes, when and what case?"
                    rows={2}
                    value={formData.authorityProblemsDetails}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">What are your hobbies?</label>
                <input
                  type="text"
                  name="hobbies"
                  value={formData.hobbies}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="physicalProblems"
                    checked={formData.physicalProblems}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Do you have any physical problems, such as vision, hearing, speech, color blindness, etc.?</span>
                </label>
                {formData.physicalProblems && (
                  <textarea
                    name="physicalProblemsDetails"
                    placeholder="If yes, please specify"
                    rows={2}
                    value={formData.physicalProblemsDetails}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Why do you want to join our company?</label>
                <textarea
                  name="motivationToJoin"
                  rows={3}
                  value={formData.motivationToJoin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="willingToRelocate"
                    checked={formData.willingToRelocate}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Are you willing to be transferred to another branch or another company within our corporate group?</span>
                </label>
                {!formData.willingToRelocate && (
                  <textarea
                    name="relocationReason"
                    placeholder="If not, why?"
                    rows={2}
                    value={formData.relocationReason}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="willingToTravel"
                    checked={formData.willingToTravel}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Are you willing to travel out of town for business trips for a certain period?</span>
                </label>
                {!formData.willingToTravel && (
                  <textarea
                    name="travelReason"
                    placeholder="If not, why?"
                    rows={2}
                    value={formData.travelReason}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">What allowances and benefits do you currently receive from your present or previous company?</label>
                <textarea
                  name="currentBenefits"
                  rows={3}
                  value={formData.currentBenefits}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">What salary and benefits do you expect?</label>
                <textarea
                  name="expectedSalary"
                  rows={3}
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">If accepted, when will you be ready to join our company?</label>
                <input
                  type="date"
                  name="availableStartDate"
                  value={formData.availableStartDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="declarationAccepted"
                required
                checked={formData.declarationAccepted}
                onChange={handleInputChange}
                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-3 text-sm text-gray-700">
                I hereby declare that the above information is true. If any of the information is later found to be false or contradictory, I am willing to be subject to legal action in accordance with applicable laws and to resign from the company for committing fraud. *
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white shadow rounded-lg p-6">
            {submitError && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{submitError}</div>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

