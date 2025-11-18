import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  productCode: string;
  productName: string;
  unitPrice: number;
  currentStock: number;
}

interface QuotationGeneratorProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export function QuotationGenerator({ products, isOpen, onClose }: QuotationGeneratorProps) {
  const { toast } = useToast();

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.unitPrice, 0);
  };

  const calculateVAT = () => {
    return Math.round(calculateTotal() * 0.1);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString('ko-KR');
    const quotationNumber = `QT-${Date.now()}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>견적서</title>
          <style>
            body { font-family: 'Malgun Gothic', sans-serif; padding: 40px; }
            h1 { text-align: center; margin-bottom: 30px; }
            .header { margin-bottom: 20px; }
            .header p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #000; padding: 10px; text-align: center; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .total-section { margin-top: 20px; text-align: right; }
            .total-section p { margin: 5px 0; font-size: 16px; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <h1>견 적 서</h1>
          <div class="header">
            <p><strong>견적번호:</strong> ${quotationNumber}</p>
            <p><strong>견적일자:</strong> ${today}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>품목코드</th>
                <th>품목명</th>
                <th>단가</th>
                <th>수량</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              ${products.map((product, index) => `
                <tr>
                  <td>${product.productCode}</td>
                  <td>${product.productName}</td>
                  <td>₩${product.unitPrice.toLocaleString()}</td>
                  <td>1</td>
                  <td>₩${product.unitPrice.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-section">
            <p><strong>공급가액:</strong> ₩${calculateTotal().toLocaleString()}</p>
            <p><strong>부가세(10%):</strong> ₩${calculateVAT().toLocaleString()}</p>
            <p style="font-size: 18px; font-weight: bold; margin-top: 10px;">
              <strong>합계:</strong> ₩${(calculateTotal() + calculateVAT()).toLocaleString()}
            </p>
          </div>
          <div class="footer">
            <p>본 견적서는 ${today} 기준으로 작성되었습니다.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    
    toast({
      title: "견적서 출력",
      description: "견적서를 출력합니다.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "견적서 다운로드",
      description: "견적서를 PDF로 다운로드합니다.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">견적서</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm"><strong>견적번호:</strong> QT-{Date.now()}</p>
            <p className="text-sm"><strong>견적일자:</strong> {new Date().toLocaleDateString('ko-KR')}</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">품목코드</TableHead>
                <TableHead className="text-center">품목명</TableHead>
                <TableHead className="text-center">단가</TableHead>
                <TableHead className="text-center">수량</TableHead>
                <TableHead className="text-center">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{product.productCode}</TableCell>
                  <TableCell className="text-center">{product.productName}</TableCell>
                  <TableCell className="text-center">₩{product.unitPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-center">₩{product.unitPrice.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">공급가액:</span>
              <span>₩{calculateTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">부가세(10%):</span>
              <span>₩{calculateVAT().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>합계:</span>
              <span>₩{(calculateTotal() + calculateVAT()).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            PDF 다운로드
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            인쇄
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
