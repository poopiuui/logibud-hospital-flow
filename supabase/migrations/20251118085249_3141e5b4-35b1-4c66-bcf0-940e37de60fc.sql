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

-- 정책 DROP (이미 존재하는 경우)
DROP POLICY IF EXISTS "Admins can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Admins can manage purchase order items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Admins can manage purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can manage purchase items" ON public.purchase_items;
DROP POLICY IF EXISTS "Admins can manage outbound orders" ON public.outbound_orders;
DROP POLICY IF EXISTS "Admins can manage outbound items" ON public.outbound_items;
DROP POLICY IF EXISTS "Admins can manage shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins can manage quotations" ON public.quotations;
DROP POLICY IF EXISTS "Admins can manage quotation items" ON public.quotation_items;

-- RLS 정책: 관리자는 모든 작업 가능
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage purchase orders" ON public.purchase_orders FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage purchase order items" ON public.purchase_order_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage purchases" ON public.purchases FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage purchase items" ON public.purchase_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage outbound orders" ON public.outbound_orders FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage outbound items" ON public.outbound_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage shipments" ON public.shipments FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage invoice items" ON public.invoice_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage quotations" ON public.quotations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage quotation items" ON public.quotation_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 타임스탬프 자동 업데이트 트리거 함수 (이미 있으면 재생성)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 DROP 후 재생성
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON public.purchase_orders;
DROP TRIGGER IF EXISTS update_purchases_updated_at ON public.purchases;
DROP TRIGGER IF EXISTS update_outbound_orders_updated_at ON public.outbound_orders;
DROP TRIGGER IF EXISTS update_shipments_updated_at ON public.shipments;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
DROP TRIGGER IF EXISTS update_quotations_updated_at ON public.quotations;

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outbound_orders_updated_at BEFORE UPDATE ON public.outbound_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();