import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, Package, Camera, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FF9800'];

export default function Inventory() {
  const { toast } = useToast();
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // 월별 데이터
  const monthlyData = [
    { name: '매입', value: 45000000 },
    { name: '출고', value: 38000000 },
    { name: '재고', value: 12500000 },
    { name: '매출', value: 52000000 },
  ];

  // 년별 데이터
  const yearlyData = [
    { month: '1월', 매입: 42000000, 출고: 35000000, 재고: 11000000, 매출: 48000000 },
    { month: '2월', 매입: 45000000, 출고: 38000000, 재고: 12500000, 매출: 52000000 },
    { month: '3월', 매입: 48000000, 출고: 40000000, 재고: 13500000, 매출: 55000000 },
    { month: '4월', 매입: 43000000, 출고: 36000000, 재고: 12000000, 매출: 49000000 },
    { month: '5월', 매입: 47000000, 출고: 39000000, 재고: 13000000, 매출: 53000000 },
    { month: '6월', 매입: 50000000, 출고: 42000000, 재고: 14000000, 매출: 57000000 },
  ];

  const recentTransactions = [
    { id: 1, type: '매입', product: '주사기(5ml)', quantity: 500, date: '2024-01-15', amount: 75000 },
    { id: 2, type: '출고', product: '거즈 패드', quantity: 200, date: '2024-01-15', amount: 16000 },
    { id: 3, type: '매입', product: '일회용 장갑(M)', quantity: 1000, date: '2024-01-14', amount: 50000 },
    { id: 4, type: '조정', product: '알코올 솜', quantity: -50, date: '2024-01-14', amount: 0, reason: '폐기' },
  ];

  const handlePurchase = () => {
    toast({
      title: "매입 등록 완료",
      description: "제품이 성공적으로 등록되었습니다.",
    });
    setPurchaseOpen(false);
  };

  const handleRelease = () => {
    toast({
      title: "출고 처리 완료",
      description: "재고가 출고 처리되었습니다.",
    });
    setReleaseOpen(false);
  };

  const handleAdjustment = () => {
    toast({
      title: "재고 조정 완료",
      description: "재고가 조정되었습니다.",
    });
    setAdjustmentOpen(false);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">입출고 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">재고 입출고 이력 및 통계</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setPurchaseOpen(true)} size="lg" className="gap-2">
            <ArrowUpCircle className="w-5 h-5" />
            매입
          </Button>
          <Button onClick={() => setReleaseOpen(true)} size="lg" variant="secondary" className="gap-2">
            <ArrowDownCircle className="w-5 h-5" />
            출고
          </Button>
          <Button onClick={() => setAdjustmentOpen(true)} size="lg" variant="outline" className="gap-2">
            <Package className="w-5 h-5" />
            재고 조정
          </Button>
        </div>
      </div>

      {/* 최근 입출고 이력 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">최근 입출고 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">유형</TableHead>
                <TableHead className="text-base">제품명</TableHead>
                <TableHead className="text-base">수량</TableHead>
                <TableHead className="text-base">금액</TableHead>
                <TableHead className="text-base">일자</TableHead>
                <TableHead className="text-base">등록자</TableHead>
                <TableHead className="text-base">비고</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Badge variant={
                      transaction.type === '매입' ? 'default' : 
                      transaction.type === '출고' ? 'secondary' : 
                      'outline'
                    }>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-base">{transaction.product}</TableCell>
                  <TableCell className="text-base">{transaction.quantity > 0 ? '+' : ''}{transaction.quantity}</TableCell>
                  <TableCell className="text-base">₩{transaction.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-base">{transaction.date}</TableCell>
                  <TableCell className="text-base font-medium">김담당</TableCell>
                  <TableCell className="text-muted-foreground text-base">
                    {(transaction as any).reason || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 월별 통계 (Pie Chart) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">월별 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={monthlyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₩${(value / 1000000).toFixed(1)}M`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₩${(value / 1000000).toFixed(1)}M`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 년별 통계 (Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">년별 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₩${(value / 1000000)}M`} />
              <Tooltip formatter={(value: number) => `₩${(value / 1000000).toFixed(1)}M`} />
              <Legend />
              <Bar dataKey="매입" fill={COLORS[0]} />
              <Bar dataKey="출고" fill={COLORS[1]} />
              <Bar dataKey="재고" fill={COLORS[2]} />
              <Bar dataKey="매출" fill={COLORS[3]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 매입 모달 */}
      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">매입 등록</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product-name">제품명</Label>
              <Input id="product-name" placeholder="제품명을 입력하세요" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purchase-date">입고일</Label>
              <Input id="purchase-date" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="features">특징</Label>
              <Input id="features" placeholder="제품 특징을 입력하세요" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">수량</Label>
              <Input id="quantity" type="number" placeholder="수량" />
            </div>
            <div className="grid gap-2">
              <Label>바코드/QR</Label>
              <div className="flex gap-2">
                <Input placeholder="바코드 번호" className="flex-1" />
                <Button variant="outline" onClick={() => setScannerOpen(true)}>
                  <Camera className="w-4 h-4 mr-2" />
                  스캔
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseOpen(false)}>취소</Button>
            <Button onClick={handlePurchase}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 출고 모달 */}
      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">출고 처리</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="search-product">제품명 검색</Label>
              <Input id="search-product" placeholder="제품명을 검색하세요" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="release-quantity">출고 수량</Label>
              <Input id="release-quantity" type="number" placeholder="출고 수량" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseOpen(false)}>취소</Button>
            <Button onClick={handleRelease}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 재고 조정 모달 */}
      <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">재고 조정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="adjustment-type">조정 유형</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disposal">폐기</SelectItem>
                  <SelectItem value="donation">기부</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-quantity">조정 수량</Label>
              <Input id="adjustment-quantity" type="number" placeholder="수량 입력" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-reason">사유</Label>
              <Input id="adjustment-reason" placeholder="조정 사유를 입력하세요" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustmentOpen(false)}>취소</Button>
            <Button onClick={handleAdjustment}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 바코드 스캐너 */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={(barcode) => {
          toast({
            title: "바코드 스캔 완료",
            description: `바코드: ${barcode}`,
          });
        }}
      />
    </div>
  );
}
