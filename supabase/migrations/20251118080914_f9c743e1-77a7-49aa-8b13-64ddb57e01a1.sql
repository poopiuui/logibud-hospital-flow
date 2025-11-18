-- 상품 테이블
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 상품 테이블 RLS 활성화
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 상품 테이블 정책 - 모두 읽기 가능 (B2B 포털용)
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

-- 관리자만 상품 추가/수정/삭제
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- B2B 주문 테이블
CREATE TABLE IF NOT EXISTS public.b2b_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- B2B 주문 테이블 RLS 활성화
ALTER TABLE public.b2b_orders ENABLE ROW LEVEL SECURITY;

-- 거래처는 자신의 주문만 조회
CREATE POLICY "Customers can view own orders"
ON public.b2b_orders
FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- 관리자는 모든 주문 조회
CREATE POLICY "Admins can view all orders"
ON public.b2b_orders
FOR SELECT
USING (public.is_admin());

-- 거래처는 자신의 주문 생성
CREATE POLICY "Customers can create own orders"
ON public.b2b_orders
FOR INSERT
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- 관리자는 주문 수정/삭제
CREATE POLICY "Admins can manage orders"
ON public.b2b_orders
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- B2B 주문 항목 테이블
CREATE TABLE IF NOT EXISTS public.b2b_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- B2B 주문 항목 RLS 활성화
ALTER TABLE public.b2b_order_items ENABLE ROW LEVEL SECURITY;

-- 거래처는 자신의 주문 항목 조회
CREATE POLICY "Customers can view own order items"
ON public.b2b_order_items
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.b2b_orders WHERE customer_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  )
);

-- 관리자는 모든 주문 항목 조회
CREATE POLICY "Admins can view all order items"
ON public.b2b_order_items
FOR SELECT
USING (public.is_admin());

-- 거래처는 자신의 주문 항목 생성
CREATE POLICY "Customers can create own order items"
ON public.b2b_order_items
FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM public.b2b_orders WHERE customer_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  )
);

-- 관리자는 주문 항목 관리
CREATE POLICY "Admins can manage order items"
ON public.b2b_order_items
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 상품 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_products_updated_at();

-- B2B 주문 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_b2b_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_b2b_orders_updated_at
BEFORE UPDATE ON public.b2b_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_b2b_orders_updated_at();

-- 샘플 상품 데이터 삽입
INSERT INTO public.products (code, name, category, price, stock, description) VALUES
('PROD-001', '의료용 마스크 KF94', '보호장비', 25000, 500, 'KF94 인증 의료용 마스크'),
('PROD-002', '일회용 장갑 (100매)', '보호장비', 15000, 300, '일회용 라텍스 장갑 100매입'),
('PROD-003', '소독용 알코올 1L', '소독제', 12000, 150, '의료용 소독 알코올 1L'),
('PROD-004', '체온계 디지털', '측정기기', 35000, 80, '비접촉식 디지털 체온계'),
('PROD-005', '의료용 테이프', '의료소모품', 8000, 200, '저자극 의료용 테이프'),
('PROD-006', '붕대 (10개입)', '의료소모품', 18000, 120, '멸균 거즈 붕대 10개입')
ON CONFLICT (code) DO NOTHING;