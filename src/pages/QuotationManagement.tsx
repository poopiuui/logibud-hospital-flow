import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Printer, Download } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

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

export default function QuotationManagement() {
  const { toast } = useToast();
  const [quotations] = useState<Quotation[]>([
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

  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const openDetail = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsDetailOpen(true);
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
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6" />
              견적서 목록
            </CardTitle>
            <CardDescription className="mt-2">
              총 {quotations.length}건의 견적서
            </CardDescription>
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
                  {quotations.map((quotation) => (
                    <TableRow key={quotation.quotationNumber}>
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
                      <TableCell>{quotation.validUntil}</TableCell>
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
                    </TableRow>
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
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">견적일자</p>
                  <p className="font-medium">{selectedQuotation.quotationDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">고객명</p>
                  <p className="font-medium">{selectedQuotation.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">유효기한</p>
                  <p className="font-medium">{selectedQuotation.validUntil}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  <Badge variant={getStatusColor(selectedQuotation.status)}>
                    {selectedQuotation.status}
                  </Badge>
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
                      {selectedQuotation.items.map((item, index) => (
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

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>공급가액:</span>
                  <span className="font-semibold">₩{selectedQuotation.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>부가세 (10%):</span>
                  <span className="font-semibold">₩{calculateVAT(selectedQuotation.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>합계:</span>
                  <span>₩{(selectedQuotation.totalAmount + calculateVAT(selectedQuotation.totalAmount)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
