import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Printer, Download } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { SwipeableTableRow } from "@/components/SwipeableTableRow";
import * as XLSX from "xlsx";

interface Quotation {
  quotationNumber: string;
  quotationDate: string;
  customer: string;
  totalAmount: number;
  status: '발행' | '승인' | '만료';
  validUntil: string;
  items: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function QuotationManagement() {
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      quotationNumber: 'QT-2024-001',
      quotationDate: '2024-11-10',
      customer: '서울병원',
      totalAmount: 2800000,
      status: '승인',
      validUntil: '2024-12-10',
      items: [
        { productCode: 'A-001', productName: '주사기(5ml)', quantity: 2000, unitPrice: 150 },
        { productCode: 'B-012', productName: '거즈 패드', quantity: 3000, unitPrice: 80 }
      ]
    },
    {
      quotationNumber: 'QT-2024-002',
      quotationDate: '2024-11-15',
      customer: '부산의료원',
      totalAmount: 1500000,
      status: '발행',
      validUntil: '2024-12-15',
      items: [
        { productCode: 'C-045', productName: '일회용 장갑(M)', quantity: 10000, unitPrice: 50 }
      ]
    },
    {
      quotationNumber: 'QT-2024-003',
      quotationDate: '2024-10-20',
      customer: '대전병원',
      totalAmount: 800000,
      status: '만료',
      validUntil: '2024-11-20',
      items: [
        { productCode: 'D-089', productName: '체온계', quantity: 200, unitPrice: 3200 }
      ]
    }
  ]);

  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>(quotations);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedQuotation, setEditedQuotation] = useState<Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const openDetail = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setEditedQuotation({ ...quotation });
    setIsDetailOpen(true);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!editedQuotation) return;

    const updated = quotations.map(quot =>
      quot.quotationNumber === editedQuotation.quotationNumber ? editedQuotation : quot
    );
    setQuotations(updated);
    applyFilters(updated, searchTerm, statusFilter);
    
    toast({
      title: "견적서 수정",
      description: `${editedQuotation.quotationNumber} 견적서가 수정되었습니다.`
    });
    
    setIsEditMode(false);
    setSelectedQuotation(editedQuotation);
  };

  const handleStatusChange = (newStatus: '발행' | '승인' | '만료') => {
    if (!editedQuotation) return;
    setEditedQuotation({ ...editedQuotation, status: newStatus });
  };

  const handlePrint = (quotation: Quotation) => {
    toast({
      title: "견적서 인쇄",
      description: `${quotation.quotationNumber} 견적서를 인쇄합니다.`
    });
  };

  const handleDownload = (quotation: Quotation) => {
    toast({
      title: "견적서 다운로드",
      description: `${quotation.quotationNumber} 견적서를 다운로드합니다.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '승인': return 'default';
      case '발행': return 'secondary';
      case '만료': return 'outline';
      default: return 'outline';
    }
  };

  const calculateVAT = (amount: number) => {
    return Math.round(amount * 0.1);
  };

  const handleDateRangeChange = (range: DateRange) => {
    let filtered = [...quotations];
    
    if (range.from && range.to) {
      filtered = filtered.filter(quot => {
        const quotDate = new Date(quot.quotationDate);
        return quotDate >= range.from! && quotDate <= range.to!;
      });
    }
    
    applyFilters(filtered, searchTerm, statusFilter);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(quotations, term, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(quotations, searchTerm, status);
  };

  const applyFilters = (data: Quotation[], search: string, status: string) => {
    let filtered = [...data];
    
    if (search) {
      filtered = filtered.filter(quot =>
        quot.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
        quot.customer.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter(quot => quot.status === status);
    }
    
    setFilteredQuotations(filtered);
  };

  const handleExportExcel = () => {
    const exportData = filteredQuotations.flatMap(quot =>
      quot.items.map(item => ({
        '견적번호': quot.quotationNumber,
        '견적일자': quot.quotationDate,
        '고객명': quot.customer,
        '유효기한': quot.validUntil,
        '상태': quot.status,
        '품목코드': item.productCode,
        '품목명': item.productName,
        '수량': item.quantity,
        '단가': item.unitPrice,
        '금액': item.quantity * item.unitPrice,
        '총 견적금액': quot.totalAmount,
        'VAT': calculateVAT(quot.totalAmount),
        '총액(VAT포함)': quot.totalAmount + calculateVAT(quot.totalAmount)
      }))
    );

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "견적서");
    XLSX.writeFile(wb, `견적서관리_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "내보내기 완료",
      description: `${filteredQuotations.length}개 견적서를 엑셀로 내보냈습니다.`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">견적서 관리</h1>
              <p className="text-muted-foreground mt-1">견적서를 조회하고 관리합니다</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    견적서 목록
                  </CardTitle>
                  <CardDescription className="mt-2">
                    총 {filteredQuotations.length}건의 견적서
                  </CardDescription>
                </div>
                <Button onClick={handleExportExcel} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  엑셀 내보내기
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <DateRangeFilter
                  onDateRangeChange={handleDateRangeChange}
                  storageKey="quotationDateFilter"
                />
                <Input
                  placeholder="견적번호/고객명 검색..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="상태 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="발행">발행</SelectItem>
                    <SelectItem value="승인">승인</SelectItem>
                    <SelectItem value="만료">만료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">견적번호</TableHead>
                    <TableHead className="font-bold">견적일자</TableHead>
                    <TableHead className="font-bold">고객명</TableHead>
                    <TableHead className="font-bold">품목수</TableHead>
                    <TableHead className="font-bold">견적금액</TableHead>
                    <TableHead className="font-bold">유효기한</TableHead>
                    <TableHead className="font-bold">상태</TableHead>
                    <TableHead className="font-bold text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quotation) => (
                    <SwipeableTableRow
                      key={quotation.quotationNumber}
                      onEdit={() => openDetail(quotation)}
                    >
                      <TableCell 
                        className="font-mono font-semibold text-primary cursor-pointer hover:underline"
                        onClick={() => openDetail(quotation)}
                      >
                        {quotation.quotationNumber}
                      </TableCell>
                      <TableCell>{quotation.quotationDate}</TableCell>
                      <TableCell>{quotation.customer}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{quotation.items.length}개</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₩{quotation.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{quotation.validUntil}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(quotation.status)}>
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetail(quotation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrint(quotation)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(quotation)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </SwipeableTableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>견적서 상세 - {selectedQuotation?.quotationNumber}</DialogTitle>
          </DialogHeader>
          {editedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">견적일자</p>
                  {isEditMode ? (
                    <Input
                      type="date"
                      value={editedQuotation.quotationDate}
                      onChange={(e) => setEditedQuotation({ ...editedQuotation, quotationDate: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{editedQuotation.quotationDate}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">고객명</p>
                  {isEditMode ? (
                    <Input
                      value={editedQuotation.customer}
                      onChange={(e) => setEditedQuotation({ ...editedQuotation, customer: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{editedQuotation.customer}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">유효기한</p>
                  {isEditMode ? (
                    <Input
                      type="date"
                      value={editedQuotation.validUntil}
                      onChange={(e) => setEditedQuotation({ ...editedQuotation, validUntil: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{editedQuotation.validUntil}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  {isEditMode ? (
                    <Select value={editedQuotation.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="발행">발행</SelectItem>
                        <SelectItem value="승인">승인</SelectItem>
                        <SelectItem value="만료">만료</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusColor(editedQuotation.status)}>
                      {editedQuotation.status}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">견적 품목</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>품목코드</TableHead>
                        <TableHead>품목명</TableHead>
                        <TableHead>수량</TableHead>
                        <TableHead>단가</TableHead>
                        <TableHead>금액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedQuotation.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{item.productCode}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity.toLocaleString()}</TableCell>
                          <TableCell>₩{item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">
                            ₩{(item.quantity * item.unitPrice).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">소계</p>
                    <p className="font-semibold">₩{editedQuotation.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">VAT (10%)</p>
                    <p className="font-semibold">₩{calculateVAT(editedQuotation.totalAmount).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">총액</p>
                    <p className="font-bold text-lg">
                      ₩{(editedQuotation.totalAmount + calculateVAT(editedQuotation.totalAmount)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>취소</Button>
                <Button onClick={handleSaveEdit}>저장</Button>
              </>
            ) : (
              <Button onClick={handleEdit}>수정</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
