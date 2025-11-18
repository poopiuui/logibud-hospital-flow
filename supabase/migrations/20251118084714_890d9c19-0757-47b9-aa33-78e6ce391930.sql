-- 거래처(매입/매출처) 테이블
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  business_number TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  payment_date TEXT,
  payment_method TEXT,
  bank_account TEXT,
  invoice_email TEXT,
  sales_rep TEXT,
  logistics_manager TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 발주서 테이블
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  status TEXT DEFAULT 'pending',
  total_amount INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 발주서 항목 테이블
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_code TEXT,
  product_name TEXT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 매입 테이블
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  purchase_type TEXT DEFAULT 'manufacturer',
  status TEXT DEFAULT 'pending',
  total_amount INTEGER DEFAULT 0,
  purchase_date TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 매입 항목 테이블
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_code TEXT,
  product_name TEXT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 출고 테이블
CREATE TABLE IF NOT EXISTS public.outbound_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbound_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.suppliers(id),
  customer_name TEXT,
  status TEXT DEFAULT 'pending',
  total_amount INTEGER DEFAULT 0,
  outbound_date TIMESTAMPTZ DEFAULT now(),
  completed_date TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 출고 항목 테이블
CREATE TABLE IF NOT EXISTS public.outbound_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbound_id UUID REFERENCES public.outbound_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_code TEXT,
  product_name TEXT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 배송 테이블
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  outbound_id UUID REFERENCES public.outbound_orders(id),
  tracking_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  status TEXT DEFAULT '주문확인중',
  shipment_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 청구서 테이블
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  outbound_id UUID REFERENCES public.outbound_orders(id),
  customer_id UUID REFERENCES public.suppliers(id),
  customer_name TEXT,
  total_amount INTEGER DEFAULT 0,
  issue_date TIMESTAMPTZ DEFAULT now(),
  payment_received BOOLEAN DEFAULT false,
  payment_date TIMESTAMPTZ,
  hometax_key TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 청구서 항목 테이블
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_code TEXT,
  product_name TEXT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 견적서 테이블
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.suppliers(id),
  customer_name TEXT,
  total_amount INTEGER DEFAULT 0,
  valid_until TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 견적서 항목 테이블
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_code TEXT,
  product_name TEXT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 관리자는 모든 작업 가능
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage purchase orders" ON public.purchase_orders FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage purchase order items" ON public.purchase_order_items FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage purchases" ON public.purchases FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage purchase items" ON public.purchase_items FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage outbound orders" ON public.outbound_orders FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage outbound items" ON public.outbound_items FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage shipments" ON public.shipments FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage invoice items" ON public.invoice_items FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage quotations" ON public.quotations FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage quotation items" ON public.quotation_items FOR ALL USING (is_admin());

-- 인덱스 생성
CREATE INDEX idx_suppliers_code ON public.suppliers(code);
CREATE INDEX idx_categories_code ON public.categories(code);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchases_supplier ON public.purchases(supplier_id);
CREATE INDEX idx_outbound_orders_customer ON public.outbound_orders(customer_id);
CREATE INDEX idx_shipments_outbound ON public.shipments(outbound_id);
CREATE INDEX idx_invoices_outbound ON public.invoices(outbound_id);
CREATE INDEX idx_quotations_customer ON public.quotations(customer_id);

-- 타임스탬프 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outbound_orders_updated_at BEFORE UPDATE ON public.outbound_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();