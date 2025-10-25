/*
  # Backfill Profiles for Existing Users

  ## Purpose
  Create profiles for any existing auth.users who don't have a profile yet
  
  ## Changes
  - Insert profiles for users without them
  - Use default values (role: patient, full_name: from email)
*/

-- Insert profiles for any users that don't have them
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    SPLIT_PART(u.email, '@', 1)
  ) as full_name,
  COALESCE(
    (u.raw_user_meta_data->>'role')::user_role,
    'patient'::user_role
  ) as role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
