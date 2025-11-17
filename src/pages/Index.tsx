import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  ShoppingCart, 
  Upload, 
  Download, 
  Search, 
  Plus,
  RefreshCw,
  BarChart3,
  Pencil,
  Trash2
} from "lucide-react";
import * as XLSX from 'xlsx';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Product {
  userCode: string;
  barcode: string;
  productCode: string;
  productName: string;
  currentStock: number;
  safetyStock: number;
  unitPrice: number;
  supplier: string;
  registeredDate: string;
}

interface OrderData {
  date: string;
  orderCount: number;
  receivedCount: number;
  orderAmount: number;
  receivedAmount: number;
}

interface PurchaseData {
  date: string;
  supplierName: string;
  itemCount: number;
  totalAmount: number;
  status: '완료' | '진행중' | '대기';
}

const generateSampleProducts = (): Product[] => [
  { userCode: 'USER001', barcode: '8801234567890', productCode: 'A-001', productName: '주사기(5ml)', currentStock: 850, safetyStock: 1000, unitPrice: 150, supplier: '㈜메디칼', registeredDate: new Date().toISOString().split('T')[0] },
  { userCode: 'USER002', barcode: '8801234567891', productCode: 'B-012', productName: '거즈 패드', currentStock: 2100, safetyStock: 2000, unitPrice: 80, supplier: '㈜헬스케어', registeredDate: new Date().toISOString().split('T')[0] },
  { userCode: 'USER003', barcode: '8801234567892', productCode: 'C-045', productName: '일회용 장갑(M)', currentStock: 4500, safetyStock: 5000, unitPrice: 50, supplier: '㈜메디칼', registeredDate: new Date().toISOString().split('T')[0] },
  { userCode: 'USER004', barcode: '8801234567893', productCode: 'D-078', productName: '알코올 솜', currentStock: 8900, safetyStock: 10000, unitPrice: 30, supplier: '㈜의료용품', registeredDate: new Date().toISOString().split('T')[0] },
  { userCode: 'USER005', barcode: '8801234567894', productCode: 'E-092', productName: '링거 세트', currentStock: 1200, safetyStock: 1500, unitPrice: 2500, supplier: '㈜메디텍', registeredDate: new Date().toISOString().split('T')[0] },
];

const generateOrderData = (): OrderData[] => {
  const data: OrderData[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      orderCount: Math.floor(Math.random() * 15) + 5,
      receivedCount: Math.floor(Math.random() * 15) + 3,
      orderAmount: Math.floor(Math.random() * 1500000) + 500000,
      receivedAmount: Math.floor(Math.random() * 1400000) + 400000,
    });
  }
  return data;
};

const generatePurchaseData = (): PurchaseData[] => {
  const data: PurchaseData[] = [];
  const suppliers = ['㈜메디칼', '㈜헬스케어', '㈜의료용품', '㈜메디텍'];
  const statuses: ('완료' | '진행중' | '대기')[] = ['완료', '진행중', '대기'];
  
  for (let i = 19; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
      itemCount: Math.floor(Math.random() * 10) + 1,
      totalAmount: Math.floor(Math.random() * 3000000) + 500000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return data;
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(generateSampleProducts());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const orderData = generateOrderData();
  const purchaseData = generatePurchaseData();

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.currentStock < p.safetyStock).length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
  const avgPrice = totalValue / products.reduce((sum, p) => sum + p.currentStock, 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === "" || 
      Object.values(product).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesSupplier = filterSupplier === "all" || product.supplier === filterSupplier;
    return matchesSearch && matchesSupplier;
  });

  const uniqueSuppliers = Array.from(new Set(products.map(p => p.supplier)));

  const stockChartData = products.map(p => ({
    name: p.productName,
    현재고: p.currentStock,
    안전재고: p.safetyStock,
  }));

  const supplierChartData = uniqueSuppliers.map(supplier => ({
    name: supplier,
    value: products.filter(p => p.supplier === supplier).length,
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: "내보내기 완료", description: "제품 데이터가 엑셀 파일로 저장되었습니다." });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Product[];
      setProducts(prevProducts => [...prevProducts, ...jsonData]);
      toast({ title: "가져오기 완료", description: `${jsonData.length}개의 제품이 추가되었습니다.` });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddProduct = () => {
    if (!newProduct.productName || !newProduct.productCode) {
      toast({ title: "오류", description: "필수 항목을 입력해주세요.", variant: "destructive" });
      return;
    }
    const product: Product = {
      userCode: newProduct.userCode || `USER${String(products.length + 1).padStart(3, '0')}`,
      barcode: newProduct.barcode || `8801234${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      productCode: newProduct.productCode!,
      productName: newProduct.productName!,
      currentStock: newProduct.currentStock || 0,
      safetyStock: newProduct.safetyStock || 0,
      unitPrice: newProduct.unitPrice || 0,
      supplier: newProduct.supplier || '',
      registeredDate: new Date().toISOString().split('T')[0],
    };
    setProducts([...products, product]);
    setNewProduct({});
    toast({ title: "등록 완료", description: "새 제품이 등록되었습니다." });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (!editingProduct) return;
    setProducts(products.map(p => p.productCode === editingProduct.productCode ? editingProduct : p));
    toast({ title: "수정 완료", description: "제품 정보가 수정되었습니다." });
    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingProduct) return;
    setProducts(products.filter(p => p.productCode !== deletingProduct.productCode));
    toast({ title: "삭제 완료", description: "제품이 삭제되었습니다." });
    setIsDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b-2 border-border">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">물류 관리 시스템</h1>
            <p className="text-lg text-muted-foreground">제품 재고 및 주문 현황 통합 관리</p>
          </div>
          <Button onClick={() => navigate('/analytics')} size="lg" className="gap-2 text-base font-semibold px-6 py-6">
            <BarChart3 className="h-5 w-5" />
            분석 대시보드
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="stat-card border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="kpi-label">총 제품 수</CardTitle>
                <Package className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="kpi-value text-primary">{totalProducts}</div>
              <p className="text-sm text-muted-foreground mt-2">등록된 제품</p>
            </CardContent>
          </Card>

          <Card className="stat-card border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="kpi-label">재고 부족</CardTitle>
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="kpi-value text-destructive">{lowStockProducts}</div>
              <p className="text-sm text-muted-foreground mt-2">안전재고 미달</p>
            </CardContent>
          </Card>

          <Card className="stat-card border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="kpi-label">총 재고 가치</CardTitle>
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="kpi-value text-success">₩{(totalValue / 1000000).toFixed(1)}M</div>
              <p className="text-sm text-muted-foreground mt-2">현재 재고 기준</p>
            </CardContent>
          </Card>

          <Card className="stat-card border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="kpi-label">평균 단가</CardTitle>
                <ShoppingCart className="h-6 w-6 text-info" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="kpi-value text-info">₩{Math.round(avgPrice)}</div>
              <p className="text-sm text-muted-foreground mt-2">단위당 평균 가격</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14 p-1.5 bg-muted/50">
            <TabsTrigger value="products" className="text-base font-semibold">제품 관리</TabsTrigger>
            <TabsTrigger value="orders" className="text-base font-semibold">주문 현황</TabsTrigger>
            <TabsTrigger value="purchase" className="text-base font-semibold">발주 관리</TabsTrigger>
            <TabsTrigger value="analytics" className="text-base font-semibold">차트 분석</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold">제품 목록</CardTitle>
                    <CardDescription className="text-base mt-1">전체 재고 제품 관리</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={handleExport} className="gap-2 text-base">
                      <Download className="h-4 w-4" />내보내기
                    </Button>
                    <Button variant="outline" size="lg" asChild className="gap-2 text-base">
                      <label>
                        <Upload className="h-4 w-4" />가져오기
                        <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                      </label>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="제품명, 코드, 공급사 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-12 text-base" />
                  </div>
                  <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                    <SelectTrigger className="w-full md:w-[240px] h-12 text-base">
                      <SelectValue placeholder="공급사 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-base">전체 공급사</SelectItem>
                      {uniqueSuppliers.map(supplier => (
                        <SelectItem key={supplier} value={supplier} className="text-base">{supplier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="lg" className="gap-2 h-12 text-base font-semibold px-6">
                    <RefreshCw className="h-4 w-4" />새로고침
                  </Button>
                </div>

                <div className="border-2 rounded-lg overflow-hidden">
                  <Table className="data-table">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold text-base">제품코드</TableHead>
                        <TableHead className="font-bold text-base">제품명</TableHead>
                        <TableHead className="font-bold text-base">현재고</TableHead>
                        <TableHead className="font-bold text-base">안전재고</TableHead>
                        <TableHead className="font-bold text-base">단가</TableHead>
                        <TableHead className="font-bold text-base">공급사</TableHead>
                        <TableHead className="font-bold text-base">상태</TableHead>
                        <TableHead className="font-bold text-base text-center">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.productCode} className="hover:bg-muted/30">
                          <TableCell className="font-mono font-semibold text-base">{product.productCode}</TableCell>
                          <TableCell className="font-semibold text-base">{product.productName}</TableCell>
                          <TableCell className="text-base font-semibold">{product.currentStock.toLocaleString()}</TableCell>
                          <TableCell className="text-base text-muted-foreground">{product.safetyStock.toLocaleString()}</TableCell>
                          <TableCell className="text-base font-medium">₩{product.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-base">{product.supplier}</TableCell>
                          <TableCell>
                            <Badge variant={product.currentStock < product.safetyStock ? "destructive" : "default"} className="text-sm font-semibold px-3 py-1">
                              {product.currentStock < product.safetyStock ? "부족" : "정상"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)} className="h-9 w-9 p-0">
                                <Pencil className="h-4 w-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product)} className="h-9 w-9 p-0">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Plus className="h-6 w-6" />신규 제품 등록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productCode" className="text-base font-semibold">제품코드 *</Label>
                    <Input id="productCode" placeholder="A-001" value={newProduct.productCode || ''} onChange={(e) => setNewProduct({...newProduct, productCode: e.target.value})} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productName" className="text-base font-semibold">제품명 *</Label>
                    <Input id="productName" placeholder="제품명 입력" value={newProduct.productName || ''} onChange={(e) => setNewProduct({...newProduct, productName: e.target.value})} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentStock" className="text-base font-semibold">현재고</Label>
                    <Input id="currentStock" type="number" placeholder="0" value={newProduct.currentStock || ''} onChange={(e) => setNewProduct({...newProduct, currentStock: parseInt(e.target.value) || 0})} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="safetyStock" className="text-base font-semibold">안전재고</Label>
                    <Input id="safetyStock" type="number" placeholder="0" value={newProduct.safetyStock || ''} onChange={(e) => setNewProduct({...newProduct, safetyStock: parseInt(e.target.value) || 0})} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice" className="text-base font-semibold">단가</Label>
                    <Input id="unitPrice" type="number" placeholder="0" value={newProduct.unitPrice || ''} onChange={(e) => setNewProduct({...newProduct, unitPrice: parseInt(e.target.value) || 0})} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier" className="text-base font-semibold">공급사</Label>
                    <Input id="supplier" placeholder="공급사명" value={newProduct.supplier || ''} onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2 lg:col-span-2 flex items-end">
                    <Button onClick={handleAddProduct} size="lg" className="w-full h-11 text-base font-semibold">
                      <Plus className="mr-2 h-5 w-5" />제품 등록
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">주문 현황</CardTitle>
                <CardDescription className="text-base">최근 30일간 주문 데이터</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={orderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 13 }} />
                    <YAxis tick={{ fontSize: 13 }} />
                    <Tooltip contentStyle={{ fontSize: '14px' }} />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Line type="monotone" dataKey="orderCount" stroke="hsl(var(--primary))" name="주문 건수" strokeWidth={2} />
                    <Line type="monotone" dataKey="receivedCount" stroke="hsl(var(--success))" name="입고 건수" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchase" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">발주 내역</CardTitle>
                <CardDescription className="text-base">최근 발주 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 rounded-lg overflow-hidden">
                  <Table className="data-table">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold text-base">날짜</TableHead>
                        <TableHead className="font-bold text-base">공급사</TableHead>
                        <TableHead className="font-bold text-base">품목 수</TableHead>
                        <TableHead className="font-bold text-base">총 금액</TableHead>
                        <TableHead className="font-bold text-base">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseData.slice(0, 10).map((purchase, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-base">{purchase.date}</TableCell>
                          <TableCell className="text-base font-medium">{purchase.supplierName}</TableCell>
                          <TableCell className="text-base">{purchase.itemCount}</TableCell>
                          <TableCell className="text-base font-semibold">₩{purchase.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={purchase.status === '완료' ? 'default' : purchase.status === '진행중' ? 'secondary' : 'outline'} className="text-sm font-semibold px-3 py-1">
                              {purchase.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">재고 현황</CardTitle>
                  <CardDescription className="text-base">현재고 vs 안전재고</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={stockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 13 }} />
                      <Tooltip contentStyle={{ fontSize: '14px' }} />
                      <Legend wrapperStyle={{ fontSize: '14px' }} />
                      <Bar dataKey="현재고" fill="hsl(var(--primary))" />
                      <Bar dataKey="안전재고" fill="hsl(var(--warning))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">공급사별 제품 분포</CardTitle>
                  <CardDescription className="text-base">공급사별 제품 수</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={supplierChartData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={120} fill="hsl(var(--primary))" dataKey="value">
                        {supplierChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '14px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">제품 정보 수정</DialogTitle>
            <DialogDescription className="text-base">제품 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-productCode" className="text-base font-semibold">제품코드</Label>
                <Input id="edit-productCode" value={editingProduct.productCode} onChange={(e) => setEditingProduct({...editingProduct, productCode: e.target.value})} className="h-11 text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-productName" className="text-base font-semibold">제품명</Label>
                <Input id="edit-productName" value={editingProduct.productName} onChange={(e) => setEditingProduct({...editingProduct, productName: e.target.value})} className="h-11 text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currentStock" className="text-base font-semibold">현재고</Label>
                <Input id="edit-currentStock" type="number" value={editingProduct.currentStock} onChange={(e) => setEditingProduct({...editingProduct, currentStock: parseInt(e.target.value) || 0})} className="h-11 text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-safetyStock" className="text-base font-semibold">안전재고</Label>
                <Input id="edit-safetyStock" type="number" value={editingProduct.safetyStock} onChange={(e) => setEditingProduct({...editingProduct, safetyStock: parseInt(e.target.value) || 0})} className="h-11 text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unitPrice" className="text-base font-semibold">단가</Label>
                <Input id="edit-unitPrice" type="number" value={editingProduct.unitPrice} onChange={(e) => setEditingProduct({...editingProduct, unitPrice: parseInt(e.target.value) || 0})} className="h-11 text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier" className="text-base font-semibold">공급사</Label>
                <Input id="edit-supplier" value={editingProduct.supplier} onChange={(e) => setEditingProduct({...editingProduct, supplier: e.target.value})} className="h-11 text-base" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} size="lg" className="text-base">취소</Button>
            <Button onClick={saveEdit} size="lg" className="text-base font-semibold">저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">제품 삭제</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              정말로 이 제품을 삭제하시겠습니까?
              {deletingProduct && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold text-base text-foreground">{deletingProduct.productName}</p>
                  <p className="text-sm text-muted-foreground mt-1">제품코드: {deletingProduct.productCode}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base">취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base font-semibold">삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
