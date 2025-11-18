import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Product {
  productCode: string;
  productName: string;
  currentStock: number;
  safetyStock: number;
  category?: string;
  unitPrice?: number;
}

interface InventoryVisualizationProps {
  products: Product[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export function InventoryVisualization({ products }: InventoryVisualizationProps) {
  // 카테고리별 재고 계산
  const categoryData = products.reduce((acc, product) => {
    const category = product.category || '미분류';
    if (!acc[category]) {
      acc[category] = { category, total: 0, value: 0, count: 0 };
    }
    acc[category].total += product.currentStock;
    acc[category].value += product.currentStock * (product.unitPrice || 0);
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { category: string; total: number; value: number; count: number }>);

  const categoryChartData = Object.values(categoryData);

  // 재고 상태별 분류
  const stockStatus = {
    critical: products.filter(p => p.currentStock < p.safetyStock * 0.5),
    low: products.filter(p => p.currentStock >= p.safetyStock * 0.5 && p.currentStock < p.safetyStock),
    normal: products.filter(p => p.currentStock >= p.safetyStock && p.currentStock < p.safetyStock * 2),
    excess: products.filter(p => p.currentStock >= p.safetyStock * 2)
  };

  const statusData = [
    { name: '긴급', value: stockStatus.critical.length, color: '#EF4444' },
    { name: '부족', value: stockStatus.low.length, color: '#F59E0B' },
    { name: '정상', value: stockStatus.normal.length, color: '#10B981' },
    { name: '과다', value: stockStatus.excess.length, color: '#3B82F6' }
  ];

  // Top 5 부족 제품
  const topLowStock = [...products]
    .filter(p => p.currentStock < p.safetyStock)
    .sort((a, b) => {
      const diffA = (a.safetyStock - a.currentStock) / a.safetyStock;
      const diffB = (b.safetyStock - b.currentStock) / b.safetyStock;
      return diffB - diffA;
    })
    .slice(0, 5);

  const getStockPercentage = (current: number, safety: number) => {
    return Math.min((current / safety) * 100, 100);
  };

  const getStockTrend = (current: number, safety: number) => {
    if (current < safety * 0.5) return { icon: AlertTriangle, color: 'text-destructive', label: '긴급' };
    if (current < safety) return { icon: TrendingDown, color: 'text-orange-500', label: '부족' };
    if (current < safety * 2) return { icon: Minus, color: 'text-green-500', label: '정상' };
    return { icon: TrendingUp, color: 'text-blue-500', label: '과다' };
  };

  return (
    <div className="space-y-6">
      {/* 재고 상태 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">긴급</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stockStatus.critical.length}</div>
            <p className="text-xs text-muted-foreground mt-1">안전재고 50% 미만</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">부족</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{stockStatus.low.length}</div>
            <p className="text-xs text-muted-foreground mt-1">안전재고 미만</p>
          </CardContent>
        </Card>

        <Card className="border-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">정상</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stockStatus.normal.length}</div>
            <p className="text-xs text-muted-foreground mt-1">적정 재고 수준</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">과다</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stockStatus.excess.length}</div>
            <p className="text-xs text-muted-foreground mt-1">안전재고 200% 이상</p>
          </CardContent>
        </Card>
      </div>

      {/* 재고 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>재고 분석</CardTitle>
          <CardDescription>카테고리별 및 상태별 재고 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="category" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="category">카테고리별</TabsTrigger>
              <TabsTrigger value="status">상태별</TabsTrigger>
            </TabsList>

            <TabsContent value="category" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="총 재고량" fill="hsl(var(--primary))" />
                  <Bar dataKey="count" name="제품 수" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="status" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Top 5 부족 제품 */}
      {topLowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              재고 부족 상위 5개 제품
            </CardTitle>
            <CardDescription>빠른 발주가 필요한 제품</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topLowStock.map((product) => {
              const percentage = getStockPercentage(product.currentStock, product.safetyStock);
              const trend = getStockTrend(product.currentStock, product.safetyStock);
              const TrendIcon = trend.icon;

              return (
                <div key={product.productCode} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                      <span className="font-semibold">{product.productName}</span>
                      <Badge variant="outline" className="text-xs">
                        {product.productCode}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={percentage < 50 ? "destructive" : "secondary"}>
                        {trend.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {product.currentStock} / {product.safetyStock}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${percentage < 50 ? 'bg-destructive/20' : 'bg-orange-500/20'}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
