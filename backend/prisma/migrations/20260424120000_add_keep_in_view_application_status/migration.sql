-- Add pipeline status for candidates to remain visible without advancing stage
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ApplicationStatus' AND e.enumlabel = 'KEEP_IN_VIEW'
  ) THEN
    ALTER TYPE "ApplicationStatus" ADD VALUE 'KEEP_IN_VIEW';
  END IF;
END $$;
