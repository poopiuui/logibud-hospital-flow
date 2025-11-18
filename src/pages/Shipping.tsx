import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Package, CheckCircle2, Download, Upload, PackagePlus, X, FileDown, Filter, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { SwipeableTableRow } from "@/components/SwipeableTableRow";
import { CommonFilters } from "@/components/CommonFilters";

interface Shipment {
  id: string;
  customer: string;
  customerPhone: string;
  address: string;
  shippingLocation: string;
  items: { name: string; quantity: number }[];
  status: string;
  trackingNumber: string;
  shipDate: string;
  deliveryDate?: string;
}

export default function Shipping() {
  const { toast } = useToast();
  const [shipments] = useState<Shipment[]>([
    {
      id: 'SHP-001',
      customer: '고객 A',
      customerPhone: '010-1234-5678',
      address: '서울시 강남구 테헤란로 123',
      shippingLocation: '서울창고',
      items: [{ name: '주사기 5ml', quantity: 100 }, { name: '거즈 패드', quantity: 50 }],
      status: '배송중',
      trackingNumber: '123456789',
      shipDate: '2024-01-15',
      deliveryDate: undefined
    },
    {
      id: 'SHP-002',
      customer: '고객 B',
      customerPhone: '010-2345-6789',
      address: '부산시 해운대구 해운대로 456',
      shippingLocation: '부산창고',
      items: [{ name: '의료용 장갑', quantity: 200 }],
      status: '출고준비중',
      trackingNumber: '',
      shipDate: '2024-01-15',
      deliveryDate: undefined
    },
    {
      id: 'SHP-003',
      customer: '고객 C',
      customerPhone: '010-3456-7890',
      address: '대구시 수성구 수성로 789',
      shippingLocation: '서울창고',
      items: [{ name: '붕대', quantity: 150 }],
      status: '배송완료',
      trackingNumber: '456789123',
      shipDate: '2024-01-13',
      deliveryDate: '2024-01-14'
    }
  ]);

  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isBulkTrackingDialogOpen, setIsBulkTrackingDialogOpen] = useState(false);
  const [isNewShipmentDialogOpen, setIsNewShipmentDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bulkTrackingNumber, setBulkTrackingNumber] = useState("");
  const [bulkStatusChange, setBulkStatusChange] = useState("");
  const [trackingMode, setTrackingMode] = useState<'manual' | 'excel'>('manual');
  const [excelTrackingData, setExcelTrackingData] = useState<Array<{ id: string; trackingNumber: string }>>([]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredShipments = shipments.filter(ship => {
    const searchMatch = searchTerm === "" ||
      ship.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.address.toLowerCase().includes(searchTerm.toLowerCase());
    const productMatch = productFilter === "" || ship.items.some(item => 
      item.name.toLowerCase().includes(productFilter.toLowerCase())
    );
    const locationMatch = locationFilter === "" || locationFilter === "all" || ship.shippingLocation === locationFilter;
    const statusMatch = statusFilter === "all" || ship.status === statusFilter;
    const shipDate = new Date(ship.shipDate);
    const matchesDateRange = !dateRange.from || !dateRange.to || 
      (shipDate >= dateRange.from && shipDate <= dateRange.to);
    return searchMatch && productMatch && locationMatch && statusMatch && matchesDateRange;
  }).sort((a, b) => {
    const dateA = new Date(a.shipDate).getTime();
    const dateB = new Date(b.shipDate).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const toggleSelectAll = () => {
    if (selectedShipments.length === filteredShipments.length && filteredShipments.length > 0) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(filteredShipments.map(s => s.id));
    }
  };

  const toggleSelectShipment = (id: string) => {
    if (selectedShipments.includes(id)) {
      setSelectedShipments(selectedShipments.filter(s => s !== id));
    } else {
      setSelectedShipments([...selectedShipments, id]);
    }
  };

  const handleBulkTrackingSubmit = () => {
    if (trackingMode === 'manual') {
      if (!bulkTrackingNumber.trim()) {
        toast({
          title: "송장번호 입력 필요",
          description: "송장번호를 입력해주세요.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "일괄 송장 등록 완료",
        description: `${selectedShipments.length}개의 배송에 송장번호가 등록되었습니다.`
      });
    } else {
      if (excelTrackingData.length === 0) {
        toast({
          title: "Excel 파일 업로드 필요",
          description: "송장번호가 포함된 Excel 파일을 업로드해주세요.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Excel 일괄 등록 완료",
        description: `${excelTrackingData.length}개의 송장번호가 등록되었습니다.`
      });
    }
    
    setBulkTrackingNumber("");
    setExcelTrackingData([]);
    setIsBulkTrackingDialogOpen(false);
    setSelectedShipments([]);
  };

  const handleTrackingExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const trackingData = jsonData.map((row: any) => ({
          id: row['배송번호'] || row['배송ID'] || '',
          trackingNumber: row['송장번호'] || ''
        })).filter(item => item.id && item.trackingNumber);

        setExcelTrackingData(trackingData);
        toast({
          title: "Excel 파일 업로드 완료",
          description: `${trackingData.length}개의 송장번호가 로드되었습니다.`
        });
      } catch (error) {
        toast({
          title: "파일 읽기 오류",
          description: "Excel 파일을 읽는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatusChange) {
      toast({
        title: "상태 선택 필요",
        description: "변경할 상태를 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "일괄 상태 변경 완료",
      description: `${selectedShipments.length}개의 배송 상태가 변경되었습니다.`
    });
    setBulkStatusChange("");
    setSelectedShipments([]);
  };

  const handleBulkDelete = () => {
    if (selectedShipments.length === 0) {
      toast({
        title: "선택된 배송 없음",
        description: "삭제할 배송을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "삭제 완료",
      description: `${selectedShipments.length}개의 배송이 삭제되었습니다.`
    });
    setSelectedShipments([]);
  };

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredShipments.map(s => ({
      '배송번호': s.id,
      '고객명': s.customer,
      '전화번호': s.customerPhone,
      '주소': s.address,
      '배송지': s.shippingLocation,
      '상태': s.status,
      '송장번호': s.trackingNumber,
      '출고일': s.shipDate,
      '완료일': s.deliveryDate || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "배송관리");
    XLSX.writeFile(wb, "배송관리_데이터.csv");
    toast({ title: "CSV 다운로드 완료" });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredShipments.map(s => ({
      '배송번호': s.id,
      '고객명': s.customer,
      '전화번호': s.customerPhone,
      '주소': s.address,
      '배송지': s.shippingLocation,
      '상태': s.status,
      '송장번호': s.trackingNumber,
      '출고일': s.shipDate,
      '완료일': s.deliveryDate || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "배송관리");
    XLSX.writeFile(wb, "배송관리_데이터.xlsx");
    toast({ title: "Excel 다운로드 완료" });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("배송 관리 목록", 20, 20);
    let y = 40;
    filteredShipments.forEach((ship) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${ship.id} - ${ship.customer}: ${ship.status}`, 20, y);
      y += 10;
    });
    doc.save("배송관리_데이터.pdf");
    toast({ title: "PDF 다운로드 완료" });
  };

  const stats = {
    preparing: filteredShipments.filter(s => s.status === '출고준비중').length,
    inTransit: filteredShipments.filter(s => s.status === '배송중').length,
    delivered: filteredShipments.filter(s => s.status === '배송완료').length,
    onTimeRate: filteredShipments.length > 0 ? Math.round((filteredShipments.filter(s => s.status === '배송완료').length / filteredShipments.length) * 100) : 0
  };

  const downloadExcel = (filtered = false) => {
    const dataToExport = filtered && selectedShipments.length > 0 
      ? filteredShipments.filter(ship => selectedShipments.includes(ship.id))
      : filteredShipments;
    
    const data = dataToExport.map(ship => ({
      '배송번호': ship.id,
      '고객명': ship.customer,
      '전화번호': ship.customerPhone,
      '주소': ship.address,
      '출고지': ship.shippingLocation,
      '품목수': ship.items.length,
      '상태': ship.status,
      '송장번호': ship.trackingNumber || '미등록',
      '출고날짜': ship.shipDate,
      '완료날짜': ship.deliveryDate || '-'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "배송목록");
    XLSX.writeFile(wb, "배송관리_목록.xlsx");
    
    toast({
      title: "다운로드 완료",
      description: `${dataToExport.length}건의 배송 데이터가 다운로드되었습니다.`
    });
  };

  const downloadCSV = () => {
    const csv = [
      ['배송번호', '고객명', '전화번호', '주소', '출고지', '품목수', '상태', '송장번호', '출고날짜', '완료날짜'],
      ...filteredShipments.map(ship => [
        ship.id, ship.customer, ship.customerPhone, ship.address,
        ship.shippingLocation, ship.items.length, ship.status,
        ship.trackingNumber || '미등록', ship.shipDate, ship.deliveryDate || '-'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '배송관리_목록.csv';
    link.click();
    
    toast({
      title: "CSV 다운로드 완료",
      description: `${filteredShipments.length}건의 배송 데이터가 다운로드되었습니다.`
    });
  };

  const handleNewShipment = (mode: 'individual' | 'bulk') => {
    toast({
      title: mode === 'individual' ? "배송 등록 완료" : "대량 배송 등록 완료",
      description: mode === 'individual' ? "새로운 배송이 등록되었습니다." : "엑셀 파일의 배송들이 등록되었습니다."
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
    return <Badge variant={variants[status] || "default"} className="text-sm">{status}</Badge>;
  };

  const locations = Array.from(new Set(shipments.map(s => s.shippingLocation)));

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">배송 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">배송 현황 및 물류 추적</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="w-5 h-5" />
                다운로드
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                CSV로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                <FileDown className="mr-2 h-4 w-4" />
                Excel로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                PDF로 다운로드
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
            <PackagePlus className="mr-2 h-5 w-5" />
            새 배송등록
          </Button>
          <Button onClick={() => window.history.back()} variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 상태 요약 - 한 줄로 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">출고준비중</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.preparing}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">배송중</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inTransit}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">배송완료</p>
              <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">정시배송율</p>
              <p className="text-3xl font-bold text-primary">{stats.onTimeRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터링 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Filter className="w-5 h-5" />
            필터링
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-base">상품명</Label>
              <Input 
                placeholder="상품명 검색..." 
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">출고지</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setProductFilter("");
                  setLocationFilter("");
                }}
                className="w-full"
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 배송 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">배송 목록 ({filteredShipments.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedShipments.length === filteredShipments.length && filteredShipments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-base">배송번호</TableHead>
                  <TableHead className="text-base">고객명</TableHead>
                  <TableHead className="text-base">출고지</TableHead>
                  <TableHead className="text-base cursor-pointer hover:bg-muted">
                    품목수
                  </TableHead>
                  <TableHead className="text-base">상태</TableHead>
                  <TableHead className="text-base">송장번호</TableHead>
                  <TableHead className="text-base">출고날짜</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <>
                    <TableRow key={shipment.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedShipments.includes(shipment.id)}
                          onCheckedChange={() => toggleSelectShipment(shipment.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-base">{shipment.id}</TableCell>
                      <TableCell className="text-base">{shipment.customer}</TableCell>
                      <TableCell className="text-base">{shipment.shippingLocation}</TableCell>
                      <TableCell 
                        className="text-base text-primary font-medium cursor-pointer hover:underline"
                        onClick={() => setExpandedRow(expandedRow === shipment.id ? null : shipment.id)}
                      >
                        {shipment.items.length}개
                        {expandedRow === shipment.id ? <ChevronUp className="inline ml-2 w-4 h-4" /> : <ChevronDown className="inline ml-2 w-4 h-4" />}
                      </TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell className="text-base">{shipment.trackingNumber || '-'}</TableCell>
                      <TableCell className="text-base">{shipment.shipDate}</TableCell>
                    </TableRow>
                    {expandedRow === shipment.id && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30">
                          <div className="p-4 space-y-2">
                            <h4 className="font-semibold text-base mb-2">출고 품목:</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>품목명</TableHead>
                                  <TableHead className="text-right">수량</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {shipment.items.map((item, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">{item.quantity}개</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 일괄 송장 등록 다이얼로그 */}
      <Dialog open={isBulkTrackingDialogOpen} onOpenChange={setIsBulkTrackingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>일괄 송장번호 등록</DialogTitle>
          </DialogHeader>
          <Tabs value={trackingMode} onValueChange={(v) => setTrackingMode(v as 'manual' | 'excel')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">직접 입력</TabsTrigger>
              <TabsTrigger value="excel">Excel 업로드</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedShipments.length}건의 배송에 송장번호를 등록합니다.
              </p>
              <div className="space-y-2">
                <Label>송장번호</Label>
                <Input 
                  placeholder="송장번호 입력" 
                  value={bulkTrackingNumber}
                  onChange={(e) => setBulkTrackingNumber(e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="excel" className="space-y-4">
              <div className="space-y-2">
                <Label>Excel 파일 업로드</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  '배송번호'와 '송장번호' 열이 포함된 Excel 파일을 업로드하세요.
                </p>
                <Input 
                  type="file" 
                  accept=".xlsx,.xls"
                  onChange={handleTrackingExcelUpload}
                  className="cursor-pointer"
                />
              </div>
              
              {excelTrackingData.length > 0 && (
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold mb-2">업로드된 송장번호 ({excelTrackingData.length}건)</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>배송번호</TableHead>
                        <TableHead>송장번호</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {excelTrackingData.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.trackingNumber}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleBulkTrackingSubmit} className="flex-1">등록</Button>
            <Button variant="outline" onClick={() => {
              setIsBulkTrackingDialogOpen(false);
              setBulkTrackingNumber("");
              setExcelTrackingData([]);
            }} className="flex-1">취소</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 새 배송 등록 다이얼로그 */}
      <Dialog open={isNewShipmentDialogOpen} onOpenChange={setIsNewShipmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 배송 등록</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="individual">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">개별 등록</TabsTrigger>
              <TabsTrigger value="bulk">일괄 엑셀 등록</TabsTrigger>
            </TabsList>
            <TabsContent value="individual" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>고객명</Label>
                  <Input placeholder="고객명" />
                </div>
                <div className="space-y-2">
                  <Label>전화번호</Label>
                  <Input placeholder="010-0000-0000" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>배송지 주소</Label>
                  <Input placeholder="주소 입력" />
                </div>
                <div className="space-y-2">
                  <Label>출고지</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="출고지 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>송장번호</Label>
                  <Input placeholder="송장번호 (선택)" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleNewShipment('individual')} className="flex-1">등록</Button>
                <Button variant="outline" onClick={() => setIsNewShipmentDialogOpen(false)} className="flex-1">취소</Button>
              </div>
            </TabsContent>
            <TabsContent value="bulk" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium mb-2">엑셀 파일을 업로드하세요</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    대량의 배송 정보를 한 번에 등록할 수 있습니다
                  </p>
                </div>
                <Input 
                  type="file" 
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
              <Button onClick={() => handleNewShipment('bulk')} className="w-full">업로드</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
