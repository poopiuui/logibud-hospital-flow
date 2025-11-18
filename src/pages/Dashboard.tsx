import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIReorderPrediction } from "@/components/AIReorderPrediction";
import { ArrowUpRight, ArrowDownRight, Package, TrendingUp, DollarSign, Users, X } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [layout, setLayout] = useState([
    { i: 'kpi', x: 0, y: 0, w: 12, h: 2 },
    { i: 'sales', x: 0, y: 2, w: 6, h: 4 },
    { i: 'inventory', x: 6, y: 2, w: 6, h: 4 },
    { i: 'ai-prediction', x: 0, y: 6, w: 12, h: 4 },
  ]);

  const sampleProducts = [
    { 
      productCode: 'P-001', 
      productName: '노트북 A1', 
      currentStock: 50, 
      safetyStock: 20,
      averageDailyUsage: 3,
      lastOrderDate: new Date('2024-01-01')
    },
    { 
      productCode: 'P-002', 
      productName: '스마트폰 X2', 
      currentStock: 30, 
      safetyStock: 15,
      averageDailyUsage: 5,
      lastOrderDate: new Date('2024-01-05')
    },
    { 
      productCode: 'P-003', 
      productName: '태블릿 T3', 
      currentStock: 20, 
      safetyStock: 10,
      averageDailyUsage: 2,
      lastOrderDate: new Date('2024-01-10')
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">전체 비즈니스 현황을 한눈에 확인하세요</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExcelDownload} variant="outline">
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
                  <div className="text-2xl font-bold">2,150개</div>
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>3.2%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">주문 건수</span>
                  </div>
                  <div className="text-2xl font-bold">1,458건</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>8.7%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">신규 고객</span>
                  </div>
                  <div className="text-2xl font-bold">245명</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>15.3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
      </GridLayout>
    </div>
  );
};

export default Dashboard;
