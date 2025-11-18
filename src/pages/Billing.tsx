import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { FileText, Download, Eye, CheckCircle2, Clock, X, FileDown, FilePlus, Filter, Trash2, ChevronDown, DollarSign, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { SwipeableTableRow } from "@/components/SwipeableTableRow";

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  invoiceIssued: boolean;
  issueDate?: string;
  items?: { name: string; quantity: number; price: number }[];
  paymentConfirmed: boolean;
  paymentDate?: string;
  paymentAmount?: number;
}

export default function Billing() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-001', customer: '고객 A', amount: 12500000, status: '완료', date: '2024-01-15', invoiceIssued: true, issueDate: '2024-01-16', items: [{ name: '주사기(5ml)', quantity: 100, price: 150 }], paymentConfirmed: true, paymentDate: '2024-01-17', paymentAmount: 12500000 },
    { id: 'INV-002', customer: '고객 B', amount: 8300000, status: '진행중', date: '2024-01-14', invoiceIssued: false, items: [{ name: '거즈 패드', quantity: 200, price: 80 }], paymentConfirmed: false },
    { id: 'INV-003', customer: '고객 C', amount: 15200000, status: '대기', date: '2024-01-13', invoiceIssued: false, items: [{ name: '일회용 장갑', quantity: 500, price: 50 }], paymentConfirmed: false },
    { id: 'INV-004', customer: '고객 D', amount: 5600000, status: '완료', date: '2024-01-12', invoiceIssued: true, issueDate: '2024-01-13', items: [{ name: '알코올 솜', quantity: 300, price: 30 }], paymentConfirmed: true, paymentDate: '2024-01-14', paymentAmount: 5600000 },
  ]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ customer: '', amount: '', date: '' });
  const [invoiceItems, setInvoiceItems] = useState<{ name: string; quantity: number; price: number }[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });
  
  // 상품 목록 (출고 단가)
  const products = [
    { name: '노트북 A1', shipmentPrice: 1400000, purchasePrice: 1250000 },
    { name: '스마트폰 X2', shipmentPrice: 900000, purchasePrice: 800000 },
    { name: '태블릿 T3', shipmentPrice: 600000, purchasePrice: 500000 },
    { name: '모니터 M4', shipmentPrice: 400000, purchasePrice: 350000 },
    { name: '키보드 K5', shipmentPrice: 80000, purchasePrice: 50000 },
    { name: '마우스 M6', shipmentPrice: 50000, purchasePrice: 32000 },
  ];
  
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({ invoiceId: '', paymentDate: '', paymentAmount: '' });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const invoiceDate = new Date(inv.date);
    const matchesDateRange = !dateRange.from || !dateRange.to || 
      (invoiceDate >= dateRange.from && invoiceDate <= dateRange.to);
    return matchesStatus && matchesDateRange;
  });

  const handleBulkIssueInvoices = () => {
    if (selectedInvoices.length === 0) {
      toast({
        title: "선택된 청구서 없음",
        description: "발행할 청구서를 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    const issueDate = new Date().toISOString().split('T')[0];
    setInvoices(invoices.map(inv => 
      selectedInvoices.includes(inv.id) && !inv.invoiceIssued
        ? { ...inv, invoiceIssued: true, issueDate }
        : inv
    ));

    toast({
      title: "일괄 청구서 발행 완료",
      description: `${selectedInvoices.length}개의 청구서가 발행되었습니다.`
    });
    setSelectedInvoices([]);
  };

  const handleBulkDelete = () => {
    if (selectedInvoices.length === 0) {
      toast({
        title: "선택된 청구서 없음",
        description: "삭제할 청구서를 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    setInvoices(invoices.filter(inv => !selectedInvoices.includes(inv.id)));
    toast({
      title: "삭제 완료",
      description: `${selectedInvoices.length}개의 청구서가 삭제되었습니다.`
    });
    setSelectedInvoices([]);
  };

  const handlePaymentRegister = () => {
    if (!paymentData.invoiceId || !paymentData.paymentDate || !paymentData.paymentAmount) {
      toast({
        title: "입력 오류",
        description: "모든 입금 정보를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setInvoices(invoices.map(inv =>
      inv.id === paymentData.invoiceId
        ? { ...inv, paymentConfirmed: true, paymentDate: paymentData.paymentDate, paymentAmount: parseFloat(paymentData.paymentAmount) }
        : inv
    ));

    toast({
      title: "입금 확인 완료",
      description: "입금 내역이 등록되었습니다."
    });

    setShowPaymentDialog(false);
    setPaymentData({ invoiceId: '', paymentDate: '', paymentAmount: '' });
  };

  const downloadInvoiceCSV = (filteredOnly: boolean = false) => {
    const invoiceData = filteredOnly ? filteredInvoices : invoices;
    const ws = XLSX.utils.json_to_sheet(invoiceData.map(inv => ({
      '청구번호': inv.id,
      '고객명': inv.customer,
      '금액': inv.amount,
      '상태': inv.status,
      '청구서발행': inv.invoiceIssued ? '발행' : '미발행',
      '발행일자': inv.issueDate || '',
      '청구일자': inv.date,
      '입금확인': inv.paymentConfirmed ? '확인' : '미확인',
      '입금일자': inv.paymentDate || '',
      '입금금액': inv.paymentAmount || 0
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "청구서");
    XLSX.writeFile(wb, `청구서_${new Date().toISOString().split('T')[0]}.csv`);
    toast({ title: "CSV 다운로드 완료" });
  };

  const downloadInvoiceExcel = (filteredOnly: boolean = false) => {
    const invoiceData = filteredOnly ? filteredInvoices : invoices;
    const ws = XLSX.utils.json_to_sheet(invoiceData.map(inv => ({
      '청구번호': inv.id,
      '고객명': inv.customer,
      '금액': inv.amount,
      '상태': inv.status,
      '청구서발행': inv.invoiceIssued ? '발행' : '미발행',
      '발행일자': inv.issueDate || '',
      '청구일자': inv.date,
      '입금확인': inv.paymentConfirmed ? '확인' : '미확인',
      '입금일자': inv.paymentDate || '',
      '입금금액': inv.paymentAmount || 0
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "청구서");
    XLSX.writeFile(wb, `청구서_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: "Excel 다운로드 완료" });
  };

  const downloadInvoiceForHometax = (filteredOnly: boolean = false) => {
    const invoiceData = filteredOnly ? filteredInvoices.filter(inv => inv.invoiceIssued) : invoices.filter(inv => inv.invoiceIssued);
    
    const ws = XLSX.utils.json_to_sheet(invoiceData.map(inv => ({
      '계산서발행키': `HOMETAX-${inv.id}-${inv.issueDate}`,
      '청구번호': inv.id,
      '고객명': inv.customer,
      '발행일자': inv.issueDate,
      '공급가액': Math.round(inv.amount / 1.1),
      '세액': Math.round(inv.amount - (inv.amount / 1.1)),
      '합계금액': inv.amount,
      '입금확인': inv.paymentConfirmed ? 'Y' : 'N',
      '입금일자': inv.paymentDate || ''
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "홈텍스연동");
    XLSX.writeFile(wb, `홈텍스_계산서발행_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "홈텍스 연동 파일 생성 완료",
      description: "홈텍스에 업로드하실 수 있는 파일이 생성되었습니다."
    });
  };

  const downloadInvoicePDF = (filteredOnly: boolean = false) => {
    const invoiceData = filteredOnly ? filteredInvoices : invoices;
    const doc = new jsPDF();
    doc.text("청구서 목록", 20, 20);
    let y = 40;
    invoiceData.forEach((inv) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${inv.id} - ${inv.customer}: ${inv.amount.toLocaleString()}원 ${inv.paymentConfirmed ? '[입금확인]' : ''}`, 20, y);
      y += 10;
    });
    doc.save(`청구서_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "PDF 다운로드 완료" });
  };

  const issueInvoice = (invoice: Invoice) => {
    const issueDate = new Date().toISOString().split('T')[0];
    setInvoices(invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, invoiceIssued: true, issueDate }
        : inv
    ));

    // Generate Excel invoice
    const invoiceData = [{
      '청구번호': invoice.id,
      '고객명': invoice.customer,
      '청구일자': invoice.date,
      '발행일자': issueDate,
      '금액': invoice.amount,
      '상태': invoice.status,
    }];

    if (invoice.items && invoice.items.length > 0) {
      const itemsData = invoice.items.map(item => ({
        '품목명': item.name,
        '수량': item.quantity,
        '단가': item.price,
        '금액': item.quantity * item.price,
      }));
      
      const ws1 = XLSX.utils.json_to_sheet(invoiceData);
      const ws2 = XLSX.utils.json_to_sheet(itemsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws1, "청구서");
      XLSX.utils.book_append_sheet(wb, ws2, "품목내역");
      XLSX.writeFile(wb, `청구서_${invoice.id}_${issueDate}.xlsx`);
    } else {
      const ws = XLSX.utils.json_to_sheet(invoiceData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "청구서");
      XLSX.writeFile(wb, `청구서_${invoice.id}_${issueDate}.xlsx`);
    }

    toast({
      title: "청구서 발행 완료",
      description: `${invoice.customer}에 대한 청구서가 Excel로 발행되었습니다.`
    });
  };

  const viewInvoiceDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const saveNewInvoice = () => {
    if (!newInvoice.customer || !newInvoice.date) {
      toast({
        title: "입력 오류",
        description: "고객명과 날짜를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    if (invoiceItems.length === 0) {
      toast({
        title: "입력 오류",
        description: "최소 한 개의 품목을 추가해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    const totalAmount = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    const invoice: Invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      customer: newInvoice.customer,
      amount: totalAmount,
      status: '대기',
      date: newInvoice.date,
      invoiceIssued: false,
      items: invoiceItems,
      paymentConfirmed: false
    };
    
    setInvoices(prev => [...prev, invoice]);
    setShowNewInvoice(false);
    setNewInvoice({ customer: '', amount: '', date: '' });
    setInvoiceItems([]);
    setNewItem({ name: '', quantity: 0, price: 0 });
    
    toast({
      title: "청구서 등록 완료",
      description: "새 청구서가 등록되었습니다."
    });
  };

  const addInvoiceItem = () => {
    if (!newItem.name || newItem.quantity <= 0 || newItem.price <= 0) {
      toast({
        title: "입력 오류",
        description: "상품, 수량, 단가를 올바르게 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setInvoiceItems([...invoiceItems, { ...newItem }]);
    setNewItem({ name: '', quantity: 0, price: 0 });
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const selectProduct = (productName: string) => {
    const product = products.find(p => p.name === productName);
    if (product) {
      setNewItem({ ...newItem, name: productName, price: product.shipmentPrice });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">청구 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">청구서 및 결제 관리</p>
        </div>
        <div className="flex gap-2">
          <Button size="lg" className="gap-2" onClick={() => setShowNewInvoice(true)}>
            <FilePlus className="w-5 h-5" />
            청구서 등록
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="w-5 h-5" />
                전체 다운로드
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadInvoiceCSV(false)}>
                <FileDown className="mr-2 h-4 w-4" />
                CSV로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadInvoiceExcel(false)}>
                <FileDown className="mr-2 h-4 w-4" />
                Excel로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadInvoicePDF(false)}>
                <FileDown className="mr-2 h-4 w-4" />
                PDF로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadInvoiceForHometax(false)}>
                <FileDown className="mr-2 h-4 w-4" />
                홈텍스 연동 파일
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="w-5 h-5" />
                필터링 다운로드
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadInvoiceCSV(true)}>
                <FileDown className="mr-2 h-4 w-4" />
                CSV로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadInvoiceExcel(true)}>
                <FileDown className="mr-2 h-4 w-4" />
                Excel로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadInvoicePDF(true)}>
                <FileDown className="mr-2 h-4 w-4" />
                PDF로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadInvoiceForHometax(true)}>
                <FileDown className="mr-2 h-4 w-4" />
                홈텍스 연동 파일
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.history.back()}
            title="닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">총 청구 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">₩41.6M</p>
            <p className="text-sm text-muted-foreground mt-2">이번 달</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">수금 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">₩18.1M</p>
            <p className="text-sm text-muted-foreground mt-2">43.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">미수금</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">₩23.5M</p>
            <p className="text-sm text-muted-foreground mt-2">56.5%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">청구서 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>청구서 번호</TableHead>
                <TableHead>고객명</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>계산서 발행여부</TableHead>
                <TableHead>발행 날짜</TableHead>
                <TableHead>입금확인</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={() => toggleSelect(invoice.id)}
                    />
                  </TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer text-primary hover:underline"
                    onClick={() => viewInvoiceDetail(invoice)}
                  >
                    {invoice.id}
                  </TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell className="font-semibold">₩{(invoice.amount / 1000000).toFixed(1)}M</TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === '완료' ? 'default' : 
                      invoice.status === '진행중' ? 'secondary' : 
                      'outline'
                    }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {invoice.invoiceIssued ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">발행완료</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-600">미발행</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{invoice.invoiceIssued && invoice.issueDate ? invoice.issueDate : '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {invoice.paymentConfirmed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-600">입금완료</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-orange-600">미확인</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!invoice.invoiceIssued && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => issueInvoice(invoice)}
                        >
                          청구서 발행
                        </Button>
                      )}
                      {!invoice.paymentConfirmed && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setPaymentData({ invoiceId: invoice.id, paymentDate: '', paymentAmount: invoice.amount.toString() });
                            setShowPaymentDialog(true);
                          }}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          입금확인
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      {selectedInvoice && (
        <Dialog open={showInvoiceDetail} onOpenChange={setShowInvoiceDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>청구서 상세</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">청구서 번호</label>
                  <div className="text-lg font-semibold">{selectedInvoice.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">청구일자</label>
                  <div className="text-lg">{selectedInvoice.date}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">고객명</label>
                  <div className="text-lg">{selectedInvoice.customer}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">금액</label>
                  <div className="text-lg font-semibold">₩{selectedInvoice.amount.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">상태</label>
                  <div className="mt-1">
                    <Badge variant={
                      selectedInvoice.status === '완료' ? 'default' : 
                      selectedInvoice.status === '진행중' ? 'secondary' : 'outline'
                    }>
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">계산서 발행 상태</label>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedInvoice.invoiceIssued ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">발행완료</span>
                        {selectedInvoice.issueDate && (
                          <span className="text-xs text-muted-foreground">({selectedInvoice.issueDate})</span>
                        )}
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600">미발행</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">품목 내역</label>
                  <div className="mt-2 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>품목명</TableHead>
                          <TableHead>수량</TableHead>
                          <TableHead>단가</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₩{item.price.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              {!selectedInvoice.invoiceIssued && (
                <Button onClick={() => {
                  issueInvoice(selectedInvoice);
                  setShowInvoiceDetail(false);
                }}>
                  계산서 발행
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowInvoiceDetail(false)}>닫기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>청구서 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>고객명 *</Label>
                <Input
                  value={newInvoice.customer}
                  onChange={(e) => setNewInvoice({ ...newInvoice, customer: e.target.value })}
                  placeholder="고객명 입력"
                />
              </div>
              <div>
                <Label>청구일자 *</Label>
                <Input
                  type="date"
                  value={newInvoice.date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">품목 추가</h3>
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-5">
                  <Label>상품명 *</Label>
                  <Combobox
                    options={products.map(p => ({ value: p.name, label: p.name }))}
                    value={newItem.name}
                    onValueChange={selectProduct}
                    placeholder="상품 검색..."
                    searchPlaceholder="상품명 검색..."
                    emptyText="검색 결과가 없습니다."
                  />
                </div>
                <div className="col-span-3">
                  <Label>수량 *</Label>
                  <Input
                    type="number"
                    value={newItem.quantity || ''}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="수량"
                  />
                </div>
                <div className="col-span-3">
                  <Label>단가 (출고가) *</Label>
                  <Input
                    type="number"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                    placeholder="단가"
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <Button onClick={addInvoiceItem} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {invoiceItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>상품명</TableHead>
                        <TableHead>수량</TableHead>
                        <TableHead>단가</TableHead>
                        <TableHead>합계</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₩{item.price.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">₩{(item.quantity * item.price).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeInvoiceItem(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {invoiceItems.length > 0 && (
                <div className="mt-4 text-right">
                  <p className="text-2xl font-bold">
                    최종 합계: ₩{invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewInvoice(false);
              setNewInvoice({ customer: '', amount: '', date: '' });
              setInvoiceItems([]);
              setNewItem({ name: '', quantity: 0, price: 0 });
            }}>취소</Button>
            <Button onClick={saveNewInvoice}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Registration Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>입금 확인 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>청구서 번호</Label>
              <Input value={paymentData.invoiceId} disabled />
            </div>
            <div>
              <Label>입금일자</Label>
              <Input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
              />
            </div>
            <div>
              <Label>입금금액</Label>
              <Input
                type="number"
                value={paymentData.paymentAmount}
                onChange={(e) => setPaymentData({ ...paymentData, paymentAmount: e.target.value })}
                placeholder="입금금액 입력"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>취소</Button>
            <Button onClick={handlePaymentRegister}>입금 확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
