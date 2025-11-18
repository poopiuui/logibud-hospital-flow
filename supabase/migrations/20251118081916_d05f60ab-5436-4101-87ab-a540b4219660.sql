-- products 테이블에 b2b_enabled 컬럼 추가
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS b2b_enabled BOOLEAN NOT NULL DEFAULT true;

-- 기존 상품들도 B2B 연동 활성화
UPDATE public.products SET b2b_enabled = true WHERE b2b_enabled IS NULL;