import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  productCode: string;
  productName: string;
  currentStock: number;
  safetyStock: number;
  averageDailyUsage: number;
  lastOrderDate: Date;
}

interface PredictionResult {
  productCode: string;
  productName: string;
  currentStock: number;
  predictedStockoutDate: Date;
  daysUntilStockout: number;
  recommendedOrderQuantity: number;
  recommendedOrderDate: Date;
  priority: "high" | "medium" | "low";
  confidence: number;
}

export function AIReorderPrediction({ products }: { products: Product[] }) {
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisInterval, setAnalysisInterval] = useState<number>(0); // 0 = 수동, 1 = 1시간, 24 = 1일
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(false);

  const analyzePredictions = () => {
    setIsAnalyzing(true);
    
    // AI 기반 예측 시뮬레이션 (실제로는 AI API 호출)
    setTimeout(() => {
      const results: PredictionResult[] = products
        .map(product => {
          const daysUntilStockout = Math.floor(
            (product.currentStock - product.safetyStock) / 
            (product.averageDailyUsage || 1)
          );

          const predictedStockoutDate = new Date();
          predictedStockoutDate.setDate(predictedStockoutDate.getDate() + daysUntilStockout);

          const recommendedOrderDate = new Date();
          recommendedOrderDate.setDate(recommendedOrderDate.getDate() + Math.max(0, daysUntilStockout - 7));

          const recommendedOrderQuantity = Math.ceil(
            product.averageDailyUsage * 30 + product.safetyStock
          );

          let priority: "high" | "medium" | "low";
          if (daysUntilStockout < 7) priority = "high";
          else if (daysUntilStockout < 14) priority = "medium";
          else priority = "low";

          const confidence = Math.random() * 20 + 80; // 80-100% 신뢰도

          return {
            productCode: product.productCode,
            productName: product.productName,
            currentStock: product.currentStock,
            predictedStockoutDate,
            daysUntilStockout,
            recommendedOrderQuantity,
            recommendedOrderDate,
            priority,
            confidence
          };
        })
        .filter(p => p.daysUntilStockout < 30)
        .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

      setPredictions(results);
      setIsAnalyzing(false);

      toast({
        title: "AI 분석 완료",
        description: `${results.length}개 제품의 재주문 예측이 완료되었습니다.`
      });
    }, 2000);
  };

  // 자동 분석 타이머
  useEffect(() => {
    if (autoAnalysisEnabled && analysisInterval > 0 && products.length > 0) {
      const intervalMs = analysisInterval * 60 * 60 * 1000; // 시간을 밀리초로 변환
      const timer = setInterval(() => {
        analyzePredictions();
      }, intervalMs);

      return () => clearInterval(timer);
    }
  }, [autoAnalysisEnabled, analysisInterval, products]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 dark:bg-red-950";
      case "medium": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950";
      case "low": return "text-green-600 bg-green-50 dark:bg-green-950";
      default: return "";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="w-4 h-4" />;
      case "medium": return <TrendingUp className="w-4 h-4" />;
      case "low": return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI 재주문 예측
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={analysisInterval}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setAnalysisInterval(val);
                  setAutoAnalysisEnabled(val > 0);
                }}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="0">수동</option>
                <option value="1">1시간마다</option>
                <option value="3">3시간마다</option>
                <option value="6">6시간마다</option>
                <option value="24">1일마다</option>
              </select>
              <Button 
                onClick={analyzePredictions} 
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? "분석 중..." : "분석 시작"}
              </Button>
            </div>
          </div>
          {autoAnalysisEnabled && (
            <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
              ⏰ 자동 분석 활성화: {analysisInterval}시간마다 실행됩니다
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">AI가 재고 데이터를 분석 중입니다...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <p className="text-muted-foreground">현재 긴급한 재주문이 필요한 제품이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.productCode}
                className={`p-4 rounded-lg border ${getPriorityColor(prediction.priority)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{prediction.productName}</h4>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getPriorityIcon(prediction.priority)}
                        {prediction.priority === "high" ? "긴급" : 
                         prediction.priority === "medium" ? "중요" : "정상"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      제품 코드: {prediction.productCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      신뢰도: {prediction.confidence.toFixed(1)}%
                    </p>
                    <Progress value={prediction.confidence} className="w-20 h-2 mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">현재 재고</p>
                    <p className="font-semibold">{prediction.currentStock}개</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">소진 예상</p>
                    <p className="font-semibold">
                      {prediction.daysUntilStockout}일 후
                      <span className="text-xs ml-1 text-muted-foreground">
                        ({prediction.predictedStockoutDate.toLocaleDateString('ko-KR')})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">권장 주문량</p>
                    <p className="font-semibold text-primary">
                      {prediction.recommendedOrderQuantity}개
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">권장 주문일</p>
                    <p className="font-semibold">
                      {prediction.recommendedOrderDate.toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>

                <Button 
                  className="w-full mt-3" 
                  size="sm"
                  variant={prediction.priority === "high" ? "default" : "outline"}
                >
                  주문서 생성
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
