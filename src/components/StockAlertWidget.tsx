import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  productCode: string;
  productName: string;
  currentStock: number;
  safetyStock: number;
  supplier?: string;
}

interface StockAlertWidgetProps {
  products: Product[];
}

export function StockAlertWidget({ products }: StockAlertWidgetProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);

  const lowStockProducts = products.filter(p => p.currentStock < p.safetyStock);
  const criticalProducts = lowStockProducts.filter(p => p.currentStock < p.safetyStock * 0.5);

  const handleOrderRequest = (product: Product) => {
    toast({
      title: "발주 요청",
      description: `${product.productName}의 발주가 요청되었습니다.`,
    });
  };

  if (lowStockProducts.length === 0) {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-green-500">재고 상태 양호</CardTitle>
            <Badge variant="outline" className="border-green-500 text-green-500">
              정상
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            모든 제품의 재고가 안전 재고 수준 이상입니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">재고 부족 알림</CardTitle>
              <Badge variant="destructive">{lowStockProducts.length}건</Badge>
              {criticalProducts.length > 0 && (
                <Badge variant="destructive" className="bg-red-600">
                  긴급 {criticalProducts.length}건
                </Badge>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {isOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    접기
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    펼치기
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription>안전 재고 수준 이하의 제품을 확인하세요</CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-3">
            {lowStockProducts.map((product) => {
              const shortage = product.safetyStock - product.currentStock;
              const isCritical = product.currentStock < product.safetyStock * 0.5;
              
              return (
                <div
                  key={product.productCode}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    isCritical ? 'border-red-600 bg-red-50 dark:bg-red-950/20' : 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{product.productName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {product.productCode}
                      </Badge>
                      {isCritical && (
                        <Badge variant="destructive" className="text-xs bg-red-600">
                          긴급
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className={`font-medium ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                        현재: {product.currentStock}
                      </span>
                      {" / "}
                      <span className="text-muted-foreground">안전: {product.safetyStock}</span>
                      {" | "}
                      <span className="text-muted-foreground">부족: {shortage}</span>
                    </div>
                    {product.supplier && (
                      <div className="text-xs text-muted-foreground">
                        공급업체: {product.supplier}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isCritical ? "destructive" : "default"}
                    onClick={() => handleOrderRequest(product)}
                    className="gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isCritical ? '긴급 발주' : '발주 제안'}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
