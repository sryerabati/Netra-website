/*
  # Fix Profile Creation

  ## Changes
  1. Add INSERT policy for profiles table
     - Allow users to create their own profile during signup
  2. Create trigger function to auto-create profiles
     - Automatically creates profile when user signs up via auth.users
  3. Create trigger on auth.users table
     - Fires after INSERT on auth.users

  ## Security
  - Users can only insert their own profile (id = auth.uid())
  - Trigger runs with security definer to bypass RLS for initial creation
*/

-- Drop policy if exists and recreate
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
