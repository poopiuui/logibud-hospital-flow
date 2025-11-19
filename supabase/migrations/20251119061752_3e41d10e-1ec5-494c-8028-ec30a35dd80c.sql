-- Fix company_profiles RLS policy to require authentication
-- Drop the insecure public insert policy
DROP POLICY IF EXISTS "Anyone can insert profile during signup" ON public.company_profiles;

-- Create new secure policy requiring authentication
CREATE POLICY "Authenticated users can insert own profile"
ON public.company_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ensure users can still view and update their own profiles
-- (These policies should already exist but let's ensure they're correct)
DROP POLICY IF EXISTS "Users can view own profile" ON public.company_profiles;
CREATE POLICY "Users can view own profile"
ON public.company_profiles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.company_profiles;
CREATE POLICY "Users can update own profile"
ON public.company_profiles
FOR UPDATE
USING (auth.uid() = user_id);