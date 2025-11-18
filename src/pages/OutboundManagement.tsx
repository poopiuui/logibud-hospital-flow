import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import * as XLSX from 'xlsx';

interface Outbound {
  id: string;
  date: string;
  destination: string;
  product: string;
  quantity: number;
  status: '출고대기' | '출고완료' | '배송중';
  customer: string;
}

const OutboundManagement = () => {
  const [outbounds] = useState<Outbound[]>([
    {
      id: 'O-001',
      date: '2024-01-18 10:30',
      destination: '서울시 강남구',
      product: '노트북 A1',
      quantity: 5,
      status: '출고완료',
      customer: '스마트마켓'
    },
    {
      id: 'O-002',
      date: '2024-01-18 14:20',
      destination: '부산시 해운대구',
      product: '스마트폰 X2',
      quantity: 10,
      status: '출고대기',
      customer: '테크스토어'
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
    const ws = XLSX.utils.json_to_sheet(outbounds);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "출고관리");
    XLSX.writeFile(wb, "출고관리_데이터.xlsx");
  };

  const filteredOutbounds = outbounds.filter(outbound =>
    outbound.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outbound.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outbound.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outbound.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case '출고완료':
        return 'default';
      case '배송중':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">출고관리</h1>
          <p className="text-muted-foreground">제품 출고 내역을 관리합니다</p>
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
          <CardTitle>출고 내역</CardTitle>
          <CardDescription>일시별 출고 내역을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="출고지, 제품명, 출고번호, 고객명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>출고번호</TableHead>
                <TableHead>출고일시</TableHead>
                <TableHead>출고지</TableHead>
                <TableHead>고객명</TableHead>
                <TableHead>제품명</TableHead>
                <TableHead>수량</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOutbounds.map((outbound) => (
                <TableRow key={outbound.id}>
                  <TableCell className="font-medium">{outbound.id}</TableCell>
                  <TableCell>{outbound.date}</TableCell>
                  <TableCell>{outbound.destination}</TableCell>
                  <TableCell>{outbound.customer}</TableCell>
                  <TableCell>{outbound.product}</TableCell>
                  <TableCell>{outbound.quantity}개</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(outbound.status)}>
                      {outbound.status}
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

export default OutboundManagement;
