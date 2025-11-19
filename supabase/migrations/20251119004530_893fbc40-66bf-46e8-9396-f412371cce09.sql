-- outbound_orders에 tracking_number 컬럼 추가
ALTER TABLE outbound_orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 매입 등록시 재고 자동 증가 트리거 함수
CREATE OR REPLACE FUNCTION auto_update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock + NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 출고 등록시 재고 자동 감소 트리거 함수
CREATE OR REPLACE FUNCTION auto_update_stock_on_outbound()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 출고에 송장번호 입력시 배송 자동 생성 트리거 함수
CREATE OR REPLACE FUNCTION auto_create_shipment_on_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NOT NULL AND (OLD.tracking_number IS NULL OR OLD.tracking_number = '') THEN
    INSERT INTO shipments (
      shipment_number,
      outbound_id,
      tracking_number,
      customer_name,
      status,
      created_by
    )
    VALUES (
      'SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((NEXTVAL('shipments_seq'))::TEXT, 4, '0'),
      NEW.id,
      NEW.tracking_number,
      NEW.customer_name,
      '배송중',
      NEW.created_by
    );
    NEW.status = '배송중';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 시퀀스 생성
CREATE SEQUENCE IF NOT EXISTS shipments_seq START 1;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS trigger_auto_stock_purchase ON purchase_items;
DROP TRIGGER IF EXISTS trigger_auto_stock_outbound ON outbound_items;
DROP TRIGGER IF EXISTS trigger_auto_create_shipment ON outbound_orders;

-- 트리거 생성
CREATE TRIGGER trigger_auto_stock_purchase
AFTER INSERT ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION auto_update_stock_on_purchase();

CREATE TRIGGER trigger_auto_stock_outbound
AFTER INSERT ON outbound_items
FOR EACH ROW
EXECUTE FUNCTION auto_update_stock_on_outbound();

CREATE TRIGGER trigger_auto_create_shipment
BEFORE UPDATE ON outbound_orders
FOR EACH ROW
EXECUTE FUNCTION auto_create_shipment_on_tracking();