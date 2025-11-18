import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, FileDown, Trash2, Plus, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { SwipeableTableRow } from "@/components/SwipeableTableRow";
import { CommonFilters } from "@/components/CommonFilters";

interface Purchase {
  id: string;
  date: string;
  vendor: string;
  product: string;
  quantity: number;
  price: number;
  type: '제조사' | '반품';
  status: string;
  salesPerson?: string;
}

const PurchaseManagement = () => {
  const { toast } = useToast();
  const [purchases] = useState<Purchase[]>([
    { id: 'P-001', date: '2024-12-15 14:30', vendor: '(주)글로벌물류', product: '노트북 A1', quantity: 50, price: 25000000, type: '제조사', status: '완료', salesPerson: '김영업' },
    { id: 'P-002', date: '2024-12-16 09:15', vendor: '스마트전자', product: '스마트폰 X2', quantity: 10, price: 8000000, type: '반품', status: '처리중', salesPerson: '이영업' },
    { id: 'P-003', date: '2024-11-20 11:45', vendor: '(주)테크솔루션', product: '태블릿 T3', quantity: 30, price: 15000000, type: '제조사', status: '완료', salesPerson: '김영업' },
    { id: 'P-004', date: '2024-11-18 16:20', vendor: '디지털마켓', product: '모니터 M4', quantity: 5, price: 3500000, type: '반품', status: '완료', salesPerson: '박영업' },
    { id: 'P-005', date: '2024-10-25 10:00', vendor: '(주)글로벌물류', product: '키보드 K5', quantity: 100, price: 5000000, type: '제조사', status: '완료', salesPerson: '이영업' },
    { id: 'P-006', date: '2024-10-12 13:30', vendor: '스마트전자', product: '마우스 M6', quantity: 80, price: 3200000, type: '제조사', status: '완료', salesPerson: '김영업' },
    { id: 'P-007', date: '2023-12-28 15:45', vendor: '(주)테크솔루션', product: 'USB 드라이브', quantity: 200, price: 4000000, type: '제조사', status: '완료', salesPerson: '박영업' },
    { id: 'P-008', date: '2023-11-15 09:20', vendor: '디지털마켓', product: '헤드셋', quantity: 15, price: 2250000, type: '반품', status: '완료', salesPerson: '이영업' },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [salesPersonFilter, setSalesPersonFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCount, setShowCount] = useState(5);
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'individual' | 'excel'>('individual');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });

  const toggleSelectAll = () => {
    if (selectedPurchases.length === displayedPurchases.length) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(displayedPurchases.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPurchases(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (newStatus: string) => {
    toast({
      title: "일괄 상태 변경",
      description: `${selectedPurchases.length}개 항목의 상태가 변경되었습니다.`
    });
    setSelectedPurchases([]);
  };

  const handleBulkDelete = () => {
    toast({
      title: "일괄 삭제",
      description: `${selectedPurchases.length}개 항목이 삭제되었습니다.`
    });
    setSelectedPurchases([]);
  };

  const handleBulkExport = () => {
    const selectedData = purchases.filter(p => selectedPurchases.includes(p.id));
    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "선택된매입");
    XLSX.writeFile(wb, "선택된_매입_데이터.xlsx");
    
    toast({
      title: "엑셀 내보내기",
      description: `${selectedPurchases.length}개 항목이 내보내기되었습니다.`
    });
  };

  const confirmPurchase = (purchaseId: string) => {
    const updatedPurchases = purchases.map(p => 
      p.id === purchaseId ? { ...p, status: '완료' } : p
    );
    toast({
      title: "매입 확인 완료",
      description: "매입 상태가 완료로 변경되었습니다."
    });
    setShowDetailDialog(false);
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

  const handleExcelDownload = (filtered: boolean = false) => {
    const dataToExport = filtered ? filteredAndSortedPurchases : purchases;
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "매입관리");
    XLSX.writeFile(wb, `매입관리_${filtered ? '필터링' : '전체'}_데이터.xlsx`);
  };

  const handleCSVDownload = (filtered: boolean = false) => {
    const dataToExport = filtered ? filteredAndSortedPurchases : purchases;
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `매입관리_${filtered ? '필터링' : '전체'}_데이터.csv`;
    link.click();
  };

  const handlePDFDownload = (filtered: boolean = false) => {
    const dataToExport = filtered ? filteredAndSortedPurchases : purchases;
    const doc = new jsPDF();
    doc.text("매입 관리", 20, 20);
    let y = 40;
    dataToExport.forEach((purchase) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${purchase.id} - ${purchase.product}: ${purchase.quantity} (₩${purchase.price.toLocaleString()})`, 20, y);
      y += 10;
    });
    doc.save(`매입관리_${filtered ? '필터링' : '전체'}_데이터.pdf`);
  };

  const availableYears = Array.from(new Set(purchases.map(p => new Date(p.date).getFullYear()))).sort((a, b) => b - a);
  const availableMonths = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const salesPersons = Array.from(new Set(purchases.map(p => p.salesPerson).filter(Boolean))) as string[];
  const vendors = Array.from(new Set(purchases.map(p => p.vendor)));

  const filteredAndSortedPurchases = purchases
    .filter(purchase => {
      const matchesSearch = purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          purchase.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          purchase.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const purchaseDate = new Date(purchase.date);
      const matchesYear = yearFilter === "all" || purchaseDate.getFullYear().toString() === yearFilter;
      const matchesMonth = monthFilter === "all" || (purchaseDate.getMonth() + 1).toString() === monthFilter;
      const matchesType = typeFilter === "all" || purchase.type === typeFilter;
      const matchesSalesPerson = salesPersonFilter === "all" || purchase.salesPerson === salesPersonFilter;
      const matchesVendor = vendorFilter === "all" || purchase.vendor === vendorFilter;
      
      return matchesSearch && matchesYear && matchesMonth && matchesType && matchesSalesPerson && matchesVendor;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const displayedPurchases = filteredAndSortedPurchases.slice(0, showCount);

  const showDetail = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailDialog(true);
  };

  // 월별 매입 통계
  const monthlyData = purchases.reduce((acc, purchase) => {
    const date = new Date(purchase.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, 제조사: 0, 반품: 0, 총액: 0 };
    }
    
    if (purchase.type === '제조사') {
      acc[monthKey].제조사 += purchase.price;
    } else {
      acc[monthKey].반품 += purchase.price;
    }
    acc[monthKey].총액 += purchase.price;
    
    return acc;
  }, {} as Record<string, { month: string; 제조사: number; 반품: number; 총액: number }>);

  const chartData = Object.values(monthlyData)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 12)
    .reverse();

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">매입 관리</h1>
          <div className="flex gap-2">
            <Button onClick={() => {/* 매입 등록 로직 */}} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              매입 등록
            </Button>
            <Button onClick={() => handleExcelDownload(false)} size="lg" variant="outline" className="gap-2">
              <FileDown className="w-4 h-4" />
              Excel (전체)
            </Button>
            <Button onClick={() => handleExcelDownload(true)} size="lg" variant="outline" className="gap-2">
              <FileDown className="w-4 h-4" />
              Excel (필터링)
            </Button>
            <Button onClick={() => handleCSVDownload(false)} size="lg" variant="secondary" className="gap-2">
              <FileDown className="w-4 h-4" />
              CSV (전체)
            </Button>
            <Button onClick={() => handleCSVDownload(true)} size="lg" variant="secondary" className="gap-2">
              <FileDown className="w-4 h-4" />
              CSV (필터링)
            </Button>
            <Button onClick={() => handlePDFDownload(false)} size="lg" className="gap-2">
              <FileDown className="w-4 h-4" />
              PDF (전체)
            </Button>
            <Button onClick={() => handlePDFDownload(true)} size="lg" className="gap-2">
              <FileDown className="w-4 h-4" />
              PDF (필터링)
            </Button>
          </div>
        </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">매입 내역</TabsTrigger>
          <TabsTrigger value="chart">통계 차트</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>매입 내역</CardTitle>
              <CardDescription>최신순으로 매입 내역을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <DateRangeFilter 
                  onDateRangeChange={(range) => setDateRange(range)}
                  storageKey="purchase-date-range"
                />
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="매입처, 제품명, 매입번호로 검색..."
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

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 유형</SelectItem>
                    <SelectItem value="제조사">제조사</SelectItem>
                    <SelectItem value="반품">반품</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={salesPersonFilter} onValueChange={setSalesPersonFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="영업사원" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 영업사원</SelectItem>
                    {salesPersons.map(person => (
                      <SelectItem key={person} value={person}>{person}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="매입처" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 매입처</SelectItem>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                  <Button variant="outline" onClick={toggleSortOrder} className="gap-2">
                    {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    {sortOrder === 'desc' ? '최신순' : '오래된순'}
                  </Button>
                </div>
              </div>

              {selectedPurchases.length > 0 && (
                <div className="bg-muted p-4 rounded-lg mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedPurchases.length}개 항목 선택됨</span>
                  <div className="flex gap-2">
                    <Select onValueChange={handleBulkStatusChange}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="상태 변경" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="완료">완료</SelectItem>
                        <SelectItem value="처리중">처리중</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleBulkExport}>
                      <FileDown className="w-4 h-4 mr-2" />
                      내보내기
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      <Trash2 className="w-4 w-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPurchases.length === displayedPurchases.length && displayedPurchases.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-base whitespace-nowrap">매입번호</TableHead>
                      <TableHead className="text-base whitespace-nowrap">매입일시</TableHead>
                      <TableHead className="text-base whitespace-nowrap">매입처</TableHead>
                      <TableHead className="text-base whitespace-nowrap">제품명</TableHead>
                      <TableHead className="text-base whitespace-nowrap">수량</TableHead>
                      <TableHead className="text-base whitespace-nowrap">금액</TableHead>
                      <TableHead className="text-base whitespace-nowrap">유형</TableHead>
                      <TableHead className="text-base whitespace-nowrap">영업사원</TableHead>
                      <TableHead className="text-base whitespace-nowrap">상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedPurchases.length > 0 ? (
                      displayedPurchases.map((purchase) => (
                        <TableRow key={purchase.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedPurchases.includes(purchase.id)}
                              onCheckedChange={() => toggleSelect(purchase.id)}
                            />
                          </TableCell>
                          <TableCell 
                            className="font-mono font-semibold text-base cursor-pointer text-primary hover:underline"
                            onClick={() => showDetail(purchase)}
                          >
                            {purchase.id}
                          </TableCell>
                          <TableCell className="text-base">{purchase.date}</TableCell>
                          <TableCell className="text-base">{purchase.vendor}</TableCell>
                          <TableCell className="font-semibold text-base">{purchase.product}</TableCell>
                          <TableCell className="text-base">{purchase.quantity.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold text-base">₩{purchase.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={purchase.type === '제조사' ? 'default' : 'secondary'}>
                              {purchase.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-base">
                            <Badge variant="outline">{purchase.salesPerson || '-'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={purchase.status === '완료' ? 'default' : 'outline'}>
                              {purchase.status}
                            </Badge>
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

              {filteredAndSortedPurchases.length > showCount && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCount(prev => prev + 10)}
                    className="gap-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                    더보기 ({filteredAndSortedPurchases.length - showCount}개 남음)
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
              <CardTitle>월별 매입 통계</CardTitle>
              <CardDescription>최근 12개월 매입 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `₩${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="제조사" fill="hsl(var(--primary))" name="제조사 매입" />
                  <Bar dataKey="반품" fill="hsl(var(--destructive))" name="반품" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">총 매입액</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₩{purchases.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">제조사 매입</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      ₩{purchases.filter(p => p.type === '제조사').reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">반품액</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      ₩{purchases.filter(p => p.type === '반품').reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Purchase Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>매입 세부내역</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">매입번호</label>
                  <div className="text-lg font-semibold">{selectedPurchase.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">매입일시</label>
                  <div className="text-lg">{selectedPurchase.date}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">매입처</label>
                  <div className="text-lg">{selectedPurchase.vendor}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">제품명</label>
                  <div className="text-lg font-semibold">{selectedPurchase.product}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">수량</label>
                  <div className="text-lg">{selectedPurchase.quantity.toLocaleString()}개</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">금액</label>
                  <div className="text-lg font-semibold">₩{selectedPurchase.price.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">유형</label>
                  <div className="mt-1">
                    <Badge variant={selectedPurchase.type === '제조사' ? 'default' : 'secondary'}>
                      {selectedPurchase.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">영업사원</label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedPurchase.salesPerson || '-'}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">상태</label>
                  <div className="mt-1">
                    <Badge variant={selectedPurchase.status === '완료' ? 'default' : 'outline'}>
                      {selectedPurchase.status}
                    </Badge>
                  </div>
                </div>
              </div>
              {selectedPurchase.status !== '완료' && (
                <DialogFooter className="mt-6">
                  <Button 
                    onClick={() => confirmPurchase(selectedPurchase.id)}
                    className="w-full"
                  >
                    매입 확인
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseManagement;
