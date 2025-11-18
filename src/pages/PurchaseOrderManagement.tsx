import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Printer, Download } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { SwipeableTableRow } from "@/components/SwipeableTableRow";
import * as XLSX from "xlsx";

interface PurchaseOrder {
  orderNumber: string;
  orderDate: string;
  supplier: string;
  totalAmount: number;
  status: '대기' | '확인' | '완료';
  items: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function PurchaseOrderManagement() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    {
      orderNumber: 'PO-2024-001',
      orderDate: '2024-11-15',
      supplier: '㈜글로벌물류',
      totalAmount: 1500000,
      status: '완료',
      items: [
        { productCode: 'A-001', productName: '주사기(5ml)', quantity: 1000, unitPrice: 150 },
        { productCode: 'B-012', productName: '거즈 패드', quantity: 2000, unitPrice: 80 }
      ]
    },
    {
      orderNumber: 'PO-2024-002',
      orderDate: '2024-11-16',
      supplier: '스마트마켓',
      totalAmount: 450000,
      status: '확인',
      items: [
        { productCode: 'C-045', productName: '일회용 장갑(M)', quantity: 5000, unitPrice: 50 }
      ]
    },
    {
      orderNumber: 'PO-2024-003',
      orderDate: '2024-11-18',
      supplier: '㈜메디칼',
      totalAmount: 320000,
      status: '대기',
      items: [
        { productCode: 'D-089', productName: '체온계', quantity: 100, unitPrice: 3200 }
      ]
    }
  ]);

  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>(orders);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState<PurchaseOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const openDetail = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setEditedOrder({ ...order });
    setIsDetailOpen(true);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!editedOrder) return;

    const updated = orders.map(order =>
      order.orderNumber === editedOrder.orderNumber ? editedOrder : order
    );
    setOrders(updated);
    applyFilters(updated, searchTerm, statusFilter);
    
    toast({
      title: "발주서 수정",
      description: `${editedOrder.orderNumber} 발주서가 수정되었습니다.`
    });
    
    setIsEditMode(false);
    setSelectedOrder(editedOrder);
  };

  const handleStatusChange = (newStatus: '대기' | '확인' | '완료') => {
    if (!editedOrder) return;
    setEditedOrder({ ...editedOrder, status: newStatus });
  };

  const handlePrint = (order: PurchaseOrder) => {
    toast({
      title: "발주서 인쇄",
      description: `${order.orderNumber} 발주서를 인쇄합니다.`
    });
  };

  const handleDownload = (order: PurchaseOrder) => {
    toast({
      title: "발주서 다운로드",
      description: `${order.orderNumber} 발주서를 다운로드합니다.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료': return 'default';
      case '확인': return 'secondary';
      case '대기': return 'outline';
      default: return 'outline';
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    let filtered = [...orders];
    
    if (range.from && range.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= range.from! && orderDate <= range.to!;
      });
    }
    
    applyFilters(filtered, searchTerm, statusFilter);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(orders, term, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(orders, searchTerm, status);
  };

  const applyFilters = (data: PurchaseOrder[], search: string, status: string) => {
    let filtered = [...data];
    
    if (search) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.supplier.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter(order => order.status === status);
    }
    
    setFilteredOrders(filtered);
  };

  const handleExportExcel = () => {
    const exportData = filteredOrders.flatMap(order =>
      order.items.map(item => ({
        '발주번호': order.orderNumber,
        '발주일자': order.orderDate,
        '공급업체': order.supplier,
        '상태': order.status,
        '품목코드': item.productCode,
        '품목명': item.productName,
        '수량': item.quantity,
        '단가': item.unitPrice,
        '금액': item.quantity * item.unitPrice,
        '총 발주금액': order.totalAmount
      }))
    );

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "발주서");
    XLSX.writeFile(wb, `발주서관리_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "내보내기 완료",
      description: `${filteredOrders.length}개 발주서를 엑셀로 내보냈습니다.`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">발주서 관리</h1>
              <p className="text-muted-foreground mt-1">발주서를 조회하고 관리합니다</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    발주서 목록
                  </CardTitle>
                  <CardDescription className="mt-2">
                    총 {filteredOrders.length}건의 발주서
                  </CardDescription>
                </div>
                <Button onClick={handleExportExcel} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  엑셀 내보내기
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <DateRangeFilter
                  onDateRangeChange={handleDateRangeChange}
                  storageKey="purchaseOrderDateFilter"
                />
                <Input
                  placeholder="발주번호/공급업체 검색..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="상태 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="대기">대기</SelectItem>
                    <SelectItem value="확인">확인</SelectItem>
                    <SelectItem value="완료">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">발주번호</TableHead>
                    <TableHead className="font-bold">발주일자</TableHead>
                    <TableHead className="font-bold">공급업체</TableHead>
                    <TableHead className="font-bold">품목수</TableHead>
                    <TableHead className="font-bold">발주금액</TableHead>
                    <TableHead className="font-bold">상태</TableHead>
                    <TableHead className="font-bold text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <SwipeableTableRow
                      key={order.orderNumber}
                      onEdit={() => openDetail(order)}
                    >
                      <TableCell 
                        className="font-mono font-semibold text-primary cursor-pointer hover:underline"
                        onClick={() => openDetail(order)}
                      >
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.items.length}개</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₩{order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetail(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrint(order)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(order)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </SwipeableTableRow>
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
            <DialogTitle>발주서 상세 - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {editedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">발주일자</p>
                  {isEditMode ? (
                    <Input
                      type="date"
                      value={editedOrder.orderDate}
                      onChange={(e) => setEditedOrder({ ...editedOrder, orderDate: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{editedOrder.orderDate}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">공급업체</p>
                  {isEditMode ? (
                    <Input
                      value={editedOrder.supplier}
                      onChange={(e) => setEditedOrder({ ...editedOrder, supplier: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{editedOrder.supplier}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  {isEditMode ? (
                    <Select value={editedOrder.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="대기">대기</SelectItem>
                        <SelectItem value="확인">확인</SelectItem>
                        <SelectItem value="완료">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusColor(editedOrder.status)}>
                      {editedOrder.status}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">총 발주금액</p>
                  <p className="font-semibold text-lg">
                    ₩{editedOrder.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">발주 품목</h3>
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
                      {editedOrder.items.map((item, index) => (
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
            </div>
          )}
          <DialogFooter>
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>취소</Button>
                <Button onClick={handleSaveEdit}>저장</Button>
              </>
            ) : (
              <Button onClick={handleEdit}>수정</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
