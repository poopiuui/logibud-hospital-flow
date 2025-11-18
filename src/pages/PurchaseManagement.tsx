import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import * as XLSX from 'xlsx';

interface Purchase {
  id: string;
  date: string;
  vendor: string;
  product: string;
  quantity: number;
  price: number;
  type: '제조사' | '반품';
  status: string;
}

const PurchaseManagement = () => {
  const [purchases] = useState<Purchase[]>([
    {
      id: 'P-001',
      date: '2024-01-15 14:30',
      vendor: '(주)글로벌물류',
      product: '노트북 A1',
      quantity: 50,
      price: 25000000,
      type: '제조사',
      status: '완료'
    },
    {
      id: 'P-002',
      date: '2024-01-16 09:15',
      vendor: '스마트전자',
      product: '스마트폰 X2',
      quantity: 10,
      price: 8000000,
      type: '반품',
      status: '처리중'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(purchases);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "매입관리");
    XLSX.writeFile(wb, "매입관리_데이터.xlsx");
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">매입관리</h1>
          <p className="text-muted-foreground">제품 매입 내역을 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExcelDownload} variant="outline">
            엑셀 다운로드
          </Button>
          <Button onClick={() => window.history.back()} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>매입 내역</CardTitle>
          <CardDescription>일시별 매입 내역을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>매입번호</TableHead>
                <TableHead>매입일시</TableHead>
                <TableHead>매입처</TableHead>
                <TableHead>제품명</TableHead>
                <TableHead>수량</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell>{purchase.vendor}</TableCell>
                  <TableCell>{purchase.product}</TableCell>
                  <TableCell>{purchase.quantity}개</TableCell>
                  <TableCell>₩{purchase.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={purchase.type === '제조사' ? 'default' : 'secondary'}>
                      {purchase.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={purchase.status === '완료' ? 'default' : 'outline'}>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseManagement;
