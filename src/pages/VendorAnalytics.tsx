import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Building2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface YearlyData {
  year: string;
  amount: number;
}

interface MonthlyData {
  month: string;
  amount: number;
}

// 샘플 데이터
const vendorData = [
  {
    id: 'V001',
    name: '스마트마켓',
    type: '매출처',
    monthly: {
      sales: [
        { month: '1월', amount: 12500000 },
        { month: '2월', amount: 13200000 },
        { month: '3월', amount: 11800000 },
        { month: '4월', amount: 14500000 },
        { month: '5월', amount: 13900000 },
        { month: '6월', amount: 15200000 },
      ] as MonthlyData[],
      purchases: [] as MonthlyData[],
    },
    yearly: {
      sales: [
        { year: '2022', amount: 145000000 },
        { year: '2023', amount: 162000000 },
        { year: '2024', amount: 181000000 },
      ] as YearlyData[],
      purchases: [] as YearlyData[],
    }
  },
  {
    id: 'V002',
    name: 'IT부품상사',
    type: '매입처',
    monthly: {
      sales: [] as MonthlyData[],
      purchases: [
        { month: '1월', amount: 8500000 },
        { month: '2월', amount: 9200000 },
        { month: '3월', amount: 7800000 },
        { month: '4월', amount: 10500000 },
        { month: '5월', amount: 9900000 },
        { month: '6월', amount: 11200000 },
      ] as MonthlyData[],
    },
    yearly: {
      sales: [] as YearlyData[],
      purchases: [
        { year: '2022', amount: 95000000 },
        { year: '2023', amount: 108000000 },
        { year: '2024', amount: 124000000 },
      ] as YearlyData[],
    }
  },
  {
    id: 'V003',
    name: '테크스토어',
    type: '매출처',
    monthly: {
      sales: [
        { month: '1월', amount: 8900000 },
        { month: '2월', amount: 9500000 },
        { month: '3월', amount: 8200000 },
        { month: '4월', amount: 10300000 },
        { month: '5월', amount: 9800000 },
        { month: '6월', amount: 11000000 },
      ] as MonthlyData[],
      purchases: [] as MonthlyData[],
    },
    yearly: {
      sales: [
        { year: '2022', amount: 98000000 },
        { year: '2023', amount: 112000000 },
        { year: '2024', amount: 127000000 },
      ] as YearlyData[],
      purchases: [] as YearlyData[],
    }
  },
];

const COLORS = ['#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9C27B0', '#00BCD4'];

export default function VendorAnalytics() {
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');

  const filteredData = selectedVendor === 'all' 
    ? vendorData 
    : vendorData.filter(v => v.id === selectedVendor);

  // 거래처별 총 거래액 계산
  const vendorTotals = vendorData.map(vendor => {
    const salesTotal = vendor.yearly.sales.reduce((sum, item) => sum + item.amount, 0);
    const purchasesTotal = vendor.yearly.purchases.reduce((sum, item) => sum + item.amount, 0);
    return {
      name: vendor.name,
      amount: salesTotal + purchasesTotal,
      type: vendor.type,
    };
  }).sort((a, b) => b.amount - a.amount);

  // 상위 거래처
  const topVendors = vendorTotals.slice(0, 5);

  const totalSales = vendorData
    .filter(v => v.type === '매출처')
    .reduce((sum, v) => sum + v.yearly.sales.reduce((s, y) => s + y.amount, 0), 0);
    
  const totalPurchases = vendorData
    .filter(v => v.type === '매입처')
    .reduce((sum, v) => sum + v.yearly.purchases.reduce((s, y) => s + y.amount, 0), 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">거래처 분석</h1>
          <p className="text-muted-foreground text-lg mt-2">거래처별 매출/매입 통계 및 패턴 분석</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          돌아가기
        </Button>
      </div>

      {/* 필터 */}
      <div className="flex gap-4">
        <Select value={selectedVendor} onValueChange={setSelectedVendor}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="거래처 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 거래처</SelectItem>
            {vendorData.map(vendor => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name} ({vendor.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={viewType} onValueChange={(v) => setViewType(v as 'monthly' | 'yearly')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">월별 분석</SelectItem>
            <SelectItem value="yearly">년별 분석</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 상위 거래처 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              주요 거래처
            </CardTitle>
            <CardDescription>총 거래액 상위 5개 거래처</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topVendors.map((vendor, index) => (
                <div key={vendor.name} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-primary">{index + 1}</span>
                    <div>
                      <p className="font-semibold">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.type}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm">{(vendor.amount / 1000000).toFixed(0)}M원</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              총 매출액
            </CardTitle>
            <CardDescription>전체 매출처 거래액 합계</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(totalSales / 1000000).toFixed(0)}M원
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>전년 대비 +12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              총 매입액
            </CardTitle>
            <CardDescription>전체 매입처 거래액 합계</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {(totalPurchases / 1000000).toFixed(0)}M원
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
              <TrendingUp className="w-4 h-4" />
              <span>전년 대비 +8.3%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">매출 분석</TabsTrigger>
          <TabsTrigger value="purchases">매입 분석</TabsTrigger>
          <TabsTrigger value="distribution">거래처 분포</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>매출처 {viewType === 'monthly' ? '월별' : '년별'} 거래액</CardTitle>
              <CardDescription>시간별 매출 추이 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={viewType === 'monthly' 
                  ? filteredData[0]?.monthly.sales || []
                  : filteredData[0]?.yearly.sales || []
                }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={viewType === 'monthly' ? 'month' : 'year'} />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                  <Legend />
                  {filteredData.map((vendor, index) => (
                    <Line 
                      key={vendor.id}
                      data={viewType === 'monthly' ? vendor.monthly.sales : vendor.yearly.sales}
                      type="monotone" 
                      dataKey="amount" 
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={2}
                      name={vendor.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>매입처 {viewType === 'monthly' ? '월별' : '년별'} 거래액</CardTitle>
              <CardDescription>시간별 매입 추이 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={viewType === 'monthly'
                  ? filteredData[0]?.monthly.purchases || []
                  : filteredData[0]?.yearly.purchases || []
                }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={viewType === 'monthly' ? 'month' : 'year'} />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    fill={COLORS[0]}
                    name={filteredData[0]?.name}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>거래처별 거래액 분포</CardTitle>
              <CardDescription>전체 거래처 비중 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={vendorTotals}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${(entry.amount / 1000000).toFixed(0)}M`}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {vendorTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
