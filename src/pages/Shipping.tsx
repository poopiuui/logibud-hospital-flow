import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Truck, Package, MapPin, ChevronDown, Info, Download, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface Shipment {
  id: string;
  customer: string;
  customerPhone: string;
  customerAddress: string;
  items: { name: string; quantity: number }[];
  status: string;
  trackingNumber: string;
  shipDate: string;
  completeDate?: string;
}

export default function Shipping() {
  const { toast } = useToast();
  const [shipments] = useState<Shipment[]>([
    {
      id: 'SHP-001',
      customer: '고객 A',
      customerPhone: '010-1234-5678',
      customerAddress: '서울시 강남구 테헤란로 123',
      items: [{ name: '주사기 5ml', quantity: 100 }, { name: '거즈 패드', quantity: 50 }],
      status: '배송중',
      trackingNumber: '123456789',
      shipDate: '2024-01-15',
      completeDate: undefined
    },
    {
      id: 'SHP-002',
      customer: '고객 B',
      customerPhone: '010-2345-6789',
      customerAddress: '부산시 해운대구 해운대로 456',
      items: [{ name: '의료용 장갑', quantity: 200 }],
      status: '출고준비중',
      trackingNumber: '987654321',
      shipDate: '2024-01-15',
      completeDate: undefined
    },
    {
      id: 'SHP-003',
      customer: '고객 C',
      customerPhone: '010-3456-7890',
      customerAddress: '대구시 수성구 수성로 789',
      items: [{ name: '붕대', quantity: 150 }],
      status: '배송완료',
      trackingNumber: '456789123',
      shipDate: '2024-01-13',
      completeDate: '2024-01-14'
    }
  ]);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const downloadExcel = () => {
    const data = shipments.map(ship => ({
      '배송번호': ship.id,
      '고객명': ship.customer,
      '전화번호': ship.customerPhone,
      '주소': ship.customerAddress,
      '품목수': ship.items.length,
      '상태': ship.status,
      '송장번호': ship.trackingNumber,
      '출고날짜': ship.shipDate,
      '완료날짜': ship.completeDate || '-'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "배송목록");
    XLSX.writeFile(wb, "배송관리_목록.xlsx");
    
    toast({
      title: "다운로드 완료",
      description: "엑셀 파일이 다운로드되었습니다."
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">배송 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">배송 현황 및 물류 추적</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadExcel} variant="outline" size="lg">
            <Download className="w-5 h-5 mr-2" />
            엑셀 다운로드
          </Button>
          <Button size="lg" className="gap-2">
            <Truck className="w-5 h-5" />
            새 배송 등록
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              준비중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              배송중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">15</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              배송완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">142</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              정시 배송률
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">정시 배송률: 약속된 시간과 수량에 맞춰 정확하게 배송된 비율입니다.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">94.2%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">배송 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>배송번호</TableHead>
                <TableHead>고객명</TableHead>
                <TableHead>품목수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>출고날짜</TableHead>
                <TableHead>완료날짜</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <Collapsible key={shipment.id} asChild open={expandedRows.has(shipment.id)}>
                  <>
                    <TableRow>
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(shipment.id)}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedRows.has(shipment.id) ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium cursor-pointer hover:text-primary" onClick={() => toggleRow(shipment.id)}>
                        {shipment.id}
                      </TableCell>
                      <TableCell className="cursor-pointer hover:text-primary" onClick={() => toggleRow(shipment.id)}>
                        {shipment.customer}
                      </TableCell>
                      <TableCell className="cursor-pointer hover:text-primary" onClick={() => toggleRow(shipment.id)}>
                        {shipment.items.length}개
                      </TableCell>
                      <TableCell>
                        <Badge>{shipment.status}</Badge>
                      </TableCell>
                      <TableCell>{shipment.shipDate}</TableCell>
                      <TableCell>{shipment.completeDate || '-'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <CollapsibleContent className="p-4 bg-muted/50">
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold mb-1">송장번호</p>
                              <p className="text-sm">{shipment.trackingNumber}</p>
                            </div>
                            <div>
                              <p className="font-semibold mb-1">고객 정보</p>
                              <p className="text-sm">이름: {shipment.customer}</p>
                              <p className="text-sm">전화번호: {shipment.customerPhone}</p>
                              <p className="text-sm">주소: {shipment.customerAddress}</p>
                            </div>
                            <div>
                              <p className="font-semibold mb-1">상품 목록</p>
                              {shipment.items.map((item, idx) => (
                                <p key={idx} className="text-sm">• {item.name} - {item.quantity}개</p>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </TableCell>
                    </TableRow>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
