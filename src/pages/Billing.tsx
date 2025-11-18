import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Eye, CheckCircle2, Clock, X, FileDown, FilePlus } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  invoiceIssued: boolean;
  issueDate?: string;
  items?: { name: string; quantity: number; price: number }[];
}

export default function Billing() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-001', customer: '고객 A', amount: 12500000, status: '완료', date: '2024-01-15', invoiceIssued: true, issueDate: '2024-01-16', items: [{ name: '주사기(5ml)', quantity: 100, price: 150 }] },
    { id: 'INV-002', customer: '고객 B', amount: 8300000, status: '진행중', date: '2024-01-14', invoiceIssued: false, items: [{ name: '거즈 패드', quantity: 200, price: 80 }] },
    { id: 'INV-003', customer: '고객 C', amount: 15200000, status: '대기', date: '2024-01-13', invoiceIssued: false, items: [{ name: '일회용 장갑', quantity: 500, price: 50 }] },
    { id: 'INV-004', customer: '고객 D', amount: 5600000, status: '완료', date: '2024-01-12', invoiceIssued: true, issueDate: '2024-01-13', items: [{ name: '알코올 솜', quantity: 300, price: 30 }] },
  ]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ customer: '', amount: '', date: '' });

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

  const downloadInvoiceExcel = () => {
    const invoiceData = selectedInvoices.length > 0
      ? invoices.filter(inv => selectedInvoices.includes(inv.id))
      : invoices;

    const ws = XLSX.utils.json_to_sheet(invoiceData.map(inv => ({
      '청구번호': inv.id,
      '고객명': inv.customer,
      '금액': inv.amount,
      '상태': inv.status,
      '계산서발행': inv.invoiceIssued ? '발행' : '미발행',
      '발행일자': inv.issueDate || '',
      '청구일자': inv.date
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "청구서");
    XLSX.writeFile(wb, `청구서_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "청구서 다운로드 완료",
      description: "청구서가 Excel 형식으로 다운로드되었습니다."
    });
  };

  const issueInvoice = (invoice: Invoice) => {
    const issueDate = new Date().toISOString().split('T')[0];
    setInvoices(invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, invoiceIssued: true, issueDate }
        : inv
    ));
    toast({
      title: "계산서 발행 완료",
      description: `${invoice.id} 계산서가 발행되었습니다.`
    });
  };

  const viewInvoiceDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };
    const dataToExport = filtered && selectedInvoices.length > 0 
      ? invoices.filter(inv => selectedInvoices.includes(inv.id))
      : invoices;
    
    const ws = XLSX.utils.json_to_sheet(dataToExport.map(inv => ({
      '청구서번호': inv.id,
      '고객명': inv.customer,
      '금액': inv.amount,
      '상태': inv.status,
      '계산서발행': inv.invoiceIssued ? '발행완료' : '미발행',
      '발행일': inv.issueDate || '-',
      '날짜': inv.date
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "청구관리");
    XLSX.writeFile(wb, "청구관리_목록.xlsx");
    
    toast({
      title: "다운로드 완료",
      description: `${dataToExport.length}개 청구서가 다운로드되었습니다.`
    });
  };

  const downloadCSV = (filtered = false) => {
    const dataToExport = filtered && selectedInvoices.length > 0 
      ? invoices.filter(inv => selectedInvoices.includes(inv.id))
      : invoices;
    
    const csv = [
      ['청구서번호', '고객명', '금액', '상태', '계산서발행', '발행일', '날짜'],
      ...dataToExport.map(inv => [
        inv.id, inv.customer, inv.amount, inv.status, 
        inv.invoiceIssued ? '발행완료' : '미발행',
        inv.issueDate || '-', inv.date
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '청구관리_목록.csv';
    link.click();
    
    toast({
      title: "CSV 다운로드 완료",
      description: `${dataToExport.length}개 청구서가 다운로드되었습니다.`
    });
  };

  const issueInvoice = (id: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, invoiceIssued: true, issueDate: new Date().toISOString().split('T')[0] } : inv
    ));
    toast({
      title: "계산서 발행 완료",
      description: "계산서가 발행되었습니다."
    });
  };

  const saveNewInvoice = () => {
    if (!newInvoice.customer || !newInvoice.amount || !newInvoice.date) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    const invoice: Invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      customer: newInvoice.customer,
      amount: parseFloat(newInvoice.amount),
      status: '대기',
      date: newInvoice.date,
      invoiceIssued: false,
      items: []
    };
    
    setInvoices(prev => [...prev, invoice]);
    setShowNewInvoice(false);
    setNewInvoice({ customer: '', amount: '', date: '' });
    
    toast({
      title: "청구서 등록 완료",
      description: "새 청구서가 등록되었습니다."
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">청구 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">청구서 및 결제 관리</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => downloadExcel(false)} variant="outline" size="lg">
            <Download className="w-5 h-5 mr-2" />
            전체 엑셀
          </Button>
          <Button onClick={() => downloadExcel(true)} variant="outline" size="lg" disabled={selectedInvoices.length === 0}>
            <Download className="w-5 h-5 mr-2" />
            선택 엑셀
          </Button>
          <Button onClick={() => downloadCSV(false)} variant="outline" size="lg">
            <FileDown className="w-5 h-5 mr-2" />
            CSV
          </Button>
          <Button size="lg" className="gap-2" onClick={() => setShowNewInvoice(true)}>
            <FilePlus className="w-5 h-5" />
            청구서 등록
          </Button>
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
                <TableHead>청구서 번호</TableHead>
                <TableHead>고객명</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>계산서 발행</TableHead>
                <TableHead>날짜</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
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
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
