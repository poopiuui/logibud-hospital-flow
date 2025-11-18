import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ImageGallery } from "@/components/ImageGallery";
import { 
  ArrowLeft, 
  Package, 
  Barcode, 
  DollarSign, 
  Building2,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  FolderOpen
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateStockHistory = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      stock: Math.floor(Math.random() * 2000) + 800,
      sales: Math.floor(Math.random() * 300) + 50,
    });
  }
  return data;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stockHistory] = useState(generateStockHistory);
  const [productImages, setProductImages] = useState<string[]>([
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
  ]);

  // 샘플 제품 데이터 (실제로는 API에서 가져와야 함)
  const product = {
    userCode: 'USER001',
    barcode: '8801234567890',
    productCode: 'A-001',
    productName: '주사기(5ml)',
    currentStock: 850,
    safetyStock: 1000,
    unitPrice: 150,
    supplier: '㈜메디칼',
    registeredDate: '2024-01-15',
    category: '주사기/바늘',
    description: '일회용 주사기 5ml, 멸균 포장',
  };

  const isLowStock = product.currentStock < product.safetyStock;
  const stockPercentage = (product.currentStock / product.safetyStock) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                돌아가기
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* 제품 기본 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 제품 이미지 & 기본 정보 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                제품 이미지 갤러리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageGallery 
                images={productImages}
                onImagesChange={setProductImages}
                productName={product.productName}
                editable={true}
              />
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">품목명</div>
                  <div className="text-2xl font-bold">{product.productName}</div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">품목코드</span>
                  <span className="font-semibold">{product.productCode}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">바코드</span>
                  <span className="font-mono text-sm">{product.barcode}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">카테고리</span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 재고 및 가격 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 재고 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  재고 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">현재 재고</div>
                    <div className="text-4xl font-bold text-primary">
                      {product.currentStock.toLocaleString()}
                    </div>
                    <div className="text-sm">개</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">안전 재고</div>
                    <div className="text-4xl font-bold text-muted-foreground">
                      {product.safetyStock.toLocaleString()}
                    </div>
                    <div className="text-sm">개</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">재고율</div>
                    <div className={`text-4xl font-bold ${isLowStock ? 'text-destructive' : 'text-success'}`}>
                      {stockPercentage.toFixed(0)}%
                    </div>
                    {isLowStock && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        재고 부족
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 가격 및 공급업체 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    가격 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">단가</div>
                      <div className="text-3xl font-bold">
                        {product.unitPrice.toLocaleString()}원
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">재고 가치</div>
                      <div className="text-2xl font-semibold text-success">
                        {(product.currentStock * product.unitPrice).toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    공급업체 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">공급업체명</div>
                      <div className="text-xl font-semibold">{product.supplier}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">등록일</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(product.registeredDate).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 제품 설명 */}
            <Card>
              <CardHeader>
                <CardTitle>제품 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 재고 추이 차트 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              재고 및 판매 추이 (최근 30일)
            </CardTitle>
            <CardDescription>일별 재고량과 판매량을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={stockHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-sm"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-sm"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="stock" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="재고량"
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="판매량"
                  dot={{ fill: 'hsl(var(--success))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" size="lg" className="gap-2">
            <ShoppingCart className="w-5 h-5" />
            발주하기
          </Button>
          <Button size="lg" className="gap-2">
            재고 조정
          </Button>
        </div>
      </div>
    </div>
  );
}
