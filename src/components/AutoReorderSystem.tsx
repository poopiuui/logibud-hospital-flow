import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Printer } from "lucide-react";
import * as XLSX from "xlsx";

interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  safetyStock: number;
  suggestedOrder: number;
  supplier: string;
  unitPrice: number;
  selected: boolean;
}

export const AutoReorderSystem = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<LowStockProduct[]>([
    {
      id: "1",
      name: "의료용 마스크 KF94",
      currentStock: 50,
      safetyStock: 200,
      suggestedOrder: 300,
      supplier: "(주)글로벌물류",
      unitPrice: 1500,
      selected: false,
    },
    {
      id: "2",
      name: "일회용 장갑 (L)",
      currentStock: 30,
      safetyStock: 150,
      suggestedOrder: 200,
      supplier: "(주)글로벌물류",
      unitPrice: 800,
      selected: false,
    },
    {
      id: "3",
      name: "소독용 알코올 500ml",
      currentStock: 15,
      safetyStock: 100,
      suggestedOrder: 150,
      supplier: "스마트마켓",
      unitPrice: 3000,
      selected: false,
    },
  ]);

  const handleSelectAll = (checked: boolean) => {
    setProducts(products.map(p => ({ ...p, selected: checked })));
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, selected: checked } : p
    ));
  };

  const handlePrintPurchaseOrder = () => {
    const selectedProducts = products.filter(p => p.selected);
    
    if (selectedProducts.length === 0) {
      toast({
        title: "제품 선택 필요",
        description: "발주서를 인쇄할 제품을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 발주서 HTML 생성
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalAmount = selectedProducts.reduce((sum, p) => sum + (p.suggestedOrder * p.unitPrice), 0);
    const orderDate = new Date().toLocaleDateString('ko-KR');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>발주서</title>
          <style>
            body {
              font-family: 'Malgun Gothic', sans-serif;
              padding: 40px;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
            }
            .header h1 {
              font-size: 32px;
              margin: 0;
            }
            .info {
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #333;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .total {
              text-align: right;
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>발 주 서</h1>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span><strong>발주일:</strong> ${orderDate}</span>
              <span><strong>발주번호:</strong> PO-${Date.now().toString().slice(-8)}</span>
            </div>
            <div class="info-row">
              <span><strong>공급업체:</strong> ${selectedProducts[0].supplier}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>제품명</th>
                <th>현재재고</th>
                <th>발주수량</th>
                <th>단가</th>
                <th>합계</th>
              </tr>
            </thead>
            <tbody>
              ${selectedProducts.map((product, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${product.name}</td>
                  <td>${product.currentStock}</td>
                  <td>${product.suggestedOrder}</td>
                  <td>${product.unitPrice.toLocaleString()}원</td>
                  <td>${(product.suggestedOrder * product.unitPrice).toLocaleString()}원</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            총 발주금액: ${totalAmount.toLocaleString()}원
          </div>

          <div class="footer">
            <p>로지봇 병원 물류 관리 시스템</p>
            <p>이 발주서는 자동 생성되었습니다.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();

    toast({
      title: "발주서 인쇄",
      description: "발주서가 생성되었습니다.",
    });
  };

  const handleAutoOrder = () => {
    const selectedProducts = products.filter(p => p.selected);
    
    if (selectedProducts.length === 0) {
      toast({
        title: "제품 선택 필요",
        description: "자동 발주할 제품을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 시뮬레이션: 자동 발주 처리
    toast({
      title: "자동 발주 완료",
      description: `${selectedProducts.length}개 제품의 발주가 완료되었습니다.`,
    });

    // 선택 해제
    setProducts(products.map(p => ({ ...p, selected: false })));
  };

  const handleExport = () => {
    const selectedProducts = products.filter(p => p.selected);
    const exportData = (selectedProducts.length > 0 ? selectedProducts : products).map(p => ({
      '제품명': p.name,
      '현재재고': p.currentStock,
      '안전재고': p.safetyStock,
      '추천발주량': p.suggestedOrder,
      '공급업체': p.supplier,
      '단가': p.unitPrice,
      '발주금액': p.suggestedOrder * p.unitPrice,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "자동발주목록");
    XLSX.writeFile(wb, `자동발주목록_${new Date().toLocaleDateString('ko-KR')}.xlsx`);

    toast({
      title: "엑셀 다운로드",
      description: "발주 목록이 엑셀로 다운로드되었습니다.",
    });
  };

  const selectedCount = products.filter(p => p.selected).length;
  const totalOrderAmount = products
    .filter(p => p.selected)
    .reduce((sum, p) => sum + (p.suggestedOrder * p.unitPrice), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <AlertTriangle className="w-6 h-6 text-warning" />
          자동 발주 시스템
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAutoOrder} disabled={selectedCount === 0}>
            선택 제품 자동 발주 ({selectedCount})
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrintPurchaseOrder}
            disabled={selectedCount === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            발주서 인쇄 ({selectedCount})
          </Button>
          <Button variant="outline" onClick={handleExport}>
            엑셀 다운로드
          </Button>
        </div>

        {selectedCount > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold">
              선택된 제품: {selectedCount}개 / 총 발주금액: {totalOrderAmount.toLocaleString()}원
            </p>
          </div>
        )}

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={products.every(p => p.selected)}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>제품명</TableHead>
                <TableHead>현재재고</TableHead>
                <TableHead>안전재고</TableHead>
                <TableHead>추천발주량</TableHead>
                <TableHead>공급업체</TableHead>
                <TableHead>단가</TableHead>
                <TableHead>발주금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={product.selected}
                      onCheckedChange={(checked) => 
                        handleSelectProduct(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-destructive font-semibold">
                    {product.currentStock}
                  </TableCell>
                  <TableCell>{product.safetyStock}</TableCell>
                  <TableCell className="text-success font-semibold">
                    {product.suggestedOrder}
                  </TableCell>
                  <TableCell>{product.supplier}</TableCell>
                  <TableCell>{product.unitPrice.toLocaleString()}원</TableCell>
                  <TableCell className="font-semibold">
                    {(product.suggestedOrder * product.unitPrice).toLocaleString()}원
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
