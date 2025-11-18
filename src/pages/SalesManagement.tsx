import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, Download, Calendar, TrendingUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

interface Sale {
  id: string;
  date: string;
  salesPerson: string;
  customer: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
}

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'];

const SalesManagement = () => {
  const [sales] = useState<Sale[]>([
    { id: 'S-001', date: '2024-12-15 14:30', salesPerson: '김영업', customer: '스마트마켓', product: '노트북 A1', quantity: 10, unitPrice: 500000, totalAmount: 5000000, status: '완료' },
    { id: 'S-002', date: '2024-12-16 09:15', salesPerson: '이영업', customer: '테크스토어', product: '스마트폰 X2', quantity: 20, unitPrice: 800000, totalAmount: 16000000, status: '완료' },
    { id: 'S-003', date: '2024-12-14 11:45', salesPerson: '김영업', customer: '디지털플라자', product: '태블릿 T3', quantity: 15, unitPrice: 500000, totalAmount: 7500000, status: '완료' },
    { id: 'S-004', date: '2024-12-13 16:20', salesPerson: '박영업', customer: '스마트마켓', product: '모니터 M4', quantity: 8, unitPrice: 350000, totalAmount: 2800000, status: '완료' },
    { id: 'S-005', date: '2024-11-25 10:00', salesPerson: '이영업', customer: '테크스토어', product: '키보드 K5', quantity: 50, unitPrice: 50000, totalAmount: 2500000, status: '완료' },
    { id: 'S-006', date: '2024-11-12 13:30', salesPerson: '김영업', customer: '디지털플라자', product: '마우스 M6', quantity: 40, unitPrice: 40000, totalAmount: 1600000, status: '완료' },
    { id: 'S-007', date: '2024-10-28 15:45', salesPerson: '박영업', customer: '스마트마켓', product: 'USB 드라이브', quantity: 100, unitPrice: 20000, totalAmount: 2000000, status: '완료' },
    { id: 'S-008', date: '2024-10-15 09:20', salesPerson: '이영업', customer: '테크스토어', product: '헤드셋', quantity: 25, unitPrice: 150000, totalAmount: 3750000, status: '완료' },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [salesPersonFilter, setSalesPersonFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSales.map(sale => ({
      '매출번호': sale.id,
      '날짜': sale.date,
      '영업사원': sale.salesPerson,
      '고객사': sale.customer,
      '제품명': sale.product,
      '수량': sale.quantity,
      '단가': sale.unitPrice,
      '총액': sale.totalAmount,
      '상태': sale.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "매출관리");
    XLSX.writeFile(wb, "매출관리_데이터.xlsx");
  };

  const salesPersons = Array.from(new Set(sales.map(s => s.salesPerson)));
  const customers = Array.from(new Set(sales.map(s => s.customer)));
  const availableYears = Array.from(new Set(sales.map(s => new Date(s.date).getFullYear()))).sort((a, b) => b - a);
  const availableMonths = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sale.salesPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const saleDate = new Date(sale.date);
    const matchesSalesPerson = salesPersonFilter === "all" || sale.salesPerson === salesPersonFilter;
    const matchesCustomer = customerFilter === "all" || sale.customer === customerFilter;
    const matchesYear = yearFilter === "all" || saleDate.getFullYear().toString() === yearFilter;
    const matchesMonth = monthFilter === "all" || (saleDate.getMonth() + 1).toString() === monthFilter;
    
    return matchesSearch && matchesSalesPerson && matchesCustomer && matchesYear && matchesMonth;
  });

  // 영업사원별 매출 통계
  const salesByPerson = salesPersons.map(person => ({
    name: person,
    amount: sales.filter(s => s.salesPerson === person).reduce((sum, s) => sum + s.totalAmount, 0)
  }));

  // 고객사별 매출 통계
  const salesByCustomer = customers.map(customer => ({
    name: customer,
    amount: sales.filter(s => s.customer === customer).reduce((sum, s) => sum + s.totalAmount, 0)
  }));

  // 월별 매출 추이
  const monthlySales = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map((month, idx) => ({
    month,
    amount: sales.filter(s => new Date(s.date).getMonth() === idx).reduce((sum, s) => sum + s.totalAmount, 0)
  }));

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const avgSaleAmount = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">매출 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">영업사원별 매출 현황 및 분석 (영업사원 감시용)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExcelDownload} variant="outline" size="lg">
            <Download className="mr-2 h-5 w-5" />
            엑셀 다운로드
          </Button>
          <Button onClick={() => window.history.back()} variant="ghost" size="lg">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 통계 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">총 매출액</CardTitle>
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₩{(totalSales / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">총 거래건수</CardTitle>
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredSales.length}건</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">평균 거래액</CardTitle>
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₩{(avgSaleAmount / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">총 판매수량</CardTitle>
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuantity}개</div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 탭 */}
      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="monthly" className="text-base">월별 추이</TabsTrigger>
          <TabsTrigger value="salesperson" className="text-base">영업사원별</TabsTrigger>
          <TabsTrigger value="customer" className="text-base">고객사별</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">월별 매출 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₩${(value / 1000000)}M`} />
                  <Tooltip formatter={(value: number) => `₩${(value / 1000000).toFixed(1)}M`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" name="매출액" stroke="#4CAF50" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salesperson">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">영업사원별 매출 (감시용)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesByPerson}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₩${(value / 1000000)}M`} />
                  <Tooltip formatter={(value: number) => `₩${(value / 1000000).toFixed(1)}M`} />
                  <Legend />
                  <Bar dataKey="amount" name="매출액" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">고객사별 매출 비중</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={salesByCustomer}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {salesByCustomer.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₩${(value / 1000000).toFixed(1)}M`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 필터 및 매출 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">매출 내역</CardTitle>
          <CardDescription>상세 필터링을 통한 영업사원 감시</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            <Select value={salesPersonFilter} onValueChange={setSalesPersonFilter}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="영업사원" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 영업사원</SelectItem>
                {salesPersons.map(person => (
                  <SelectItem key={person} value={person}>{person}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="고객사" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 고객사</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="연도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="월" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>{month}월</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="lg"
              className="h-12"
              onClick={() => {
                setSearchTerm("");
                setSalesPersonFilter("all");
                setCustomerFilter("all");
                setYearFilter("all");
                setMonthFilter("all");
              }}
            >
              초기화
            </Button>
          </div>

          <div className="border-2 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold text-base">매출번호</TableHead>
                  <TableHead className="font-bold text-base">날짜</TableHead>
                  <TableHead className="font-bold text-base">영업사원</TableHead>
                  <TableHead className="font-bold text-base">고객사</TableHead>
                  <TableHead className="font-bold text-base">제품명</TableHead>
                  <TableHead className="font-bold text-base">수량</TableHead>
                  <TableHead className="font-bold text-base">단가</TableHead>
                  <TableHead className="font-bold text-base">총액</TableHead>
                  <TableHead className="font-bold text-base">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono font-semibold text-base">{sale.id}</TableCell>
                    <TableCell className="text-base">{sale.date}</TableCell>
                    <TableCell className="font-medium text-base">
                      <Badge variant="secondary">{sale.salesPerson}</Badge>
                    </TableCell>
                    <TableCell className="text-base">{sale.customer}</TableCell>
                    <TableCell className="text-base">{sale.product}</TableCell>
                    <TableCell className="text-base">{sale.quantity}개</TableCell>
                    <TableCell className="text-base">₩{sale.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-base">₩{sale.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="default">{sale.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesManagement;
