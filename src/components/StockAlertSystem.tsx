import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ShoppingCart, X, Bell, BellOff, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

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
    const recommendedOrder = Math.ceil(shortage * 1.5);
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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
              <div className="flex items-center gap-2">
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
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    {isOpen ? (
                      <>
                        <ChevronUp className="w-4 w-4" />
                        접기
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        펼치기
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CardDescription>안전 재고 수준 이하의 제품을 확인하세요</CardDescription>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="space-y-3">
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
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              발주 제안
            </DialogTitle>
            <DialogDescription>
              재고 부족 제품에 대한 발주 제안을 확인하세요
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">제품명</p>
                  <p className="font-semibold">{selectedProduct.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">제품코드</p>
                  <p className="font-mono">{selectedProduct.productCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">현재 재고</p>
                  <p className="font-semibold text-destructive">{selectedProduct.currentStock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">안전 재고</p>
                  <p className="font-semibold">{selectedProduct.safetyStock}</p>
                </div>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="font-semibold text-primary">추천 발주 수량</h4>
                {(() => {
                  const { shortage, recommendedOrder, totalCost } = calculateOrderProposal(selectedProduct);
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">부족 수량</p>
                          <p className="text-xl font-bold text-destructive">{shortage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">권장 발주량</p>
                          <p className="text-xl font-bold text-primary">{recommendedOrder}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground">예상 발주 금액</p>
                        <p className="text-2xl font-bold">₩{totalCost.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        * 안전 재고의 150%를 기준으로 산정되었습니다.
                      </p>
                    </>
                  );
                })()}
              </div>
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
                toast({
                  title: "발주 요청 완료",
                  description: `${selectedProduct?.productName}의 발주가 요청되었습니다.`,
                });
                setIsAlertOpen(false);
              }}
            >
              발주 요청
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
