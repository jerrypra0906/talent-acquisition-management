'use client'

import { useState, useRef, useEffect } from 'react'
import { XMarkIcon, CloudArrowUpIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { FPTKAPI, MasterDivisionAPI } from '@/lib/api'

interface FileSelection {
  cvFile: File | null
  formDataFile: File | null
}

interface EnhancedAddCandidateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (candidateData: any, files: FileSelection) => void | Promise<void>
}

export default function EnhancedAddCandidateModal({ isOpen, onClose, onSave }: EnhancedAddCandidateModalProps) {
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    position: '',
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
    phone: '',
    email: '',
    
    // Professional Information
    yearsOfExperience: '',
    skills: [] as string[],
    division: [] as string[],
    positionAppliedFor: [] as string[],
    
    // Files
    cvFile: null as File | null,
    formDataFile: null as File | null
  })

  const [newSkill, setNewSkill] = useState('')
  const [activeJobPostings, setActiveJobPostings] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [loadingDivisions, setLoadingDivisions] = useState(false)
  const [loadingPositions, setLoadingPositions] = useState(false)

  const cvInputRef = useRef<HTMLInputElement>(null)
  const formInputRef = useRef<HTMLInputElement>(null)

  console.log('[EnhancedAddCandidateModal] Active job postings state:', activeJobPostings)
  console.log('[EnhancedAddCandidateModal] Divisions state:', divisions)

  // Load active job postings and divisions from API - reload when modal opens
  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Load divisions from Master Division API
    const loadDivisions = async () => {
      setLoadingDivisions(true)
      try {
        const divisionsData = await MasterDivisionAPI.getAll()
        // MasterDivisionAPI.getAll() returns res.data.data which is already an array
        let divisionsArray = []
        if (Array.isArray(divisionsData)) {
          divisionsArray = divisionsData
        } else if (divisionsData && Array.isArray(divisionsData.data)) {
          divisionsArray = divisionsData.data
        } else if (divisionsData && divisionsData.success && Array.isArray(divisionsData.data)) {
          divisionsArray = divisionsData.data
        }
        setDivisions(divisionsArray)
      } catch (error: any) {
        setDivisions([])
      } finally {
        setLoadingDivisions(false)
      }
    }
    
    // Load active job postings from API (exclude currentStatus "On Boarding")
    const loadJobPostings = async () => {
      setLoadingPositions(true)
      try {
        const response = await FPTKAPI.getAll({}, { page: 1, limit: 100 })
        console.log('[EnhancedAddCandidateModal] FPTKAPI.getAll response:', response)
        const fptkData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
        console.log('[EnhancedAddCandidateModal] Parsed FPTK data length:', fptkData.length)

        const active = fptkData
          .filter((fptk: any) => {
            const status = (fptk?.currentStatus || fptk?.status || '').toUpperCase()
            console.log('[EnhancedAddCandidateModal] Checking FPTK status:', status, 'for position', fptk.position || fptk.positionTitle || fptk.title || fptk.id)
            return status !== 'ON BOARDING'
          })
          .map((fptk: any) => {
            const rawTitle = fptk.position || fptk.positionTitle || fptk.title || fptk.department
            const title = rawTitle && rawTitle.trim().length > 0 ? rawTitle : `Position ${String(fptk.id || '').slice(0, 8)}`
            return {
              id: fptk.id,
              title,
              department: fptk.department || '',
              currentStatus: fptk.currentStatus || fptk.status || '',
            }
          })

        console.log('[EnhancedAddCandidateModal] Active job postings count:', active.length)
        setActiveJobPostings(active)
      } catch (error) {
        console.error('[EnhancedAddCandidateModal] Error loading job postings:', error)
        setActiveJobPostings([])
      } finally {
        setLoadingPositions(false)
      }
    }
    
    // Load both in parallel
    loadDivisions()
    loadJobPostings()
  }, [isOpen])

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: '👤' },
    { id: 'files', name: 'Files', icon: '📁' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const handleToggleDivision = (divisionName: string) => {
    setFormData(prev => ({
      ...prev,
      division: prev.division.includes(divisionName)
        ? prev.division.filter(d => d !== divisionName)
        : [...prev.division, divisionName]
    }))
  }

  const handleTogglePosition = (position: string) => {
    setFormData(prev => ({
      ...prev,
      positionAppliedFor: prev.positionAppliedFor.includes(position)
        ? prev.positionAppliedFor.filter(p => p !== position)
        : [...prev.positionAppliedFor, position]
    }))
  }

  const handleFileUpload = (file: File, type: 'cv' | 'form') => {
    if (type === 'cv') {
      setFormData(prev => ({ ...prev, cvFile: file }))
    } else {
      setFormData(prev => ({ ...prev, formDataFile: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Saving enhanced candidate data:', formData)
    await Promise.resolve(
      onSave(formData, {
        cvFile: formData.cvFile,
        formDataFile: formData.formDataFile
      })
    )
    onClose()
  }

  if (!isOpen) {
    console.log('EnhancedAddCandidateModal: not open, returning null')
    return null
  }

  console.log('EnhancedAddCandidateModal: rendering modal')

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '600px',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Add New Candidate</h3>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <XMarkIcon style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div style={{ borderBottom: '1px solid #E5E7EB', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '32px' }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '8px 0',
                      borderBottom: activeTab === tab.id ? '2px solid #4F46E5' : '2px solid transparent',
                      color: activeTab === tab.id ? '#4F46E5' : '#6B7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {activeTab === 'personal' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Division
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '60px', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#fff' }}>
                      {formData.division.length === 0 ? (
                        <span style={{ fontSize: '14px', color: '#9CA3AF', fontStyle: 'italic' }}>No divisions selected</span>
                      ) : (
                        formData.division.map((div) => (
                          <span
                            key={div}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 12px',
                              backgroundColor: '#EEF2FF',
                              color: '#4F46E5',
                              borderRadius: '16px',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            {div}
                            <button
                              type="button"
                              onClick={() => handleToggleDivision(div)}
                              style={{
                                marginLeft: '8px',
                                background: 'none',
                                border: 'none',
                                color: '#4F46E5',
                                cursor: 'pointer',
                                fontSize: '16px',
                                lineHeight: 1
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleToggleDivision(e.target.value)
                            e.target.value = ''
                          }
                        }}
                        disabled={loadingDivisions}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          opacity: loadingDivisions ? 0.6 : 1,
                          cursor: loadingDivisions ? 'wait' : 'pointer'
                        }}
                      >
                        <option value="">
                          {loadingDivisions ? 'Loading divisions...' : 'Add Division'}
                        </option>
                        {!loadingDivisions && divisions && divisions.length > 0 ? (
                          divisions
                            .filter(div => div && div.divisionName && !formData.division.includes(div.divisionName))
                            .map((division) => (
                              <option key={division.id || division.divisionName} value={division.divisionName}>
                                {division.divisionName}
                              </option>
                            ))
                        ) : !loadingDivisions ? (
                          <option value="" disabled>No divisions available. Please add divisions in Master Division page.</option>
                        ) : null}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Position Applied For
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '60px', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#fff' }}>
                      {formData.positionAppliedFor.length === 0 ? (
                        <span style={{ fontSize: '14px', color: '#9CA3AF', fontStyle: 'italic' }}>No positions selected</span>
                      ) : (
                        formData.positionAppliedFor.map((position) => (
                          <span
                            key={position}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 12px',
                              backgroundColor: '#EEF2FF',
                              color: '#4F46E5',
                              borderRadius: '16px',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            {position}
                            <button
                              type="button"
                              onClick={() => handleTogglePosition(position)}
                              style={{
                                marginLeft: '8px',
                                background: 'none',
                                border: 'none',
                                color: '#4F46E5',
                                cursor: 'pointer',
                                fontSize: '16px',
                                lineHeight: 1
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleTogglePosition(e.target.value)
                            e.target.value = ''
                          }
                        }}
                        disabled={loadingPositions}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          opacity: loadingPositions ? 0.6 : 1,
                          cursor: loadingPositions ? 'wait' : 'pointer'
                        }}
                      >
                        <option value="">{loadingPositions ? 'Loading positions...' : 'Add Position'}</option>
                        {!loadingPositions && activeJobPostings && activeJobPostings.length > 0 ? (
                          activeJobPostings
                            .filter(job => job && job.title && !formData.positionAppliedFor.includes(job.title))
                            .map((jobPosting) => (
                              <option key={jobPosting.id || jobPosting.title} value={jobPosting.title}>
                                {jobPosting.title}
                              </option>
                            ))
                        ) : !loadingPositions ? (
                          <option value="" disabled>No open positions available</option>
                        ) : null}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Place of Birth
                    </label>
                    <input
                      type="text"
                      value={formData.placeOfBirth}
                      onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Ethnicity
                    </label>
                    <input
                      type="text"
                      value={formData.ethnicity}
                      onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Marital Status (PTKP)
                    </label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      ID Number (KTP)
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Tax Number (NPWP)
                    </label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      BPJS Number
                    </label>
                    <input
                      type="text"
                      value={formData.bpjsNumber}
                      onChange={(e) => handleInputChange('bpjsNumber', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Health Status
                    </label>
                    <select
                      value={formData.healthStatus}
                      onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="">Select Status</option>
                      <option value="Sehat">Sehat</option>
                      <option value="Tidak Sehat">Tidak Sehat</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Driving License
                    </label>
                    <input
                      type="text"
                      value={formData.drivingLicense}
                      onChange={(e) => handleInputChange('drivingLicense', e.target.value)}
                      placeholder="e.g., A & C"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Blood Type
                    </label>
                    <select
                      value={formData.bloodType}
                      onChange={(e) => handleInputChange('bloodType', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Current Address
                    </label>
                    <textarea
                      value={formData.currentAddress}
                      onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Permanent Address
                    </label>
                    <textarea
                      value={formData.permanentAddress}
                      onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Years of Experience */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      min="0"
                      placeholder="e.g., 3"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Skills
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                </div>
              )}

              {activeTab === 'files' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Upload CV
                    </label>
                    <div 
                      style={{
                        border: '2px dashed #D1D5DB',
                        borderRadius: '8px',
                        padding: '24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: formData.cvFile ? '#F0FDF4' : '#FAFAFA'
                      }}
                      onClick={() => cvInputRef.current?.click()}
                    >
                      <CloudArrowUpIcon style={{ width: '48px', height: '48px', color: '#9CA3AF', margin: '0 auto 12px' }} />
                      <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                        <span style={{ color: '#4F46E5', fontWeight: '500' }}>Click to upload</span> or drag and drop
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        PDF, DOC, DOCX up to 10MB
                      </div>
                      {formData.cvFile && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#059669', fontWeight: '500' }}>
                          ✓ {formData.cvFile.name}
                        </div>
                      )}
                    </div>
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'cv')
                      }}
                    />
                  </div>

                  
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Save Candidate
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #D1D5DB',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  )
}
