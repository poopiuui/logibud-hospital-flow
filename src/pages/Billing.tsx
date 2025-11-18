import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, CheckCircle2, Clock, X } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  invoiceIssued: boolean;
}

export default function Billing() {
  const { toast } = useToast();
  const [invoices] = useState<Invoice[]>([
    { id: 'INV-001', customer: '고객 A', amount: 12500000, status: '완료', date: '2024-01-15', invoiceIssued: true },
    { id: 'INV-002', customer: '고객 B', amount: 8300000, status: '진행중', date: '2024-01-14', invoiceIssued: false },
    { id: 'INV-003', customer: '고객 C', amount: 15200000, status: '대기', date: '2024-01-13', invoiceIssued: false },
    { id: 'INV-004', customer: '고객 D', amount: 5600000, status: '완료', date: '2024-01-12', invoiceIssued: true },
  ]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(invoices.map(inv => ({
      '청구서번호': inv.id,
      '고객명': inv.customer,
      '금액': inv.amount,
      '상태': inv.status,
      '계산서발행': inv.invoiceIssued ? '발행완료' : '미발행',
      '날짜': inv.date
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "청구관리");
    XLSX.writeFile(wb, "청구관리_목록.xlsx");
    
    toast({
      title: "다운로드 완료",
      description: "엑셀 파일이 다운로드되었습니다."
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
          <Button onClick={downloadExcel} variant="outline" size="lg">
            <Download className="w-5 h-5 mr-2" />
            엑셀 다운로드
          </Button>
          <Button size="lg" className="gap-2">
            <FileText className="w-5 h-5" />
            새 청구서
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
