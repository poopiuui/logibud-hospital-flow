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
  TrendingUp,
  FileSpreadsheet,
  Pencil,
  Trash2
} from "lucide-react";
import * as XLSX from 'xlsx';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Types
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

// Sample data generator
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
      itemCount: Math.floor(Math.random() * 9) + 1,
      totalAmount: Math.floor(Math.random() * 1400000) + 100000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return data;
};

const Index = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(generateSampleProducts());
  const [orderData] = useState<OrderData[]>(generateOrderData());
  const [purchaseData] = useState<PurchaseData[]>(generatePurchaseData());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const { toast } = useToast();

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    userCode: '',
    barcode: '',
    productCode: '',
    productName: '',
    currentStock: 0,
    safetyStock: 0,
    unitPrice: 0,
    supplier: '',
  });

  // Edit and delete states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Calculate metrics
  const totalItems = products.length;
  const lowStockItems = products.filter(p => p.currentStock < p.safetyStock).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
  const todayOrders = orderData[orderData.length - 1]?.orderCount || 0;

  // Filter products
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (searchType === "userCode") return product.userCode.toLowerCase().includes(query);
    if (searchType === "barcode") return product.barcode.includes(query);
    if (searchType === "productName") return product.productName.toLowerCase().includes(query);
    
    return (
      product.userCode.toLowerCase().includes(query) ||
      product.barcode.includes(query) ||
      product.productName.toLowerCase().includes(query)
    );
  });

  // Generate codes
  const generateUserCode = () => {
    const code = 'USER' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setNewProduct({ ...newProduct, userCode: code });
    toast({ title: "사용자코드 생성됨", description: code });
  };

  const generateBarcode = () => {
    const code = '88' + Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
    setNewProduct({ ...newProduct, barcode: code });
    toast({ title: "바코드 생성됨", description: code });
  };

  // Add product
  const addProduct = () => {
    if (!newProduct.userCode || !newProduct.barcode || !newProduct.productCode || !newProduct.productName) {
      toast({ title: "오류", description: "필수 항목을 모두 입력해주세요!", variant: "destructive" });
      return;
    }

    const product: Product = {
      userCode: newProduct.userCode,
      barcode: newProduct.barcode,
      productCode: newProduct.productCode,
      productName: newProduct.productName,
      currentStock: newProduct.currentStock || 0,
      safetyStock: newProduct.safetyStock || 0,
      unitPrice: newProduct.unitPrice || 0,
      supplier: newProduct.supplier || '',
      registeredDate: new Date().toISOString().split('T')[0],
    };

    setProducts([...products, product]);
    setNewProduct({
      userCode: '',
      barcode: '',
      productCode: '',
      productName: '',
      currentStock: 0,
      safetyStock: 0,
      unitPrice: 0,
      supplier: '',
    });
    toast({ title: "성공", description: `상품 '${product.productName}'이(가) 등록되었습니다!` });
  };

  // Excel template download
  const downloadTemplate = () => {
    const templateData = [
      {
        '사용자코드': 'USER001',
        '바코드': '8801234567890',
        '품목코드': 'A-001',
        '품목명': '예시상품1',
        '현재수량': 100,
        '안전재고': 150,
        '단가': 1000,
        '공급업체': '㈜예시업체1'
      },
      {
        '사용자코드': 'USER002',
        '바코드': '8801234567891',
        '품목코드': 'B-012',
        '품목명': '예시상품2',
        '현재수량': 200,
        '안전재고': 250,
        '단가': 2000,
        '공급업체': '㈜예시업체2'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '상품목록');
    XLSX.writeFile(wb, `상품등록_템플릿_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({ title: "다운로드 완료", description: "템플릿 파일이 다운로드되었습니다." });
  };

  // Export current products
  const exportProducts = () => {
    const exportData = products.map(p => ({
      '사용자코드': p.userCode,
      '바코드': p.barcode,
      '품목코드': p.productCode,
      '품목명': p.productName,
      '현재수량': p.currentStock,
      '안전재고': p.safetyStock,
      '단가': p.unitPrice,
      '공급업체': p.supplier,
      '등록일': p.registeredDate,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '상품목록');
    XLSX.writeFile(wb, `상품목록_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({ title: "내보내기 완료", description: `${products.length}개 상품이 내보내기되었습니다.` });
  };

  // Import from Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newProducts: Product[] = jsonData.map((row: any) => ({
          userCode: row['사용자코드'] || '',
          barcode: row['바코드'] || '',
          productCode: row['품목코드'] || '',
          productName: row['품목명'] || '',
          currentStock: Number(row['현재수량']) || 0,
          safetyStock: Number(row['안전재고']) || 0,
          unitPrice: Number(row['단가']) || 0,
          supplier: row['공급업체'] || '',
          registeredDate: new Date().toISOString().split('T')[0],
        }));

        setProducts([...products, ...newProducts]);
        toast({ title: "대량 등록 완료", description: `${newProducts.length}개 상품이 등록되었습니다!` });
      } catch (error) {
        toast({ title: "오류", description: "파일 처리 중 오류가 발생했습니다.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Edit product
  const openEditDialog = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (!editingProduct) return;

    if (!editingProduct.userCode || !editingProduct.barcode || !editingProduct.productCode || !editingProduct.productName) {
      toast({ title: "오류", description: "필수 항목을 모두 입력해주세요!", variant: "destructive" });
      return;
    }

    setProducts(products.map(p => 
      p.barcode === editingProduct.barcode ? editingProduct : p
    ));
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast({ title: "수정 완료", description: `상품 '${editingProduct.productName}'이(가) 수정되었습니다.` });
  };

  // Delete product
  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingProduct) return;

    setProducts(products.filter(p => p.barcode !== deletingProduct.barcode));
    setIsDeleteDialogOpen(false);
    toast({ title: "삭제 완료", description: `상품 '${deletingProduct.productName}'이(가) 삭제되었습니다.` });
    setDeletingProduct(null);
  };

  // Chart colors
  const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-8 px-6 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              🏥 로지붓 - 병원 물류 ERP 시스템
            </h1>
            <p className="text-primary-foreground/90 mt-2">Hospital Logistics Management System</p>
          </div>
          <Button 
            onClick={() => navigate('/analytics')} 
            variant="secondary"
            size="lg"
            className="gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            분석 대시보드
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 품목 수</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalItems}개</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">재고 부족 품목</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{lowStockItems}개</div>
              <p className="text-xs text-muted-foreground mt-1">안전재고 미만</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 재고 금액</CardTitle>
              <DollarSign className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{totalInventoryValue.toLocaleString()}원</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">오늘 발주 건수</CardTitle>
              <ShoppingCart className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{todayOrders}건</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="products" className="flex items-center gap-2 py-3">
              <Package className="h-4 w-4" />
              상품 관리
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              재고 관리
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 py-3">
              <ShoppingCart className="h-4 w-4" />
              주문 조회
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2 py-3">
              <TrendingUp className="h-4 w-4" />
              매입 관리
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Excel Upload Section */}
            <Card className="border-2 border-dashed border-primary/30 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  엑셀로 대량 등록
                </CardTitle>
                <CardDescription>
                  템플릿을 다운로드하고 작성한 후 업로드하여 여러 상품을 한번에 등록하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={downloadTemplate} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    템플릿 다운로드
                  </Button>
                  <Button onClick={exportProducts} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    현재 목록 내보내기
                  </Button>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button variant="default" className="w-full pointer-events-none">
                      <Upload className="mr-2 h-4 w-4" />
                      엑셀 파일 업로드
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Product Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  개별 상품 등록
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>사용자코드</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newProduct.userCode}
                        onChange={(e) => setNewProduct({ ...newProduct, userCode: e.target.value })}
                        placeholder="USER001"
                      />
                      <Button onClick={generateUserCode} variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>바코드</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newProduct.barcode}
                        onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                        placeholder="8801234567890"
                      />
                      <Button onClick={generateBarcode} variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>품목코드 *</Label>
                    <Input
                      value={newProduct.productCode}
                      onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                      placeholder="A-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>품목명 *</Label>
                    <Input
                      value={newProduct.productName}
                      onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                      placeholder="주사기(5ml)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>단가(원)</Label>
                    <Input
                      type="number"
                      value={newProduct.unitPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, unitPrice: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>공급업체</Label>
                    <Input
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                      placeholder="㈜메디칼"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>현재수량</Label>
                    <Input
                      type="number"
                      value={newProduct.currentStock}
                      onChange={(e) => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>안전재고</Label>
                    <Input
                      type="number"
                      value={newProduct.safetyStock}
                      onChange={(e) => setNewProduct({ ...newProduct, safetyStock: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button onClick={addProduct} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  상품 등록
                </Button>
              </CardContent>
            </Card>

            {/* Search and Product List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  상품 검색 및 관리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="userCode">사용자코드</SelectItem>
                      <SelectItem value="barcode">바코드</SelectItem>
                      <SelectItem value="productName">품목명</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="검색할 내용을 입력하세요"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-[500px]">
                    <Table>
                      <TableHeader className="bg-muted sticky top-0">
                        <TableRow>
                          <TableHead>사용자코드</TableHead>
                          <TableHead>바코드</TableHead>
                          <TableHead>품목코드</TableHead>
                          <TableHead>품목명</TableHead>
                          <TableHead className="text-right">현재수량</TableHead>
                          <TableHead className="text-right">안전재고</TableHead>
                          <TableHead className="text-right">단가</TableHead>
                          <TableHead>공급업체</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead className="text-center">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">{product.userCode}</TableCell>
                            <TableCell className="font-mono text-xs">{product.barcode}</TableCell>
                            <TableCell className="font-mono text-xs">{product.productCode}</TableCell>
                            <TableCell className="font-medium">{product.productName}</TableCell>
                            <TableCell className="text-right">{product.currentStock.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{product.safetyStock.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{product.unitPrice.toLocaleString()}원</TableCell>
                            <TableCell>{product.supplier}</TableCell>
                            <TableCell>
                              <Badge variant={product.currentStock < product.safetyStock ? "destructive" : "default"}>
                                {product.currentStock < product.safetyStock ? '부족' : '정상'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditDialog(product)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openDeleteDialog(product)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">총 {filteredProducts.length}개 상품</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>재고 상태 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '정상', value: products.filter(p => p.currentStock >= p.safetyStock).length },
                          { name: '부족', value: lowStockItems }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}개`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>재고 알림</CardTitle>
                  <CardDescription>안전재고 미만 품목</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {products.filter(p => p.currentStock < p.safetyStock).map((product, index) => (
                      <div key={index} className="p-3 border border-destructive/30 rounded-lg bg-destructive/5">
                        <div className="font-medium text-destructive">{product.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          부족: {(product.safetyStock - product.currentStock).toLocaleString()}개 | 
                          바코드: {product.barcode}
                        </div>
                      </div>
                    ))}
                    {lowStockItems === 0 && (
                      <div className="text-center py-8 text-success">
                        <div className="text-4xl mb-2">✅</div>
                        <div className="font-medium">모든 품목이 안전재고 이상입니다!</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>재고 금액 TOP 5</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={products
                    .map(p => ({ ...p, inventoryValue: p.currentStock * p.unitPrice }))
                    .sort((a, b) => b.inventoryValue - a.inventoryValue)
                    .slice(0, 5)
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                    <Bar dataKey="inventoryValue" fill="hsl(var(--primary))" name="재고금액" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>일별 발주/입고 건수 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={orderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orderCount" stroke="hsl(var(--primary))" name="발주 건수" strokeWidth={2} />
                    <Line type="monotone" dataKey="receivedCount" stroke="hsl(var(--accent))" name="입고 건수" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>일별 발주/입고 금액 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={orderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                    <Legend />
                    <Bar dataKey="orderAmount" fill="hsl(var(--primary))" name="발주 금액" />
                    <Bar dataKey="receivedAmount" fill="hsl(var(--accent))" name="입고 금액" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">총 발주 건수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {orderData.reduce((sum, d) => sum + d.orderCount, 0)}건
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">총 입고 건수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {orderData.reduce((sum, d) => sum + d.receivedCount, 0)}건
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">평균 발주 금액</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">
                    {Math.round(orderData.reduce((sum, d) => sum + d.orderAmount, 0) / orderData.length).toLocaleString()}원
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Purchase Tab */}
          <TabsContent value="purchase" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>업체별 총 매입 금액</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={
                      Object.entries(
                        purchaseData.reduce((acc, p) => {
                          acc[p.supplierName] = (acc[p.supplierName] || 0) + p.totalAmount;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                      .map(([name, amount]) => ({ name, amount }))
                      .sort((a, b) => b.amount - a.amount)
                    }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                      <Bar dataKey="amount" fill="hsl(var(--success))" name="총 매입 금액" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>매입 상태 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          purchaseData.reduce((acc, p) => {
                            acc[p.status] = (acc[p.status] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}건`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {['완료', '진행중', '대기'].map((status, index) => (
                          <Cell key={`cell-${index}`} fill={
                            status === '완료' ? 'hsl(var(--success))' :
                            status === '진행중' ? 'hsl(var(--warning))' :
                            'hsl(var(--muted))'
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>최근 매입 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>날짜</TableHead>
                        <TableHead>업체명</TableHead>
                        <TableHead className="text-right">품목 수</TableHead>
                        <TableHead className="text-right">총액</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseData.slice(-10).reverse().map((purchase, index) => (
                        <TableRow key={index}>
                          <TableCell>{purchase.date}</TableCell>
                          <TableCell>{purchase.supplierName}</TableCell>
                          <TableCell className="text-right">{purchase.itemCount}개</TableCell>
                          <TableCell className="text-right">{purchase.totalAmount.toLocaleString()}원</TableCell>
                          <TableCell>
                            <Badge variant={
                              purchase.status === '완료' ? 'default' :
                              purchase.status === '진행중' ? 'secondary' :
                              'outline'
                            }>
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
        </Tabs>
      </div>

      {/* Footer */}
      <div className="bg-muted py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>🏥 로지붓 - 병원 물류 ERP 시스템 v3.0 | 엑셀 대량 등록 지원</p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              상품 수정
            </DialogTitle>
            <DialogDescription>
              상품 정보를 수정하세요
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>사용자코드 *</Label>
                  <Input
                    value={editingProduct.userCode}
                    onChange={(e) => setEditingProduct({ ...editingProduct, userCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>바코드 *</Label>
                  <Input
                    value={editingProduct.barcode}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">바코드는 수정할 수 없습니다</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>품목코드 *</Label>
                  <Input
                    value={editingProduct.productCode}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>품목명 *</Label>
                  <Input
                    value={editingProduct.productName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>현재수량</Label>
                  <Input
                    type="number"
                    value={editingProduct.currentStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>안전재고</Label>
                  <Input
                    type="number"
                    value={editingProduct.safetyStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, safetyStock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>단가(원)</Label>
                  <Input
                    type="number"
                    value={editingProduct.unitPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>공급업체</Label>
                  <Input
                    value={editingProduct.supplier}
                    onChange={(e) => setEditingProduct({ ...editingProduct, supplier: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={saveEdit}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              상품 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingProduct && (
                <div className="space-y-2">
                  <p>다음 상품을 정말 삭제하시겠습니까?</p>
                  <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                    <div><span className="font-medium">품목명:</span> {deletingProduct.productName}</div>
                    <div><span className="font-medium">바코드:</span> {deletingProduct.barcode}</div>
                    <div><span className="font-medium">품목코드:</span> {deletingProduct.productCode}</div>
                  </div>
                  <p className="text-destructive font-medium">이 작업은 되돌릴 수 없습니다.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
