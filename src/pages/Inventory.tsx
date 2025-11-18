import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, FileDown, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { SwipeableTableRow } from "@/components/SwipeableTableRow";
import { CommonFilters } from "@/components/CommonFilters";

const COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FF9800'];

interface InventoryItem {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  currentStock: number;
  safetyStock: number;
  lastInboundDate: string;
  location: string;
  createdBy: string;
}

interface Transaction {
  id: number;
  type: '매입' | '출고' | '조정';
  product: string;
  quantity: number;
  date: string;
  amount: number;
  reason?: string;
  createdBy: string;
}

export default function Inventory() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [showHistory, setShowHistory] = useState(true);

  const inventoryItems: InventoryItem[] = [
    { id: '1', productCode: 'A-001', productName: '주사기(5ml)', category: '주사기/바늘', currentStock: 850, safetyStock: 1000, lastInboundDate: '2024-01-15', location: 'A-01', createdBy: '김관리' },
    { id: '2', productCode: 'B-012', productName: '거즈 패드', category: '붕대/거즈', currentStock: 2100, safetyStock: 2000, lastInboundDate: '2024-01-14', location: 'B-02', createdBy: '이관리' },
    { id: '3', productCode: 'C-045', productName: '일회용 장갑(M)', category: '보호구', currentStock: 400, safetyStock: 5000, lastInboundDate: '2024-01-13', location: 'C-03', createdBy: '박관리' },
    { id: '4', productCode: 'D-078', productName: '알코올 솜', category: '의료소모품', currentStock: 8900, safetyStock: 10000, lastInboundDate: '2024-01-16', location: 'D-04', createdBy: '김관리' },
    { id: '5', productCode: 'E-092', productName: '링거 세트', category: '수액/주사액', currentStock: 500, safetyStock: 1500, lastInboundDate: '2024-01-12', location: 'E-05', createdBy: '이관리' },
  ];

  const monthlyData = [
    { name: '매입', value: 45000000 },
    { name: '출고', value: 38000000 },
    { name: '재고', value: 12500000 },
    { name: '매출', value: 52000000 },
  ];

  const yearlyData = [
    { month: '1월', 매입: 42000000, 출고: 35000000, 재고: 11000000, 매출: 48000000 },
    { month: '2월', 매입: 45000000, 출고: 38000000, 재고: 12500000, 매출: 52000000 },
    { month: '3월', 매입: 48000000, 출고: 40000000, 재고: 13500000, 매출: 55000000 },
    { month: '4월', 매입: 43000000, 출고: 36000000, 재고: 12000000, 매출: 49000000 },
    { month: '5월', 매입: 47000000, 출고: 39000000, 재고: 13000000, 매출: 53000000 },
    { month: '6월', 매입: 50000000, 출고: 42000000, 재고: 14000000, 매출: 57000000 },
  ];

  const recentTransactions: Transaction[] = [
    { id: 1, type: '매입', product: '주사기(5ml)', quantity: 500, date: '2024-01-15', amount: 75000, createdBy: '김관리' },
    { id: 2, type: '출고', product: '거즈 패드', quantity: 200, date: '2024-01-15', amount: 16000, createdBy: '이관리' },
    { id: 3, type: '매입', product: '일회용 장갑(M)', quantity: 1000, date: '2024-01-14', amount: 50000, createdBy: '박관리' },
    { id: 4, type: '조정', product: '알코올 솜', quantity: -50, date: '2024-01-14', amount: 0, reason: '폐기', createdBy: '김관리' },
  ];

  const filteredInventory = inventoryItems
    .filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "high":
          return b.currentStock - a.currentStock;
        case "low":
          return a.currentStock - a.safetyStock - (b.currentStock - b.safetyStock);
        case "recent":
          return new Date(b.lastInboundDate).getTime() - new Date(a.lastInboundDate).getTime();
        default:
          return 0;
      }
    });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredInventory);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "재고현황");
    XLSX.writeFile(wb, "재고관리_데이터.xlsx");
    toast({ title: "Excel 내보내기 완료", description: "재고 데이터가 Excel로 내보내졌습니다." });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("재고 현황", 20, 20);
    let y = 40;
    filteredInventory.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${item.productCode} - ${item.productName}: ${item.currentStock}`, 20, y);
      y += 10;
    });
    doc.save("재고관리_데이터.pdf");
    toast({ title: "PDF 내보내기 완료", description: "재고 데이터가 PDF로 내보내졌습니다." });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 touch-pan-y">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">재고 관리</h1>
          <p className="text-muted-foreground text-base md:text-lg mt-2">재고 현황 및 통계</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/purchase')} size="lg" className="gap-2">
            <ArrowUpCircle className="w-5 h-5" />
            매입 관리로 이동
          </Button>
          <Button onClick={exportToExcel} size="lg" variant="secondary" className="gap-2">
            <FileDown className="w-5 h-5" />
            Excel
          </Button>
          <Button onClick={exportToPDF} size="lg" variant="outline" className="gap-2">
            <FileDown className="w-5 h-5" />
            PDF
          </Button>
        </div>
      </div>

      {/* 최근 입출고 이력 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">최근 입출고 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>제품명</TableHead>
                  <TableHead className="text-right">수량</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead>등록자</TableHead>
                  <TableHead>비고</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap">{transaction.date}</TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.type === '매입' ? 'default' :
                        transaction.type === '출고' ? 'secondary' : 'outline'
                      }>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.product}</TableCell>
                    <TableCell className="text-right">{transaction.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">₩{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>{transaction.createdBy}</TableCell>
                    <TableCell>{transaction.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 재고 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">재고 현황</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommonFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="제품명 또는 코드 검색..."
            sortOrder={sortOrder}
            onSortToggle={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            customFilters={
              <>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    <SelectItem value="주사기/바늘">주사기/바늘</SelectItem>
                    <SelectItem value="붕대/거즈">붕대/거즈</SelectItem>
                    <SelectItem value="보호구">보호구</SelectItem>
                    <SelectItem value="의료소모품">의료소모품</SelectItem>
                    <SelectItem value="수액/주사액">수액/주사액</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="정렬" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">최근 입고순</SelectItem>
                    <SelectItem value="high">재고 많은순</SelectItem>
                    <SelectItem value="low">재고 부족순</SelectItem>
                  </SelectContent>
                </Select>
              </>
            }
          />

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={exportToExcel}>
              <FileDown className="mr-2 h-4 w-4" />
              엑셀 다운로드
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              PDF 다운로드
            </Button>
          </div>

          <div className="overflow-x-auto -mx-2 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제품코드</TableHead>
                  <TableHead>제품명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-right">현재고</TableHead>
                  <TableHead className="text-right">안전재고</TableHead>
                  <TableHead>최근입고일</TableHead>
                  <TableHead>위치</TableHead>
                  <TableHead>등록자</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productCode}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{item.currentStock.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.safetyStock.toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.lastInboundDate}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.createdBy}</TableCell>
                    <TableCell>
                      <Badge variant={item.currentStock < item.safetyStock ? "destructive" : "default"}>
                        {item.currentStock < item.safetyStock ? "부족" : "정상"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 통계 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">월별 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={monthlyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ₩${(entry.value / 1000000).toFixed(0)}M`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">년별 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="매입" fill="#4CAF50" />
                <Bar dataKey="출고" fill="#F44336" />
                <Bar dataKey="재고" fill="#2196F3" />
                <Bar dataKey="매출" fill="#FF9800" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
