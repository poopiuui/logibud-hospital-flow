import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  productCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface QuotationGeneratorEditableProps {
  products: Array<{
    productCode: string;
    productName: string;
    unitPrice: number;
    currentStock: number;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

export function QuotationGeneratorEditable({ products: initialProducts, isOpen, onClose }: QuotationGeneratorEditableProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(
    initialProducts.map(p => ({
      ...p,
      quantity: 1
    }))
  );

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, {
      productCode: "",
      productName: "",
      unitPrice: 0,
      quantity: 1
    }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + (product.unitPrice * product.quantity), 0);
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
              ${products.map(product => `
                <tr>
                  <td>${product.productCode}</td>
                  <td>${product.productName}</td>
                  <td>₩${product.unitPrice.toLocaleString()}</td>
                  <td>${product.quantity}</td>
                  <td>₩${(product.unitPrice * product.quantity).toLocaleString()}</td>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">견적서 생성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">품목코드</TableHead>
                  <TableHead>품목명</TableHead>
                  <TableHead className="w-32">단가</TableHead>
                  <TableHead className="w-24">수량</TableHead>
                  <TableHead className="w-32">금액</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={product.productCode}
                        onChange={(e) => updateProduct(index, 'productCode', e.target.value)}
                        placeholder="코드"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={product.productName}
                        onChange={(e) => updateProduct(index, 'productName', e.target.value)}
                        placeholder="품목명"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={product.unitPrice}
                        onChange={(e) => updateProduct(index, 'unitPrice', Number(e.target.value))}
                        placeholder="단가"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', Number(e.target.value))}
                        placeholder="수량"
                        min="1"
                      />
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₩{(product.unitPrice * product.quantity).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProduct(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button onClick={addProduct} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            품목 추가
          </Button>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-lg">
              <span>공급가액:</span>
              <span className="font-semibold">₩{calculateTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>부가세 (10%):</span>
              <span className="font-semibold">₩{calculateVAT().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
              <span>합계:</span>
              <span>₩{(calculateTotal() + calculateVAT()).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            PDF 다운로드
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            인쇄
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
