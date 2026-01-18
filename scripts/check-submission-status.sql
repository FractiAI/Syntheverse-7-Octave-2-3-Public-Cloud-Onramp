-- Check status of failed submission
-- Hash: 3266b3bf7d68b18723ab88f52a70ae602dd94f1670497be4696bcb1d3dc30290

SELECT 
  submission_hash,
  title,
  contributor,
  status,
  created_at,
  updated_at,
  metadata->>'evaluation_error' as error_message
FROM contributions
WHERE submission_hash = '3266b3bf7d68b18723ab88f52a70ae602dd94f1670497be4696bcb1d3dc30290';

-- To manually retry evaluation, update status back to 'evaluating':
-- UPDATE contributions 
-- SET status = 'pending', updated_at = NOW()
-- WHERE submission_hash = '3266b3bf7d68b18723ab88f52a70ae602dd94f1670497be4696bcb1d3dc30290';
-- 
-- Then trigger evaluation:
-- POST /api/evaluate/3266b3bf7d68b18723ab88f52a70ae602dd94f1670497be4696bcb1d3dc30290
