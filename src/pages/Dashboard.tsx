import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIReorderPrediction } from "@/components/AIReorderPrediction";
import { StockAlertWidget } from "@/components/StockAlertWidget";
import { InventoryVisualization } from "@/components/InventoryVisualization";
import { AutoReorderSystem } from "@/components/AutoReorderSystem";
import { DashboardCustomizer } from "@/components/DashboardCustomizer";
import { ArrowUpRight, ArrowDownRight, Package, TrendingUp, DollarSign, Users, X, RefreshCw } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>({});
  
  const [layout, setLayout] = useState([
    { i: 'kpi', x: 0, y: 0, w: 12, h: 2 },
    { i: 'stock-alert', x: 0, y: 2, w: 12, h: 3 },
    { i: 'sales', x: 0, y: 5, w: 6, h: 4 },
    { i: 'inventory', x: 6, y: 5, w: 6, h: 4 },
    { i: 'inventory-viz', x: 0, y: 9, w: 12, h: 5 },
    { i: 'auto-reorder', x: 0, y: 14, w: 12, h: 5 },
    { i: 'ai-prediction', x: 0, y: 19, w: 12, h: 4 },
  ]);

  const handleSettingsChange = (settings: { widgetVisibility: Record<string, boolean>; themeColor: string }) => {
    setWidgetVisibility(settings.widgetVisibility);
    
    // Apply theme color
    if (settings.themeColor !== 'default') {
      const colors: Record<string, string> = {
        blue: '#3B82F6',
        green: '#10B981',
        purple: '#8B5CF6',
        orange: '#F59E0B',
      };
      
      const color = colors[settings.themeColor];
      if (color) {
        document.documentElement.style.setProperty('--primary', color);
      }
    }
  };

  // 실시간 데이터 업데이트 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      console.log('Dashboard data refreshed');
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastUpdate(new Date());
    
    toast({
      title: "데이터 업데이트",
      description: "최신 데이터를 불러왔습니다.",
    });

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const sampleProducts = [
    { 
      productCode: 'P-001', 
      productName: '주사기(5ml)', 
      currentStock: 50, 
      safetyStock: 200,
      averageDailyUsage: 3,
      lastOrderDate: new Date('2024-01-01'),
      category: '주사기/바늘',
      supplier: '㈜메디칼',
      unitPrice: 150
    },
    { 
      productCode: 'P-002', 
      productName: '거즈 패드', 
      currentStock: 800, 
      safetyStock: 2000,
      averageDailyUsage: 5,
      lastOrderDate: new Date('2024-01-05'),
      category: '붕대/거즈',
      supplier: '㈜헬스케어',
      unitPrice: 80
    },
    { 
      productCode: 'P-003', 
      productName: '일회용 장갑(M)', 
      currentStock: 3000, 
      safetyStock: 5000,
      averageDailyUsage: 2,
      lastOrderDate: new Date('2024-01-10'),
      category: '보호구',
      supplier: '㈜메디칼',
      unitPrice: 50
    },
    { 
      productCode: 'P-004', 
      productName: '알코올 솜', 
      currentStock: 8900, 
      safetyStock: 10000,
      averageDailyUsage: 8,
      lastOrderDate: new Date('2024-01-12'),
      category: '의료소모품',
      supplier: '㈜의료용품',
      unitPrice: 30
    },
    { 
      productCode: 'P-005', 
      productName: '링거 세트', 
      currentStock: 300, 
      safetyStock: 1500,
      averageDailyUsage: 4,
      lastOrderDate: new Date('2024-01-15'),
      category: '수액/주사액',
      supplier: '㈜메디텍',
      unitPrice: 2500
    },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const salesData = [
    { month: '1월', 매출: 4500, 매입: 3200 },
    { month: '2월', 매출: 5200, 매입: 3800 },
    { month: '3월', 매출: 4800, 매입: 3500 },
    { month: '4월', 매출: 6100, 매입: 4200 },
    { month: '5월', 매출: 5800, 매입: 4000 },
    { month: '6월', 매출: 6500, 매입: 4500 },
  ];

  const inventoryData = [
    { category: '전자제품', 재고: 450 },
    { category: '의류', 재고: 680 },
    { category: '식품', 재고: 320 },
    { category: '가구', 재고: 180 },
    { category: '도서', 재고: 520 },
  ];

  const handleExcelDownload = () => {
    const ws1 = XLSX.utils.json_to_sheet(salesData);
    const ws2 = XLSX.utils.json_to_sheet(inventoryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "매출 데이터");
    XLSX.utils.book_append_sheet(wb, ws2, "재고 데이터");
    XLSX.writeFile(wb, "대시보드_데이터.xlsx");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
            <p className="text-muted-foreground">전체 비즈니스 현황을 한눈에 확인하세요</p>
            <span className="text-xs text-muted-foreground">
              최근 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <DashboardCustomizer onSettingsChange={handleSettingsChange} />
          <Button 
            onClick={handleManualRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button onClick={handleExcelDownload} variant="outline" size="sm">
            엑셀 다운로드
          </Button>
          <Button onClick={() => window.history.back()} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={80}
        width={1200}
        onLayoutChange={setLayout}
        draggableHandle=".drag-handle"
      >
        {widgetVisibility['kpi'] !== false && (
          <div key="kpi" className="bg-background">
            <Card className="h-full">
              <CardHeader className="drag-handle cursor-move">
                <CardTitle>핵심 지표</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">총 매출</span>
                    </div>
                    <div className="text-2xl font-bold">₩32,900,000</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>12.5%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">재고 현황</span>
                    </div>
                    <div className="text-2xl font-bold">1,245개</div>
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <ArrowDownRight className="h-4 w-4" />
                      <span>3.2%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">주문 건수</span>
                    </div>
                    <div className="text-2xl font-bold">187건</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>8.7%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">활성 고객</span>
                    </div>
                    <div className="text-2xl font-bold">342명</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>5.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {widgetVisibility['stock-alert'] !== false && (
          <div key="stock-alert" className="bg-background">
            <div className="drag-handle cursor-move h-full">
              <StockAlertWidget products={sampleProducts} />
            </div>
          </div>
        )}

        {widgetVisibility['sales'] !== false && (
          <div key="sales" className="bg-background">
            <Card className="h-full">
              <CardHeader className="drag-handle cursor-move">
                <CardTitle>매출/매입 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="매출" fill="hsl(var(--primary))" />
                    <Bar dataKey="매입" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {widgetVisibility['inventory'] !== false && (
          <div key="inventory" className="bg-background">
            <Card className="h-full">
              <CardHeader className="drag-handle cursor-move">
                <CardTitle>카테고리별 재고</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="재고" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {widgetVisibility['inventory-viz'] !== false && (
          <div key="inventory-viz" className="bg-background">
            <div className="drag-handle cursor-move h-full">
              <InventoryVisualization products={sampleProducts} />
            </div>
          </div>
        )}

        {widgetVisibility['auto-reorder'] !== false && (
          <div key="auto-reorder" className="bg-background">
            <div className="drag-handle cursor-move h-full">
              <AutoReorderSystem />
            </div>
          </div>
        )}

        {widgetVisibility['ai-prediction'] !== false && (
          <div key="ai-prediction" className="bg-background">
            <Card className="h-full">
              <CardHeader className="drag-handle cursor-move">
                <CardTitle>AI 재주문 예측</CardTitle>
              </CardHeader>
              <CardContent>
                <AIReorderPrediction products={sampleProducts} />
              </CardContent>
            </Card>
          </div>
        )}
      </GridLayout>
    </div>
  );
};

export default Dashboard;
