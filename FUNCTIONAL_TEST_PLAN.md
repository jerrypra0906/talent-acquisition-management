# Functional Test Execution Plan

**Date:** 2025-11-11  
**Environment:** Production  
**Status:** Ready for Execution

## Overview

This document outlines the functional testing plan for the Talent Acquisition Management System. All tests should be executed after deployment to verify that all functionality works as expected in the production environment.

## Prerequisites

1. Production environment deployed and running
2. Admin user created and credentials available
3. Test data prepared (optional)
4. Test accounts created (optional)
5. Browser and API testing tools ready

## Test Execution Instructions

### 1. Pre-Test Setup

#### 1.1 Verify Environment
```bash
# Check all services are running
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Check health endpoints
curl https://api.yourdomain.com/health

# Check frontend
curl https://admin.yourdomain.com

# Check candidate portal
curl https://careers.yourdomain.com
```

#### 1.2 Create Test Users
```bash
# Create admin user (if not already created)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  ADMIN_PASSWORD=test-admin-password node scripts/createAdmin.js

# Create test users
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  EMAIL=test@example.com PASSWORD=test-password ROLE=TA_TEAM \
  node scripts/createUser.js
```

#### 1.3 Prepare Test Data
- Export test data from development environment (if available)
- Prepare test Excel files for FPTK upload
- Prepare test candidate data
- Prepare test documents (CV, forms)

## Test Cases

### 1. Dashboard Page

#### Positive Test Cases
- [ ] **TC-DASH-001:** View dashboard loads successfully
  - Navigate to dashboard
  - Verify page loads without errors
  - Verify all components render
  
- [ ] **TC-DASH-002:** All statistics display correctly
  - Verify total candidates count
  - Verify total FPTK count
  - Verify total applications count
  - Verify statistics are accurate
  
- [ ] **TC-DASH-003:** Charts render properly
  - Verify candidate status chart
  - Verify FPTK status chart
  - Verify application status chart
  - Verify charts are interactive
  
- [ ] **TC-DASH-004:** Recent activity shows correctly
  - Verify recent activities are displayed
  - Verify activities are sorted by date
  - Verify activity details are correct
  
- [ ] **TC-DASH-005:** Refresh button works
  - Click refresh button
  - Verify data is refreshed
  - Verify no errors occur

#### Negative Test Cases
- [ ] **TC-DASH-006:** Dashboard loads with no data (empty state)
  - Clear all data (if possible)
  - Verify empty state is displayed
  - Verify appropriate message is shown
  
- [ ] **TC-DASH-007:** API failure handled gracefully
  - Simulate API failure
  - Verify error message is displayed
  - Verify application doesn't crash
  
- [ ] **TC-DASH-008:** Network timeout handled
  - Simulate network timeout
  - Verify timeout message is displayed
  - Verify retry option is available

### 2. Candidates Page

#### View Tests
- [ ] **TC-CAND-001:** Candidates list loads successfully
  - Navigate to candidates page
  - Verify candidates list loads
  - Verify pagination works
  
- [ ] **TC-CAND-002:** Search functionality works
  - Enter search term
  - Verify results are filtered
  - Verify search is case-insensitive
  
- [ ] **TC-CAND-003:** Status filter works
  - Select status filter
  - Verify candidates are filtered
  - Verify filter persists
  
- [ ] **TC-CAND-004:** View candidate details
  - Click on candidate
  - Verify details modal opens
  - Verify all information is displayed

#### Insert Tests
- [ ] **TC-CAND-005:** Create new candidate with valid data
  - Click "Add Candidate" button
  - Fill in all required fields
  - Submit form
  - Verify candidate is created
  
- [ ] **TC-CAND-006:** All required fields validated
  - Try to submit form without required fields
  - Verify validation errors are shown
  - Verify form cannot be submitted
  
- [ ] **TC-CAND-007:** Optional fields accepted
  - Fill in optional fields
  - Submit form
  - Verify optional fields are saved
  
- [ ] **TC-CAND-008:** File upload works (CV, form data)
  - Upload CV file
  - Upload form data file
  - Verify files are uploaded
  - Verify files are accessible
  
- [ ] **TC-CAND-009:** Success message displayed
  - Create candidate
  - Verify success message is shown
  - Verify candidate appears in list

#### Edit Tests
- [ ] **TC-CAND-010:** Edit existing candidate
  - Click edit button on candidate
  - Verify edit form opens
  - Verify current data is pre-filled
  
- [ ] **TC-CAND-011:** Update all fields
  - Update all fields
  - Submit form
  - Verify changes are saved
  
- [ ] **TC-CAND-012:** Changes saved successfully
  - Make changes to candidate
  - Save changes
  - Verify changes are reflected in view
  
- [ ] **TC-CAND-013:** View updated data
  - View candidate after update
  - Verify updated data is displayed
  - Verify old data is replaced

#### Negative Tests
- [ ] **TC-CAND-014:** Create candidate with missing required fields
  - Try to create candidate without required fields
  - Verify validation errors
  - Verify candidate is not created
  
- [ ] **TC-CAND-015:** Create candidate with invalid email
  - Enter invalid email format
  - Verify validation error
  - Verify form cannot be submitted
  
- [ ] **TC-CAND-016:** Create candidate with invalid phone
  - Enter invalid phone format
  - Verify validation error
  - Verify form cannot be submitted
  
- [ ] **TC-CAND-017:** Edit non-existent candidate
  - Try to edit candidate that doesn't exist
  - Verify error message
  - Verify application doesn't crash
  
- [ ] **TC-CAND-018:** API failure during create/edit
  - Simulate API failure
  - Verify error message
  - Verify data is not corrupted

### 3. Open Position (FPTK) Page

#### View Tests
- [ ] **TC-FPTK-001:** FPTK list loads successfully
  - Navigate to FPTK page
  - Verify FPTK list loads
  - Verify pagination works
  
- [ ] **TC-FPTK-002:** Search functionality works
  - Enter search term
  - Verify results are filtered
  - Verify search works correctly
  
- [ ] **TC-FPTK-003:** Status filter works
  - Select status filter
  - Verify FPTKs are filtered
  - Verify filter works correctly
  
- [ ] **TC-FPTK-004:** View FPTK details
  - Click on FPTK
  - Verify details modal opens
  - Verify all information is displayed
  
- [ ] **TC-FPTK-005:** Download template works
  - Click download template button
  - Verify template downloads
  - Verify template format is correct
  
- [ ] **TC-FPTK-006:** Upload results modal displays correctly
  - Click upload button
  - Verify upload modal opens
  - Verify upload form is displayed

#### Insert Tests
- [ ] **TC-FPTK-007:** Create new FPTK with valid data
  - Click "Add FPTK" button
  - Fill in all required fields
  - Submit form
  - Verify FPTK is created
  
- [ ] **TC-FPTK-008:** All required fields validated
  - Try to submit form without required fields
  - Verify validation errors
  - Verify form cannot be submitted
  
- [ ] **TC-FPTK-009:** Priority dropdown (P0, P1, P2) works
  - Select priority from dropdown
  - Verify priority is saved
  - Verify priority is displayed
  
- [ ] **TC-FPTK-010:** Priority by Month-Year picker works
  - Select month and year
  - Verify date is saved
  - Verify date is displayed correctly
  
- [ ] **TC-FPTK-011:** Excel upload works
  - Upload Excel file
  - Verify file is processed
  - Verify FPTKs are created
  
- [ ] **TC-FPTK-012:** Multiple FPTKs created from Excel
  - Upload Excel with multiple rows
  - Verify all FPTKs are created
  - Verify data is correct
  
- [ ] **TC-FPTK-013:** Success message displayed
  - Create FPTK
  - Verify success message
  - Verify FPTK appears in list

#### Edit Tests
- [ ] **TC-FPTK-014:** Edit existing FPTK
  - Click edit button
  - Verify edit form opens
  - Verify current data is pre-filled
  
- [ ] **TC-FPTK-015:** Update all fields
  - Update all fields
  - Submit form
  - Verify changes are saved
  
- [ ] **TC-FPTK-016:** Priority changes saved
  - Change priority
  - Save changes
  - Verify priority is updated
  
- [ ] **TC-FPTK-017:** Priority by Month-Year changes saved
  - Change month-year
  - Save changes
  - Verify date is updated
  
- [ ] **TC-FPTK-018:** Changes reflected in view
  - Make changes
  - View FPTK
  - Verify changes are displayed
  
- [ ] **TC-FPTK-019:** Status update works
  - Change status
  - Save changes
  - Verify status is updated

#### Upload Tests
- [ ] **TC-FPTK-020:** Upload valid Excel file
  - Upload valid Excel file
  - Verify file is processed
  - Verify FPTKs are created
  
- [ ] **TC-FPTK-021:** Success rows displayed
  - Upload Excel file
  - Verify success rows are shown
  - Verify success count is correct
  
- [ ] **TC-FPTK-022:** Failed rows displayed with errors
  - Upload Excel with errors
  - Verify failed rows are shown
  - Verify error messages are displayed
  
- [ ] **TC-FPTK-023:** Download failed rows CSV
  - Upload Excel with errors
  - Click download failed rows
  - Verify CSV downloads
  - Verify CSV contains errors
  
- [ ] **TC-FPTK-024:** Redirect to list after upload
  - Upload Excel file
  - Verify redirect to list
  - Verify list is updated

#### Negative Tests
- [ ] **TC-FPTK-025:** Create FPTK with missing required fields
  - Try to create FPTK without required fields
  - Verify validation errors
  - Verify FPTK is not created
  
- [ ] **TC-FPTK-026:** Create FPTK with invalid data
  - Enter invalid data
  - Verify validation errors
  - Verify form cannot be submitted
  
- [ ] **TC-FPTK-027:** Upload invalid Excel file
  - Upload invalid Excel file
  - Verify error message
  - Verify file is not processed
  
- [ ] **TC-FPTK-028:** Upload Excel with duplicate FPTK numbers
  - Upload Excel with duplicates
  - Verify error message
  - Verify duplicates are handled
  
- [ ] **TC-FPTK-029:** Upload Excel with invalid status values
  - Upload Excel with invalid status
  - Verify error message
  - Verify invalid rows are rejected
  
- [ ] **TC-FPTK-030:** Edit non-existent FPTK
  - Try to edit non-existent FPTK
  - Verify error message
  - Verify application doesn't crash
  
- [ ] **TC-FPTK-031:** API failure during operations
  - Simulate API failure
  - Verify error message
  - Verify data is not corrupted

### 4. Summary by Position Page

#### View Tests
- [ ] **TC-SUM-001:** Summary table loads successfully
  - Navigate to summary page
  - Verify table loads
  - Verify all columns are displayed
  
- [ ] **TC-SUM-002:** All columns display correctly
  - Verify all columns are visible
  - Verify column headers are correct
  - Verify data is displayed
  
- [ ] **TC-SUM-003:** Status counts calculated correctly
  - Verify status counts are accurate
  - Verify counts match actual data
  - Verify counts update correctly
  
- [ ] **TC-SUM-004:** SLA buckets calculated correctly
  - Verify SLA buckets are calculated
  - Verify bucket counts are accurate
  - Verify buckets update correctly
  
- [ ] **TC-SUM-005:** Priority filter works
  - Select priority filter
  - Verify results are filtered
  - Verify filter works correctly
  
- [ ] **TC-SUM-006:** Division filter works
  - Select division filter
  - Verify results are filtered
  - Verify filter works correctly
  
- [ ] **TC-SUM-007:** Sort by column headers works
  - Click column header
  - Verify sorting works
  - Verify sort indicator is shown
  
- [ ] **TC-SUM-008:** Sort ascending/descending works
  - Click column header multiple times
  - Verify sort order changes
  - Verify data is sorted correctly

#### Negative Tests
- [ ] **TC-SUM-009:** Summary loads with no data
  - Clear all data (if possible)
  - Verify empty state is displayed
  - Verify appropriate message is shown
  
- [ ] **TC-SUM-010:** Filter with no results
  - Apply filter with no results
  - Verify no results message
  - Verify filter can be cleared
  
- [ ] **TC-SUM-011:** API failure handled
  - Simulate API failure
  - Verify error message
  - Verify application doesn't crash

### 5. Master Division Page

#### View Tests
- [ ] **TC-DIV-001:** Divisions list loads successfully
  - Navigate to divisions page
  - Verify list loads
  - Verify all divisions are displayed
  
- [ ] **TC-DIV-002:** Search functionality works
  - Enter search term
  - Verify results are filtered
  - Verify search works correctly
  
- [ ] **TC-DIV-003:** View division details
  - Click on division
  - Verify details are displayed
  - Verify all information is shown

#### Insert Tests
- [ ] **TC-DIV-004:** Create new division with valid data
  - Click "Add Division" button
  - Fill in all required fields
  - Submit form
  - Verify division is created
  
- [ ] **TC-DIV-005:** Unique constraint enforced (division + section)
  - Try to create duplicate division
  - Verify error message
  - Verify division is not created
  
- [ ] **TC-DIV-006:** Success message displayed
  - Create division
  - Verify success message
  - Verify division appears in list

#### Edit Tests
- [ ] **TC-DIV-007:** Edit existing division
  - Click edit button
  - Verify edit form opens
  - Verify current data is pre-filled
  
- [ ] **TC-DIV-008:** Update all fields
  - Update all fields
  - Submit form
  - Verify changes are saved
  
- [ ] **TC-DIV-009:** Changes saved successfully
  - Make changes
  - Save changes
  - Verify changes are reflected

#### Negative Tests
- [ ] **TC-DIV-010:** Create division with missing required fields
  - Try to create division without required fields
  - Verify validation errors
  - Verify division is not created
  
- [ ] **TC-DIV-011:** Create duplicate division+section
  - Try to create duplicate
  - Verify error message
  - Verify division is not created
  
- [ ] **TC-DIV-012:** Edit non-existent division
  - Try to edit non-existent division
  - Verify error message
  - Verify application doesn't crash
  
- [ ] **TC-DIV-013:** API failure handled
  - Simulate API failure
  - Verify error message
  - Verify data is not corrupted

### 6. Master Office Location Page

#### View Tests
- [ ] **TC-LOC-001:** Office locations list loads successfully
  - Navigate to locations page
  - Verify list loads
  - Verify all locations are displayed
  
- [ ] **TC-LOC-002:** Search functionality works
  - Enter search term
  - Verify results are filtered
  - Verify search works correctly
  
- [ ] **TC-LOC-003:** PT field displays correctly
  - Verify PT field is displayed
  - Verify PT values are correct
  - Verify PT filter works
  
- [ ] **TC-LOC-004:** View location details
  - Click on location
  - Verify details are displayed
  - Verify all information is shown

#### Insert Tests
- [ ] **TC-LOC-005:** Create new location with valid data
  - Click "Add Location" button
  - Fill in all required fields
  - Submit form
  - Verify location is created
  
- [ ] **TC-LOC-006:** PT field works correctly
  - Select PT value
  - Verify PT is saved
  - Verify PT is displayed
  
- [ ] **TC-LOC-007:** Unique constraint enforced (PT + area + areaDetail)
  - Try to create duplicate location
  - Verify error message
  - Verify location is not created
  
- [ ] **TC-LOC-008:** Success message displayed
  - Create location
  - Verify success message
  - Verify location appears in list

#### Edit Tests
- [ ] **TC-LOC-009:** Edit existing location
  - Click edit button
  - Verify edit form opens
  - Verify current data is pre-filled
  
- [ ] **TC-LOC-010:** Update PT field
  - Update PT field
  - Save changes
  - Verify PT is updated
  
- [ ] **TC-LOC-011:** Update all fields
  - Update all fields
  - Submit form
  - Verify changes are saved
  
- [ ] **TC-LOC-012:** Changes saved successfully
  - Make changes
  - Save changes
  - Verify changes are reflected

#### Negative Tests
- [ ] **TC-LOC-013:** Create location with missing required fields
  - Try to create location without required fields
  - Verify validation errors
  - Verify location is not created
  
- [ ] **TC-LOC-014:** Create duplicate PT+area+areaDetail
  - Try to create duplicate
  - Verify error message
  - Verify location is not created
  
- [ ] **TC-LOC-015:** Edit non-existent location
  - Try to edit non-existent location
  - Verify error message
  - Verify application doesn't crash
  
- [ ] **TC-LOC-016:** API failure handled
  - Simulate API failure
  - Verify error message
  - Verify data is not corrupted

### 7. Team Page

#### View Tests
- [ ] **TC-TEAM-001:** Team members list loads successfully
  - Navigate to team page
  - Verify list loads
  - Verify all team members are displayed
  
- [ ] **TC-TEAM-002:** Search functionality works
  - Enter search term
  - Verify results are filtered
  - Verify search works correctly
  
- [ ] **TC-TEAM-003:** View team member details
  - Click on team member
  - Verify details are displayed
  - Verify all information is shown

#### Insert Tests
- [ ] **TC-TEAM-004:** Create new team member with valid data
  - Click "Add Member" button
  - Fill in all required fields
  - Submit form
  - Verify team member is created
  
- [ ] **TC-TEAM-005:** Role assignment works
  - Select role
  - Verify role is saved
  - Verify role is displayed
  
- [ ] **TC-TEAM-006:** Password creation works
  - Enter password (or use default)
  - Verify password is set
  - Verify user can login
  
- [ ] **TC-TEAM-007:** Success message displayed
  - Create team member
  - Verify success message
  - Verify member appears in list

#### Edit Tests
- [ ] **TC-TEAM-008:** Edit existing team member
  - Click edit button
  - Verify edit form opens
  - Verify current data is pre-filled
  
- [ ] **TC-TEAM-009:** Update all fields
  - Update all fields
  - Submit form
  - Verify changes are saved
  
- [ ] **TC-TEAM-010:** Role changes saved
  - Change role
  - Save changes
  - Verify role is updated
  
- [ ] **TC-TEAM-011:** Status toggle works
  - Toggle status
  - Save changes
  - Verify status is updated
  
- [ ] **TC-TEAM-012:** Password reset works
  - Reset password
  - Verify password is reset
  - Verify user can login with new password

#### Negative Tests
- [ ] **TC-TEAM-013:** Create team member with missing required fields
  - Try to create member without required fields
  - Verify validation errors
  - Verify member is not created
  
- [ ] **TC-TEAM-014:** Create team member with invalid email
  - Enter invalid email
  - Verify validation error
  - Verify form cannot be submitted
  
- [ ] **TC-TEAM-015:** Create duplicate email
  - Try to create member with existing email
  - Verify error message
  - Verify member is not created
  
- [ ] **TC-TEAM-016:** Edit non-existent team member
  - Try to edit non-existent member
  - Verify error message
  - Verify application doesn't crash
  
- [ ] **TC-TEAM-017:** API failure handled
  - Simulate API failure
  - Verify error message
  - Verify data is not corrupted

## Test Execution Summary

### Test Statistics
- **Total Test Cases:** 100+
- **Passed:** TBD
- **Failed:** TBD
- **Skipped:** TBD
- **Pass Rate:** TBD%

### Test Execution Log
- **Start Date:** TBD
- **End Date:** TBD
- **Duration:** TBD
- **Tester:** TBD
- **Environment:** Production

### Issues Found
1. *(List any issues found during testing)*

### Recommendations
1. *(List any recommendations for improvement)*

## Conclusion

This test plan provides comprehensive coverage of all functionality in the Talent Acquisition Management System. All tests should be executed after deployment to ensure the system works correctly in the production environment.

---

**Last Updated:** 2025-11-11  
**Version:** 1.0.0

