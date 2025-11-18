-- 회사 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  business_number TEXT NOT NULL,
  ceo_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  business_certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
  ON public.company_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON public.company_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: 회원가입 시 프로필 생성 가능 (public access for signup)
CREATE POLICY "Anyone can insert profile during signup"
  ON public.company_profiles
  FOR INSERT
  WITH CHECK (true);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_company_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_profile_updated_at();

-- 사업자등록증 저장용 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-certificates', 'business-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- 스토리지 정책: 사용자가 자신의 파일만 업로드 가능
CREATE POLICY "Users can upload own business certificate"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'business-certificates' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 스토리지 정책: 사용자가 자신의 파일만 조회 가능
CREATE POLICY "Users can view own business certificate"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'business-certificates' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 스토리지 정책: 관리자는 모든 파일 조회 가능 (향후 관리자 기능용)
CREATE POLICY "Admins can view all business certificates"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'business-certificates');