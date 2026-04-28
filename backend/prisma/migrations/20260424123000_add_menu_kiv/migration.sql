-- KIV (Keep In View) under Candidate: same access pattern as /candidates by default
INSERT INTO menu_access (id, "menuPath", "menuLabel", "visibleRoles", "createRoles", "editRoles", "createdAt", "updatedAt")
SELECT gen_random_uuid(),
  '/candidates/kiv',
  'KIV',
  ARRAY['SUPER_ADMIN', 'Management', 'Head of Division', 'HRBP', 'TA_TEAM', 'HIRING_MANAGER', 'INTERVIEWER']::TEXT[],
  ARRAY['SUPER_ADMIN', 'HRBP', 'TA_TEAM']::TEXT[],
  ARRAY['SUPER_ADMIN', 'HRBP', 'TA_TEAM']::TEXT[],
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM menu_access WHERE "menuPath" = '/candidates/kiv');
