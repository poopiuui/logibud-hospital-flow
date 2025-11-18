import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X, ChevronDown, ChevronUp, Calendar, FileText, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface Outbound {
  id: string;
  date: string;
  destination: string;
  product: string;
  quantity: number;
  status: '출고대기' | '출고완료' | '배송중';
  customer: string;
  unitPrice: number;
  items?: { name: string; quantity: number }[];
}

const OutboundManagement = () => {
  const { toast } = useToast();
  const [outbounds] = useState<Outbound[]>([
    { id: 'O-001', date: '2024-12-18 10:30', destination: '서울시 강남구', product: '노트북 A1', quantity: 5, status: '출고완료', customer: '스마트마켓', unitPrice: 550000 },
    { id: 'O-002', date: '2024-12-18 14:20', destination: '부산시 해운대구', product: '스마트폰 X2', quantity: 10, status: '출고대기', customer: '테크스토어', unitPrice: 890000 },
    { id: 'O-003', date: '2024-11-25 09:15', destination: '대구시 수성구', product: '태블릿 T3', quantity: 8, status: '배송중', customer: '디지털플러스', unitPrice: 420000 },
    { id: 'O-004', date: '2024-11-20 16:45', destination: '인천시 남동구', product: '모니터 M4', quantity: 12, status: '출고완료', customer: 'IT마켓', unitPrice: 280000 },
    { id: 'O-005', date: '2024-10-30 11:00', destination: '광주시 서구', product: '키보드 K5', quantity: 25, status: '출고완료', customer: '오피스월드', unitPrice: 65000 },
    { id: 'O-006', date: '2024-10-15 13:30', destination: '대전시 유성구', product: '마우스 M6', quantity: 30, status: '출고완료', customer: '컴퓨터랜드', unitPrice: 45000 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCount, setShowCount] = useState(5);
  const [selectedOutbound, setSelectedOutbound] = useState<Outbound | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedOutbounds, setSelectedOutbounds] = useState<string[]>([]);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const toggleSelectAll = () => {
    if (selectedOutbounds.length === filteredAndSortedOutbounds.slice(0, showCount).length) {
      setSelectedOutbounds([]);
    } else {
      setSelectedOutbounds(filteredAndSortedOutbounds.slice(0, showCount).map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedOutbounds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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
    const ws = XLSX.utils.json_to_sheet(outbounds);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "출고관리");
    XLSX.writeFile(wb, "출고관리_데이터.xlsx");
  };

  const availableYears = Array.from(new Set(outbounds.map(o => new Date(o.date).getFullYear()))).sort((a, b) => b - a);
  const availableMonths = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const filteredAndSortedOutbounds = outbounds
    .filter(outbound => {
      const matchesSearch = outbound.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          outbound.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          outbound.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          outbound.customer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const outboundDate = new Date(outbound.date);
      const matchesYear = yearFilter === "all" || outboundDate.getFullYear().toString() === yearFilter;
      const matchesMonth = monthFilter === "all" || (outboundDate.getMonth() + 1).toString() === monthFilter;
      const matchesStatus = statusFilter === "all" || outbound.status === statusFilter;
      
      return matchesSearch && matchesYear && matchesMonth && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const displayedOutbounds = filteredAndSortedOutbounds.slice(0, showCount);

  const showDetail = (outbound: Outbound) => {
    setSelectedOutbound(outbound);
    setShowDetailDialog(true);
  };

  // 월별 출고 통계
  const monthlyData = outbounds.reduce((acc, outbound) => {
    const date = new Date(outbound.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, 출고수량: 0, 출고금액: 0 };
    }
    
    acc[monthKey].출고수량 += outbound.quantity;
    acc[monthKey].출고금액 += outbound.quantity * outbound.unitPrice;
    
    return acc;
  }, {} as Record<string, { month: string; 출고수량: number; 출고금액: number }>);

  const chartData = Object.values(monthlyData)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 12)
    .reverse();

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case '출고완료':
        return 'default';
      case '배송중':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleIssueInvoice = (outbound: Outbound) => {
    setSelectedOutbound(outbound);
    setIsInvoiceDialogOpen(true);
  };

  const confirmIssueInvoice = () => {
    if (!selectedOutbound) return;
    
    toast({
      title: "청구서 발행 완료",
      description: `${selectedOutbound.customer}에게 청구서가 발행되었습니다.`,
    });
    
    setIsInvoiceDialogOpen(false);
    setSelectedOutbound(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">출고관리</h1>
          <p className="text-muted-foreground">제품 출고 내역을 관리합니다</p>
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

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">출고 내역</TabsTrigger>
          <TabsTrigger value="chart">
            <BarChart3 className="h-4 w-4 mr-2" />
            통계 차트
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>출고 내역</CardTitle>
              <CardDescription>최신순으로 출고 내역을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="출고지, 제품명, 출고번호, 고객명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="년도" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 년도</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="월" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 월</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>{month}월</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="출고대기">출고대기</SelectItem>
                    <SelectItem value="출고완료">출고완료</SelectItem>
                    <SelectItem value="배송중">배송중</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={toggleSortOrder} className="gap-2">
                  {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  {sortOrder === 'desc' ? '최신순' : '오래된순'}
                </Button>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>출고번호</TableHead>
                      <TableHead>출고일시</TableHead>
                      <TableHead>고객명</TableHead>
                      <TableHead>출고지</TableHead>
                      <TableHead>제품명</TableHead>
                      <TableHead>수량</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-center">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedOutbounds.length > 0 ? (
                      displayedOutbounds.map((outbound) => (
                        <TableRow key={outbound.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono font-semibold">{outbound.id}</TableCell>
                          <TableCell>{outbound.date}</TableCell>
                          <TableCell className="font-semibold">{outbound.customer}</TableCell>
                          <TableCell>{outbound.destination}</TableCell>
                          <TableCell>{outbound.product}</TableCell>
                          <TableCell>{outbound.quantity.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">
                            ₩{(outbound.quantity * outbound.unitPrice).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(outbound.status)}>
                              {outbound.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleIssueInvoice(outbound)}
                              className="gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              청구서 발행
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          검색 결과가 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredAndSortedOutbounds.length > showCount && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCount(prev => prev + 10)}
                    className="gap-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                    더보기 ({filteredAndSortedOutbounds.length - showCount}개 남음)
                  </Button>
                </div>
              )}

              {showCount > 5 && (
                <div className="mt-2 text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowCount(5)}
                    className="gap-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                    접기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>월별 출고 통계</CardTitle>
              <CardDescription>최근 12개월 출고 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-4">출고 수량 추이</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="출고수량" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="출고 수량"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4">출고 금액 추이</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `₩${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="출고금액" fill="hsl(var(--primary))" name="출고 금액" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">총 출고 수량</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {outbounds.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()}개
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">총 출고 금액</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      ₩{outbounds.reduce((sum, o) => sum + (o.quantity * o.unitPrice), 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">평균 출고액</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">
                      ₩{Math.round(outbounds.reduce((sum, o) => sum + (o.quantity * o.unitPrice), 0) / outbounds.length).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>출고 세부내역</DialogTitle>
          </DialogHeader>
          {selectedOutbound && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">출고번호</label>
                  <div className="text-lg font-semibold">{selectedOutbound.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">출고일시</label>
                  <div className="text-lg">{selectedOutbound.date}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">고객명</label>
                  <div className="text-lg">{selectedOutbound.customer}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">목적지</label>
                  <div className="text-lg">{selectedOutbound.destination}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">제품명</label>
                  <div className="text-lg font-semibold">{selectedOutbound.product}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">수량</label>
                  <div className="text-lg">{selectedOutbound.quantity.toLocaleString()}개</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">상태</label>
                  <div className="mt-1">
                    <Badge variant={
                      selectedOutbound.status === '출고완료' ? 'default' : 
                      selectedOutbound.status === '배송중' ? 'secondary' : 'outline'
                    }>
                      {selectedOutbound.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 청구서 발행 다이얼로그 */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>청구서 발행</DialogTitle>
            <DialogDescription>
              출고 건에 대한 청구서를 발행하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          
          {selectedOutbound && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">출고번호</p>
                  <p className="font-semibold">{selectedOutbound.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">고객명</p>
                  <p className="font-semibold">{selectedOutbound.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">제품명</p>
                  <p className="font-semibold">{selectedOutbound.product}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">수량</p>
                  <p className="font-semibold">{selectedOutbound.quantity.toLocaleString()}개</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">총 청구 금액</p>
                <p className="text-2xl font-bold">
                  ₩{(selectedOutbound.quantity * selectedOutbound.unitPrice).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={confirmIssueInvoice}>
              청구서 발행
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutboundManagement;
