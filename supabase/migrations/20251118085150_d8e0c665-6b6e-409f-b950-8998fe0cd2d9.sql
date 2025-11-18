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

-- 인덱스 생성 (존재하지 않는 경우에만)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suppliers_code') THEN
    CREATE INDEX idx_suppliers_code ON public.suppliers(code);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_code') THEN
    CREATE INDEX idx_categories_code ON public.categories(code);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchase_orders_supplier') THEN
    CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchases_supplier') THEN
    CREATE INDEX idx_purchases_supplier ON public.purchases(supplier_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_outbound_orders_customer') THEN
    CREATE INDEX idx_outbound_orders_customer ON public.outbound_orders(customer_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shipments_outbound') THEN
    CREATE INDEX idx_shipments_outbound ON public.shipments(outbound_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_outbound') THEN
    CREATE INDEX idx_invoices_outbound ON public.invoices(outbound_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quotations_customer') THEN
    CREATE INDEX idx_quotations_customer ON public.quotations(customer_id);
  END IF;
END $$;