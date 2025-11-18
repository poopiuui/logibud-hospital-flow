import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, ShoppingCart, X, Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  productCode: string;
  productName: string;
  currentStock: number;
  safetyStock: number;
  unitPrice: number;
  supplier: string;
}

interface StockAlertSystemProps {
  products: Product[];
  onOrderClick?: (product: Product) => void;
}

export function StockAlertSystem({ products, onOrderClick }: StockAlertSystemProps) {
  const { toast } = useToast();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const lowStock = products.filter(
      (p) => p.currentStock < p.safetyStock && !dismissedAlerts.has(p.productCode)
    );
    setLowStockProducts(lowStock);

    // 새로운 재고 부족 제품 알림
    if (notificationsEnabled && lowStock.length > 0) {
      const newAlerts = lowStock.filter((p) => !lowStockProducts.some((lp) => lp.productCode === p.productCode));
      
      newAlerts.forEach((product) => {
        const shortage = product.safetyStock - product.currentStock;
        const orderAmount = Math.ceil(shortage * 1.5); // 안전재고의 150% 발주 제안
        
        toast({
          title: "⚠️ 재고 부족 알림",
          description: `${product.productName} 재고가 부족합니다 (현재: ${product.currentStock}, 안전: ${product.safetyStock})`,
          action: (
            <Button
              size="sm"
              onClick={() => {
                setSelectedProduct(product);
                setIsAlertOpen(true);
              }}
            >
              발주 제안
            </Button>
          ),
        });
      });
    }
  }, [products, notificationsEnabled, dismissedAlerts]);

  const handleDismissAlert = (productCode: string) => {
    setDismissedAlerts((prev) => new Set([...prev, productCode]));
  };

  const handleOrderProposal = (product: Product) => {
    setSelectedProduct(product);
    setIsAlertOpen(true);
  };

  const calculateOrderProposal = (product: Product) => {
    const shortage = product.safetyStock - product.currentStock;
    const recommendedOrder = Math.ceil(shortage * 1.5); // 안전재고의 150%
    const totalCost = recommendedOrder * product.unitPrice;
    
    return {
      shortage,
      recommendedOrder,
      totalCost,
    };
  };

  if (lowStockProducts.length === 0) {
    return (
      <Alert className="border-success bg-success/10">
        <Bell className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">재고 상태 양호</AlertTitle>
        <AlertDescription>
          모든 제품의 재고가 안전 재고 수준 이상입니다.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">재고 부족 알림</CardTitle>
              <Badge variant="destructive" className="ml-2">
                {lowStockProducts.length}건
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="gap-2"
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4" />
                  알림 켜짐
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4" />
                  알림 꺼짐
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            아래 제품들의 재고가 안전 재고 수준 미달입니다. 발주를 고려하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockProducts.map((product) => {
              const { shortage, recommendedOrder, totalCost } = calculateOrderProposal(product);
              
              return (
                <div
                  key={product.productCode}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{product.productName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {product.productCode}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-destructive">
                        현재: {product.currentStock}
                      </span>
                      {" / "}
                      <span>안전: {product.safetyStock}</span>
                      {" | "}
                      <span>부족: {shortage}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      공급업체: {product.supplier}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOrderProposal(product)}
                      className="gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      발주 제안
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissAlert(product.productCode)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 발주 제안 다이얼로그 */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              발주 제안
            </DialogTitle>
            <DialogDescription>
              AI 기반 재고 분석을 통한 최적 발주량 제안
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold text-lg mb-2">{selectedProduct.productName}</h4>
                <div className="text-sm text-muted-foreground">
                  제품코드: {selectedProduct.productCode}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">현재 재고</div>
                  <div className="text-2xl font-bold text-destructive">
                    {selectedProduct.currentStock}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">안전 재고</div>
                  <div className="text-2xl font-bold">
                    {selectedProduct.safetyStock}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  권장 발주 정보
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">부족 수량</span>
                    <span className="font-semibold">
                      {calculateOrderProposal(selectedProduct).shortage}개
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">권장 발주량</span>
                    <span className="font-semibold text-primary">
                      {calculateOrderProposal(selectedProduct).recommendedOrder}개
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">단가</span>
                    <span className="font-medium">
                      ₩{selectedProduct.unitPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between">
                    <span className="font-semibold">예상 발주 금액</span>
                    <span className="text-xl font-bold text-primary">
                      ₩{calculateOrderProposal(selectedProduct).totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>발주 제안 근거</AlertTitle>
                <AlertDescription className="text-xs">
                  현재 재고가 안전 재고보다 {calculateOrderProposal(selectedProduct).shortage}개 부족합니다. 
                  안전 재고의 150%를 확보하여 향후 수요 변동에 대비하는 것을 권장합니다.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                if (selectedProduct && onOrderClick) {
                  onOrderClick(selectedProduct);
                }
                setIsAlertOpen(false);
                toast({
                  title: "발주 요청 완료",
                  description: `${selectedProduct?.productName} 발주가 요청되었습니다.`,
                });
              }}
              className="gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              발주 요청
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
