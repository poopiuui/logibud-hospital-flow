import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Package, Download, X, Plus, FileSpreadsheet } from "lucide-react";
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
      trackingNumber: '',
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

  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [isBulkTrackingDialogOpen, setIsBulkTrackingDialogOpen] = useState(false);
  const [isNewShipmentDialogOpen, setIsNewShipmentDialogOpen] = useState(false);
  const [isExcelUploadDialogOpen, setIsExcelUploadDialogOpen] = useState(false);

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
    if (selectedShipments.length === shipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(shipments.map(s => s.id));
    }
  };

  const toggleSelectShipment = (id: string) => {
    if (selectedShipments.includes(id)) {
      setSelectedShipments(selectedShipments.filter(s => s !== id));
    } else {
      setSelectedShipments([...selectedShipments, id]);
    }
  };

  const downloadExcel = () => {
    const data = shipments.map(ship => ({
      '배송번호': ship.id,
      '고객명': ship.customer,
      '전화번호': ship.customerPhone,
      '주소': ship.customerAddress,
      '품목수': ship.items.length,
      '상태': ship.status,
      '송장번호': ship.trackingNumber || '미등록',
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

  const handleBulkTrackingSubmit = () => {
    toast({
      title: "일괄 송장 등록 완료",
      description: `${selectedShipments.length}건의 송장번호가 등록되었습니다.`
    });
    setIsBulkTrackingDialogOpen(false);
    setSelectedShipments([]);
  };

  const handleNewShipment = () => {
    toast({
      title: "배송 등록 완료",
      description: "새로운 배송이 등록되었습니다."
    });
    setIsNewShipmentDialogOpen(false);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        toast({
          title: "엑셀 업로드 완료",
          description: `${data.length}건의 배송 데이터가 등록되었습니다.`
        });
        setIsExcelUploadDialogOpen(false);
      };
      reader.readAsBinaryString(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      "출고준비중": "secondary",
      "배송중": "default",
      "배송완료": "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const onTimeRate = Math.round((shipments.filter(s => s.status === '배송완료').length / shipments.length) * 100);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">배송 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">배송 현황 및 물류 추적</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadExcel} variant="outline" size="lg">
            <Download className="mr-2 h-5 w-5" />
            엑셀 다운로드
          </Button>
          <Button 
            onClick={() => setIsBulkTrackingDialogOpen(true)}
            disabled={selectedShipments.length === 0}
            size="lg"
            variant="secondary"
          >
            <Package className="mr-2 h-5 w-5" />
            일괄 송장등록 ({selectedShipments.length})
          </Button>
          <Button onClick={() => setIsNewShipmentDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            새 배송등록
          </Button>
          <Button onClick={() => window.history.back()} variant="ghost" size="lg">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 상태 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">출고준비중</CardTitle>
            <Package className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{shipments.filter(s => s.status === '출고준비중').length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">배송중</CardTitle>
            <Truck className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{shipments.filter(s => s.status === '배송중').length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">배송완료</CardTitle>
            <Package className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{shipments.filter(s => s.status === '배송완료').length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">정시배송율</CardTitle>
            <Truck className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{onTimeRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 배송 목록 (가로형 테이블) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">배송 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedShipments.length === shipments.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-bold text-base">배송번호</TableHead>
                  <TableHead className="font-bold text-base">고객명</TableHead>
                  <TableHead className="font-bold text-base">전화번호</TableHead>
                  <TableHead className="font-bold text-base">배송주소</TableHead>
                  <TableHead className="font-bold text-base">품목수</TableHead>
                  <TableHead className="font-bold text-base">상태</TableHead>
                  <TableHead className="font-bold text-base">송장번호</TableHead>
                  <TableHead className="font-bold text-base">출고날짜</TableHead>
                  <TableHead className="font-bold text-base">완료날짜</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id} className="hover:bg-muted/50">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedShipments.includes(shipment.id)}
                        onCheckedChange={() => toggleSelectShipment(shipment.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-base">{shipment.id}</TableCell>
                    <TableCell className="font-medium text-base">{shipment.customer}</TableCell>
                    <TableCell className="text-base">{shipment.customerPhone}</TableCell>
                    <TableCell className="text-base max-w-xs truncate">{shipment.customerAddress}</TableCell>
                    <TableCell className="text-center text-base">
                      <Badge variant="secondary">{shipment.items.length}개</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell className="font-mono text-base">
                      {shipment.trackingNumber || <span className="text-muted-foreground">미등록</span>}
                    </TableCell>
                    <TableCell className="text-base">{shipment.shipDate}</TableCell>
                    <TableCell className="text-base">{shipment.completeDate || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 일괄 송장 등록 Dialog */}
      <Dialog open={isBulkTrackingDialogOpen} onOpenChange={setIsBulkTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">일괄 송장번호 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              선택된 {selectedShipments.length}건의 배송에 송장번호를 일괄 등록합니다.
            </div>
            <div className="space-y-2">
              <Label>송장번호 (쉼표로 구분)</Label>
              <Input placeholder="123456789, 987654321, ..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkTrackingDialogOpen(false)}>취소</Button>
            <Button onClick={handleBulkTrackingSubmit}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 새 배송등록 Dialog */}
      <Dialog open={isNewShipmentDialogOpen} onOpenChange={setIsNewShipmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">새 배송 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 h-20 flex flex-col gap-2"
                onClick={() => setIsNewShipmentDialogOpen(false)}
              >
                <Plus className="h-6 w-6" />
                개별 등록
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-20 flex flex-col gap-2"
                onClick={() => {
                  setIsNewShipmentDialogOpen(false);
                  setIsExcelUploadDialogOpen(true);
                }}
              >
                <FileSpreadsheet className="h-6 w-6" />
                엑셀 대량등록
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>고객명</Label>
                <Input placeholder="고객명 입력" />
              </div>
              <div className="space-y-2">
                <Label>전화번호</Label>
                <Input placeholder="전화번호 입력" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>배송주소</Label>
                <Input placeholder="배송주소 입력" />
              </div>
              <div className="space-y-2">
                <Label>제품명</Label>
                <Input placeholder="제품명 입력" />
              </div>
              <div className="space-y-2">
                <Label>수량</Label>
                <Input type="number" placeholder="수량 입력" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewShipmentDialogOpen(false)}>취소</Button>
            <Button onClick={handleNewShipment}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 엑셀 업로드 Dialog */}
      <Dialog open={isExcelUploadDialogOpen} onOpenChange={setIsExcelUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">엑셀 대량등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              엑셀 파일을 업로드하여 배송 정보를 일괄 등록합니다.
            </div>
            <div className="space-y-2">
              <Label>엑셀 파일 선택</Label>
              <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} />
            </div>
            <div className="text-xs text-muted-foreground">
              * 엑셀 파일 형식: 배송번호, 고객명, 전화번호, 주소, 제품명, 수량
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExcelUploadDialogOpen(false)}>취소</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
