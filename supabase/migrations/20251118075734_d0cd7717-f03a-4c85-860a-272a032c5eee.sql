-- 역할 enum 생성
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 사용자 역할 테이블 생성
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- RLS 활성화
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 역할 확인 함수 (security definer로 RLS 순환 참조 방지)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 현재 사용자가 관리자인지 확인하는 헬퍼 함수
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS 정책: 사용자는 자신의 역할을 조회 가능
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 관리자는 모든 역할 조회 가능
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.is_admin());

-- RLS 정책: 관리자만 역할 생성 가능
CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- RLS 정책: 관리자만 역할 삭제 가능
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.is_admin());

-- company_profiles RLS 정책 업데이트: 관리자는 모든 프로필 조회 가능
CREATE POLICY "Admins can view all profiles"
  ON public.company_profiles
  FOR SELECT
  USING (public.is_admin());

-- company_profiles RLS 정책: 관리자는 모든 프로필 업데이트 가능 (승인 상태 변경용)
CREATE POLICY "Admins can update all profiles"
  ON public.company_profiles
  FOR UPDATE
  USING (public.is_admin());