import { useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Package, TrendingUp, TrendingDown, AlertCircle, Grip } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const revenueData = [
  { month: '1월', 매입: 4000, 출고: 2400, 매출: 6400 },
  { month: '2월', 매입: 3000, 출고: 1398, 매출: 4398 },
  { month: '3월', 매입: 2000, 출고: 9800, 매출: 11800 },
  { month: '4월', 매입: 2780, 출고: 3908, 매출: 6688 },
  { month: '5월', 매입: 1890, 출고: 4800, 매출: 6690 },
  { month: '6월', 매입: 2390, 출고: 3800, 매출: 6190 },
];

const categoryData = [
  { name: '의료용품', value: 400 },
  { name: '소모품', value: 300 },
  { name: '장비', value: 200 },
  { name: '기타', value: 100 },
];

export default function Dashboard() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState([
    { i: 'stats', x: 0, y: 0, w: 12, h: 2 },
    { i: 'revenue', x: 0, y: 2, w: 8, h: 4 },
    { i: 'category', x: 8, y: 2, w: 4, h: 4 },
    { i: 'alerts', x: 0, y: 6, w: 6, h: 3 },
    { i: 'recent', x: 6, y: 6, w: 6, h: 3 },
  ]);

  const onLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">실시간 비즈니스 현황을 확인하세요</p>
        </div>
        <Button
          variant={isEditMode ? "default" : "outline"}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          <Grip className="w-4 h-4 mr-2" />
          {isEditMode ? "편집 완료" : "위젯 편집"}
        </Button>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={80}
        width={1200}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={onLayoutChange}
      >
        <div key="stats" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 재고</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+12%</span> 전월 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩45,231,000</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+8%</span> 전월 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 매입</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩23,890,000</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">+15%</span> 전월 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">저재고 경고</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">긴급 주문 필요</p>
            </CardContent>
          </Card>
        </div>

        <Card key="revenue">
          <CardHeader>
            <CardTitle>월별 매입/출고/매출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="매입" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="출고" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="매출" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card key="category">
          <CardHeader>
            <CardTitle>카테고리별 재고</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card key="alerts">
          <CardHeader>
            <CardTitle>긴급 알림</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-sm">주사기(5ml) 재고 부족</p>
                  <p className="text-xs text-muted-foreground">현재: 10개 / 안전재고: 50개</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">거즈 패드 재주문 시점</p>
                  <p className="text-xs text-muted-foreground">예상 소진일: 7일 후</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card key="recent">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">주사기(10ml) 매입</p>
                  <p className="text-xs text-muted-foreground">5분 전</p>
                </div>
                <span className="text-sm text-green-600">+200개</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">거즈 패드 출고</p>
                  <p className="text-xs text-muted-foreground">1시간 전</p>
                </div>
                <span className="text-sm text-red-600">-150개</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">의료용 장갑 매입</p>
                  <p className="text-xs text-muted-foreground">3시간 전</p>
                </div>
                <span className="text-sm text-green-600">+500개</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </GridLayout>
    </div>
  );
}
