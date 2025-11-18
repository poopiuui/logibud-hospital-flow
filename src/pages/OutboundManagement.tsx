import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X, ChevronDown, ChevronUp, Calendar, BarChart3, Plus, Upload, FileSpreadsheet, Download, FileDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface Outbound {
  id: string;
  date: string;
  destination: string;
  product: string;
  quantity: number;
  status: '주문확인중' | '출고대기' | '출고완료' | '배송중';
  customer: string;
  unitPrice: number;
  items?: { name: string; quantity: number; unitPrice: number }[];
}

const OutboundManagement = () => {
  const { toast } = useToast();
  const [outbounds] = useState<Outbound[]>([
    { id: 'O-001', date: '2024-12-18 10:30', destination: '서울시 강남구', product: '노트북 A1', quantity: 5, status: '출고완료', customer: '스마트마켓', unitPrice: 550000, items: [{ name: '노트북 A1', quantity: 5, unitPrice: 550000 }] },
    { id: 'O-002', date: '2024-12-18 14:20', destination: '부산시 해운대구', product: '스마트폰 X2', quantity: 10, status: '주문확인중', customer: '테크스토어', unitPrice: 890000, items: [{ name: '스마트폰 X2', quantity: 10, unitPrice: 890000 }] },
    { id: 'O-003', date: '2024-11-25 09:15', destination: '대구시 수성구', product: '태블릿 T3', quantity: 8, status: '배송중', customer: '디지털플러스', unitPrice: 420000, items: [{ name: '태블릿 T3', quantity: 8, unitPrice: 420000 }] },
    { id: 'O-004', date: '2024-11-20 16:45', destination: '인천시 남동구', product: '모니터 M4', quantity: 12, status: '출고완료', customer: 'IT마켓', unitPrice: 280000, items: [{ name: '모니터 M4', quantity: 12, unitPrice: 280000 }] },
    { id: 'O-005', date: '2024-10-30 11:00', destination: '광주시 서구', product: '키보드 K5', quantity: 25, status: '출고완료', customer: '오피스월드', unitPrice: 65000, items: [{ name: '키보드 K5', quantity: 25, unitPrice: 65000 }] },
    { id: 'O-006', date: '2024-10-15 13:30', destination: '대전시 유성구', product: '마우스 M6', quantity: 30, status: '출고완료', customer: '컴퓨터랜드', unitPrice: 45000, items: [{ name: '마우스 M6', quantity: 30, unitPrice: 45000 }] },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCount, setShowCount] = useState(5);
  const [selectedOutbound, setSelectedOutbound] = useState<Outbound | null>(null);
  const [selectedOutbounds, setSelectedOutbounds] = useState<string[]>([]);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'individual' | 'excel'>('individual');

  const filteredAndSortedOutbounds = outbounds
    .filter(outbound => {
      const matchesSearch = searchTerm === "" || 
        outbound.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outbound.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outbound.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outbound.customer.toLowerCase().includes(searchTerm.toLowerCase());

      const outboundYear = new Date(outbound.date).getFullYear().toString();
      const outboundMonth = (new Date(outbound.date).getMonth() + 1).toString();
      
      const matchesYear = yearFilter === "all" || outboundYear === yearFilter;
      const matchesMonth = monthFilter === "all" || outboundMonth === monthFilter;
      const matchesStatus = statusFilter === "all" || outbound.status === statusFilter;

      return matchesSearch && matchesYear && matchesMonth && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const displayedOutbounds = filteredAndSortedOutbounds.slice(0, showCount);

  const availableYears = Array.from(new Set(outbounds.map(o => new Date(o.date).getFullYear()))).sort((a, b) => b - a);
  const availableMonths = Array.from(new Set(outbounds.map(o => (new Date(o.date).getMonth() + 1).toString()))).sort((a, b) => parseInt(a) - parseInt(b));

  const monthlyData = outbounds.reduce((acc, outbound) => {
    const month = new Date(outbound.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
    if (!acc[month]) acc[month] = { month, quantity: 0, amount: 0 };
    acc[month].quantity += outbound.quantity;
    acc[month].amount += outbound.unitPrice * outbound.quantity;
    return acc;
  }, {} as Record<string, { month: string; quantity: number; amount: number }>);

  const chartData = Object.values(monthlyData).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()).slice(0, 12).reverse();

  const getStatusVariant = (status: string) => {
    switch(status) {
      case '주문확인중': return 'secondary';
      case '출고대기': return 'outline';
      case '출고완료': return 'default';
      case '배송중': return 'outline';
      default: return 'default';
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      toast({ title: "엑셀 업로드 성공", description: `${data.length}개의 출고 데이터가 등록되었습니다.` });
      setShowRegistrationDialog(false);
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') window.history.back(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">출고관리</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowRegistrationDialog(true)}><Plus className="mr-2 h-4 w-4" />출고 등록</Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                다운로드
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { const ws = XLSX.utils.json_to_sheet(outbounds); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "출고관리"); XLSX.writeFile(wb, "출고관리_데이터.csv"); }}>
                <FileDown className="mr-2 h-4 w-4" />
                CSV로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const ws = XLSX.utils.json_to_sheet(outbounds); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "출고관리"); XLSX.writeFile(wb, "출고관리_데이터.xlsx"); }}>
                <FileDown className="mr-2 h-4 w-4" />
                Excel로 다운로드
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" onClick={() => window.history.back()}><X className="mr-2 h-4 w-4" />뒤로</Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">출고 내역</TabsTrigger>
          <TabsTrigger value="chart"><BarChart3 className="h-4 w-4 mr-2" />통계 차트</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle>출고 내역</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}><SelectTrigger className="w-[140px]"><Calendar className="h-4 w-4 mr-2" /><SelectValue placeholder="년도" /></SelectTrigger><SelectContent><SelectItem value="all">전체 년도</SelectItem>{availableYears.map(year => <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>)}</SelectContent></Select>
                <Select value={monthFilter} onValueChange={setMonthFilter}><SelectTrigger className="w-[120px]"><SelectValue placeholder="월" /></SelectTrigger><SelectContent><SelectItem value="all">전체 월</SelectItem>{availableMonths.map(month => <SelectItem key={month} value={month}>{month}월</SelectItem>)}</SelectContent></Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="상태" /></SelectTrigger><SelectContent><SelectItem value="all">전체</SelectItem><SelectItem value="주문확인중">주문확인중</SelectItem><SelectItem value="출고대기">출고대기</SelectItem><SelectItem value="출고완료">출고완료</SelectItem><SelectItem value="배송중">배송중</SelectItem></SelectContent></Select>
                <Button variant="outline" onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>{sortOrder === 'desc' ? <><ChevronDown className="h-4 w-4 mr-2" />최신순</> : <><ChevronUp className="h-4 w-4 mr-2" />오래된순</>}</Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"><Checkbox checked={selectedOutbounds.length === displayedOutbounds.length && displayedOutbounds.length > 0} onCheckedChange={() => setSelectedOutbounds(selectedOutbounds.length === displayedOutbounds.length ? [] : displayedOutbounds.map(o => o.id))} /></TableHead>
                      <TableHead className="whitespace-nowrap">출고번호</TableHead>
                      <TableHead className="whitespace-nowrap">출고일시</TableHead>
                      <TableHead className="whitespace-nowrap">배송지</TableHead>
                      <TableHead className="whitespace-nowrap">제품명</TableHead>
                      <TableHead className="whitespace-nowrap">수량</TableHead>
                      <TableHead className="whitespace-nowrap">상태</TableHead>
                      <TableHead className="whitespace-nowrap">고객사</TableHead>
                      <TableHead className="whitespace-nowrap">금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedOutbounds.map((outbound) => (
                      <TableRow key={outbound.id}>
                        <TableCell><Checkbox checked={selectedOutbounds.includes(outbound.id)} onCheckedChange={() => setSelectedOutbounds(prev => prev.includes(outbound.id) ? prev.filter(i => i !== outbound.id) : [...prev, outbound.id])} /></TableCell>
                        <TableCell className="font-medium text-primary cursor-pointer hover:underline" onClick={() => { setSelectedOutbound(outbound); setShowDetailDialog(true); }}>{outbound.id}</TableCell>
                        <TableCell>{outbound.date}</TableCell>
                        <TableCell>{outbound.destination}</TableCell>
                        <TableCell>{outbound.product}</TableCell>
                        <TableCell>{outbound.quantity.toLocaleString()}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(outbound.status)}>{outbound.status}</Badge></TableCell>
                        <TableCell>{outbound.customer}</TableCell>
                        <TableCell>{(outbound.unitPrice * outbound.quantity).toLocaleString()}원</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                {filteredAndSortedOutbounds.length > showCount && <Button onClick={() => setShowCount(prev => prev + 5)} variant="outline">더보기 ({filteredAndSortedOutbounds.length - showCount}개 남음)</Button>}
                {showCount > 5 && <Button onClick={() => setShowCount(5)} variant="outline">접기</Button>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-4 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">월별 출고량</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantity" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">월별 출고액</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                <Legend />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>출고 세부내역</DialogTitle></DialogHeader>
          {selectedOutbound && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">출고번호</p><p className="font-medium text-lg">{selectedOutbound.id}</p></div>
                <div><p className="text-sm text-muted-foreground">출고일시</p><p className="font-medium text-lg">{selectedOutbound.date}</p></div>
                <div><p className="text-sm text-muted-foreground">고객사</p><p className="font-medium text-lg">{selectedOutbound.customer}</p></div>
                <div><p className="text-sm text-muted-foreground">배송지</p><p className="font-medium text-lg">{selectedOutbound.destination}</p></div>
                <div><p className="text-sm text-muted-foreground">상태</p><Badge variant={getStatusVariant(selectedOutbound.status)}>{selectedOutbound.status}</Badge></div>
              </div>
              <div className="border rounded-lg mt-6">
                <div className="bg-muted p-3"><h3 className="font-semibold text-lg">상품 상세내역</h3></div>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="whitespace-nowrap">상품명</TableHead>
                    <TableHead className="whitespace-nowrap text-right">상품단가</TableHead>
                    <TableHead className="whitespace-nowrap text-right">판매수량</TableHead>
                    <TableHead className="whitespace-nowrap text-right">합계금액</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>{selectedOutbound.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.unitPrice.toLocaleString()}원</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{item.quantity.toLocaleString()}개</TableCell>
                      <TableCell className="text-right font-bold text-lg">{(item.unitPrice * item.quantity).toLocaleString()}원</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">총 출고 금액</p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedOutbound.items?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setShowDetailDialog(false)}>닫기</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>출고 등록</DialogTitle></DialogHeader>
          <Tabs value={registrationMode} onValueChange={(v) => setRegistrationMode(v as 'individual' | 'excel')}>
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="individual">개별 등록</TabsTrigger><TabsTrigger value="excel">Excel 일괄 등록</TabsTrigger></TabsList>
            <TabsContent value="individual" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4"><div><Label>출고일시</Label><Input type="datetime-local" /></div><div><Label>고객사</Label><Input placeholder="고객사명 입력" /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>제품명</Label><Input placeholder="제품명 입력" /></div><div><Label>수량</Label><Input type="number" placeholder="수량 입력" /></div></div>
                <div><Label>배송지</Label><Input placeholder="배송지 주소 입력" /></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>단가</Label><Input type="number" placeholder="단가 입력" /></div><div><Label>상태</Label><Select><SelectTrigger><SelectValue placeholder="상태 선택" /></SelectTrigger><SelectContent><SelectItem value="주문확인중">주문확인중</SelectItem><SelectItem value="출고대기">출고대기</SelectItem><SelectItem value="출고완료">출고완료</SelectItem><SelectItem value="배송중">배송중</SelectItem></SelectContent></Select></div></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setShowRegistrationDialog(false)}>취소</Button><Button onClick={() => { toast({ title: "출고 등록 완료" }); setShowRegistrationDialog(false); }}>등록</Button></DialogFooter>
            </TabsContent>
            <TabsContent value="excel" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center"><Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p className="text-sm text-muted-foreground mb-4">Excel 파일을 업로드하여 일괄 등록하세요</p><Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="max-w-xs mx-auto" /></div>
              <DialogFooter><Button variant="outline" onClick={() => setShowRegistrationDialog(false)}>닫기</Button></DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutboundManagement;
