-- Add KEEP_IN_VIEW to ApplicationStatus (Prisma has it; older DBs created from create_missing_enums.sql do not)
DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ApplicationStatus'
      AND e.enumlabel = 'KEEP_IN_VIEW'
  ) THEN
    ALTER TYPE "ApplicationStatus" ADD VALUE 'KEEP_IN_VIEW';
  END IF;
END
$migration$;
