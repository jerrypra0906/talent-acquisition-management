'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { FPTK } from '@/types'

interface ViewJobPostingModalProps {
  isOpen: boolean
  onClose: () => void
  jobPosting: FPTK | null
  onStatusUpdate?: (jobPostingId: string, newStatus: string) => void
}

export default function ViewJobPostingModal({ isOpen, onClose, jobPosting, onStatusUpdate }: ViewJobPostingModalProps) {
  const [appliedCandidates, setAppliedCandidates] = useState<any[]>([])

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

  // Load applied candidates when job posting changes
  useEffect(() => {
    if (jobPosting && Array.isArray((jobPosting as any).appliedCandidates)) {
      const normalized = (jobPosting as any).appliedCandidates.map((candidate: any) => ({
        ...candidate,
        status: candidate.status || mapAppliedStatusLabel(candidate.backendStatus),
        backendStatus: candidate.backendStatus || candidate.status,
        skills: candidate.skills || [],
      }))
      setAppliedCandidates(normalized)
    } else {
      setAppliedCandidates([])
    }
  }, [jobPosting])

  if (!isOpen || !jobPosting) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const priorityLabel = (() => {
    const p = (jobPosting as any).urgentNormal as string | undefined
    if (p === 'P0' || p === 'P1' || p === 'P2') return p
    // derive from priority field
    const level = (jobPosting as any).priority || jobPosting.priority
    if (level === 'urgent') return 'P0'
    if (level === 'high') return 'P1'
    if (level === 'medium') return 'P2'
    return '-'
  })()

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
        maxWidth: '900px',
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
            Open Position Details
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Basic Information */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                Basic Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(jobPosting as any).pt && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>PT</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).pt}</p>
                  </div>
                )}
                {(jobPosting as any).noFktk && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>No FKTK</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).noFktk}</p>
                  </div>
                )}
                {(jobPosting as any).statusFktk && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Status FKTK</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).statusFktk}</p>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Division</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{jobPosting.department}</p>
                </div>
                {(jobPosting as any).section && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Section</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).section}</p>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Position</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{jobPosting.title}</p>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Employment Type</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{jobPosting.type}</p>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Location</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{jobPosting.location}</p>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Area Detail</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).areaDetail || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Status & Priority */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                Status & Priority
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Current Status</label>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    margin: '4px 0 0 0'
                  }}>
                    {(jobPosting as any).currentStatus || (jobPosting as any).status || 'Raise FPTK'}
                  </span>
                </div>
                {(jobPosting as any).typeGrade && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Type Grade</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).typeGrade}</p>
                  </div>
                )}
                {(jobPosting as any).grade2 && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Grade2</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).grade2}</p>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Priority</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                    {priorityLabel} {jobPosting.priority ? `(${jobPosting.priority})` : ''}
                  </p>
                </div>
                {(jobPosting as any).criteria && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Criteria</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).criteria}</p>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Hiring Manager</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{jobPosting.hiringManager}</p>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Years of Experience Required</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                    {(jobPosting as any).yearsOfExperience ? `${(jobPosting as any).yearsOfExperience} years` : 'Not specified'}
                  </p>
                </div>
                {(jobPosting as any).totalRequest && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total Request</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).totalRequest}</p>
                  </div>
                )}
                {(jobPosting as any).requestDate && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Request Date</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{formatDate((jobPosting as any).requestDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
              Additional Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(jobPosting as any).additionalOrReplacement && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Additional or Replacement</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).additionalOrReplacement}</p>
                  </div>
                )}
                {(jobPosting as any).replacementName && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Replacement Name</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).replacementName}</p>
                  </div>
                )}
                {(jobPosting as any).resignReason && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Resign Reason</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).resignReason}</p>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Remark</label>
                  <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>{(jobPosting as any).remark || 'Not specified'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(jobPosting as any).priorityByMonthYear && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Priority by Month-Year</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{(jobPosting as any).priorityByMonthYear}</p>
                  </div>
                )}
                {jobPosting.deadline && (
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Deadline</label>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{formatDate(jobPosting.deadline)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          {jobPosting.description && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Job Description
              </h3>
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '14px', color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {jobPosting.description}
                </p>
              </div>
            </div>
          )}

          {/* Requirements */}
          {jobPosting.requirements && jobPosting.requirements.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Requirements
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {jobPosting.requirements.map((req, index) => (
                  <li key={index} style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {(jobPosting as any).skills && (jobPosting as any).skills.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Required Skills (for AI candidate matching)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(jobPosting as any).skills.map((skill: string, index: number) => (
                  <span key={index} style={{
                    padding: '4px 8px',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {(jobPosting as any).milestones && (jobPosting as any).milestones.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Status Milestones Timeline
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', padding: '20px 0' }}>
                {(() => {
                  const fixedMilestones = [
                    'Raise FPTK',
                    'CV Hunting (Sourcing Candidate)',
                    'Piskotest & Technical Test',
                    'Interview User',
                    'Offering Process',
                    'Medical Check Up (MCU)',
                    'Signing',
                    'On Boarding'
                  ]
                  
                  const milestoneData = (jobPosting as any).milestones || []
                  const currentStatus = (jobPosting as any).currentStatus || (jobPosting as any).status || 'Raise FPTK'
                  const currentIndex = fixedMilestones.indexOf(currentStatus)
                  
                  return fixedMilestones.map((milestone, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex
                    
                    // Find the milestone data for this specific milestone
                    const milestoneInfo = milestoneData.find((m: any) => m.status === milestone)
                    
                    return (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', minWidth: '160px' }}>
                        {/* Milestone Circle */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? '#10b981' : isCurrent ? '#0ea5e9' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isCompleted || isCurrent ? 'white' : '#6b7280',
                          fontSize: '14px',
                          fontWeight: '600',
                          position: 'relative',
                          zIndex: 2,
                          border: '3px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {index + 1}
                        </div>
                        
                        {/* Milestone Label */}
                        <div style={{
                          marginLeft: '12px',
                          minWidth: '120px'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: isCompleted ? '#10b981' : isCurrent ? '#0ea5e9' : '#6b7280',
                            marginBottom: '2px'
                          }}>
                            {index === fixedMilestones.length - 1 ? 'On Boarding' : milestone.split(' ')[0]}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#6b7280',
                            marginBottom: '2px'
                          }}>
                            {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending'}
                          </div>
                          {/* Show dates if available */}
                          {milestoneInfo && (
                            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px', lineHeight: '1.4' }}>
                              {milestoneInfo.startDate && (
                                <div>Start: {new Date(milestoneInfo.startDate).toLocaleDateString()}</div>
                              )}
                              {milestoneInfo.endDate && (
                                <div>End: {new Date(milestoneInfo.endDate).toLocaleDateString()}</div>
                              )}
                              {!milestoneInfo.startDate && !milestoneInfo.endDate && milestoneInfo.updatedAt && (
                                <div>Updated: {new Date(milestoneInfo.updatedAt).toLocaleDateString()}</div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Connector Line (except for last milestone) */}
                        {index < fixedMilestones.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: '60px',
                            top: '50%',
                            width: '80px',
                            height: '2px',
                            backgroundColor: isCompleted ? '#10b981' : '#e5e7eb',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                          }} />
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
              
              {/* Milestone Details */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Current Status: {(jobPosting as any).currentStatus || (jobPosting as any).status || 'Raise FPTK'}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {(() => {
                    const milestoneData = (jobPosting as any).milestones || []
                    const currentStatus = (jobPosting as any).currentStatus || (jobPosting as any).status || 'Raise FPTK'
                    const currentMilestone = milestoneData.find((m: any) => m.status === currentStatus)
                    
                    if (currentMilestone) {
                      return `Started: ${formatDate(currentMilestone.updatedAt)}`
                    }
                    return 'Status: Not Started'
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Applied Candidates */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              Applied Candidates ({appliedCandidates.length})
            </h3>
            {appliedCandidates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appliedCandidates.map((candidate: any) => {
                  const statusLabel = candidate.status || candidate.backendStatus || 'Applied'
                  const appliedDate = candidate.appliedDate || candidate.appliedAt || candidate.createdAt
                  const skills = candidate.skills || []
                  return (
                    <div key={candidate.id || candidate.candidateId} style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                            {candidate.fullName || candidate.name || `Candidate ${candidate.id?.substring(0, 6)}`}
                          </h4>
                          {(candidate.email || candidate.contactInfo?.email) && (
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                              {candidate.email || candidate.contactInfo?.email}
                            </p>
                          )}
                          {appliedDate && (
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                              Applied: {formatDate(appliedDate)}
                            </p>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {skills.slice(0, 3).map((skill: string, index: number) => (
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
                            {skills.length > 3 && (
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                +{skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#dcfce7',
                            color: '#166534'
                          }}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>

                      {statusLabel === 'Interview Scheduled' && candidate.interviews && candidate.interviews.length > 0 && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Interview Details
                          </div>
                          {candidate.interviews.map((interview: any, index: number) => (
                            <div key={index} style={{
                              marginBottom: index < candidate.interviews.length - 1 ? '8px' : '0',
                              padding: '8px',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div style={{ fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                Interview {index + 1}
                              </div>
                              {interview.interviewer && (
                                <div style={{ marginBottom: '4px' }}>
                                  <span style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280' }}>Interviewer: </span>
                                  <span style={{ fontSize: '10px', color: '#111827' }}>
                                    {interview.interviewer}
                                  </span>
                                </div>
                              )}
                              {interview.date && (
                                <div style={{ marginBottom: '4px' }}>
                                  <span style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280' }}>Date: </span>
                                  <span style={{ fontSize: '10px', color: '#111827' }}>
                                    {formatDate(interview.date)}
                                  </span>
                                </div>
                              )}
                              {interview.time && (
                                <div style={{ marginBottom: '4px' }}>
                                  <span style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280' }}>Time: </span>
                                  <span style={{ fontSize: '10px', color: '#111827' }}>
                                    {interview.time}
                                  </span>
                                </div>
                              )}
                              {interview.results && (
                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                                  <div style={{ fontSize: '10px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Interview Results:</div>
                                  <div style={{ fontSize: '10px', color: '#111827', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {interview.results}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  No candidates have applied to this position yet.
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Created At</label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{formatDate(jobPosting.createdAt)}</p>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Last Updated</label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>{formatDate(jobPosting.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
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
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
