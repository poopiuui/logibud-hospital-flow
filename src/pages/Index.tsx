import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StockAlertSystem } from "@/components/StockAlertSystem";
import { ExcelAdvanced } from "@/components/ExcelAdvanced";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { QuotationGenerator } from "@/components/QuotationGenerator";
import { StockHistory } from "@/components/StockHistory";
import { PriceCardGenerator } from "@/components/PriceCardGenerator";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  ShoppingCart, 
  Search, 
  RefreshCw,
  Pencil,
  Trash2,
  Image as ImageIcon,
  QrCode,
  X,
  FileText,
  History,
  CreditCard,
  ArrowUpDown
} from "lucide-react";
import * as XLSX from 'xlsx';

interface Product {
  userCode: string;
  barcode: string;
  productCode: string;
  productName: string;
  currentStock: number;
  safetyStock: number;
  unitPrice: number;
  consumerPrice?: number;
  purchasePrice?: number;
  shippingPrice?: number;
  supplier: string;
  registeredDate: string;
  thumbnail?: string;
  images?: string[];
  category?: string;
}

const CATEGORIES = ['의료소모품', '주사기/바늘', '붕대/거즈', '보호구', '수액/주사액', '기타'];

const generateSampleProducts = (): Product[] => [
  { userCode: 'USER001', barcode: '8801234567890', productCode: 'A-001', productName: '주사기(5ml)', currentStock: 850, safetyStock: 1000, unitPrice: 150, consumerPrice: 200, purchasePrice: 120, shippingPrice: 180, supplier: '㈜메디칼', registeredDate: new Date().toISOString().split('T')[0], category: '주사기/바늘', images: ['/placeholder.svg'] },
  { userCode: 'USER002', barcode: '8801234567891', productCode: 'B-012', productName: '거즈 패드', currentStock: 2100, safetyStock: 2000, unitPrice: 80, consumerPrice: 100, purchasePrice: 60, shippingPrice: 90, supplier: '㈜헬스케어', registeredDate: new Date().toISOString().split('T')[0], category: '붕대/거즈', images: ['/placeholder.svg'] },
  { userCode: 'USER003', barcode: '8801234567892', productCode: 'C-045', productName: '일회용 장갑(M)', currentStock: 400, safetyStock: 5000, unitPrice: 50, consumerPrice: 70, purchasePrice: 40, shippingPrice: 60, supplier: '㈜메디칼', registeredDate: new Date().toISOString().split('T')[0], category: '보호구', images: ['/placeholder.svg'] },
  { userCode: 'USER004', barcode: '8801234567893', productCode: 'D-078', productName: '알코올 솜', currentStock: 8900, safetyStock: 10000, unitPrice: 30, consumerPrice: 40, purchasePrice: 25, shippingPrice: 35, supplier: '㈜의료용품', registeredDate: new Date().toISOString().split('T')[0], category: '의료소모품', images: ['/placeholder.svg'] },
  { userCode: 'USER005', barcode: '8801234567894', productCode: 'E-092', productName: '링거 세트', currentStock: 500, safetyStock: 1500, unitPrice: 2500, consumerPrice: 3000, purchasePrice: 2200, shippingPrice: 2800, supplier: '㈜메디텍', registeredDate: new Date().toISOString().split('T')[0], category: '수액/주사액', images: ['/placeholder.svg'] },
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>(generateSampleProducts());
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [qrCodeProduct, setQrCodeProduct] = useState<Product | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isPriceCardDialogOpen, setIsPriceCardDialogOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [priceCardProduct, setPriceCardProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const uniqueSuppliers = Array.from(new Set(products.map(p => p.supplier)));

  const getSelectedProductsData = () => {
    return products.filter(p => selectedProducts.includes(p.productCode));
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.productCode));
    }
  };

  const toggleSelectProduct = (productCode: string) => {
    setSelectedProducts(prev => 
      prev.includes(productCode)
        ? prev.filter(code => code !== productCode)
        : [...prev, productCode]
    );
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      const matchesSupplier = filterSupplier === "all" || product.supplier === filterSupplier;
      return matchesSearch && matchesCategory && matchesSupplier;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'stock':
          comparison = a.currentStock - b.currentStock;
          break;
        case 'price':
          comparison = a.unitPrice - b.unitPrice;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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

  const openQRDialog = (product: Product) => {
    setQrCodeProduct(product);
    setIsQRDialogOpen(true);
  };

  const openQuotationDialog = () => {
    if (selectedProducts.length === 0) {
      toast({ title: "상품을 선택하세요", description: "견적서를 생성할 상품을 선택해주세요.", variant: "destructive" });
      return;
    }
    setIsQuotationDialogOpen(true);
  };

  const openHistoryDialog = (product: Product) => {
    setHistoryProduct(product);
    setIsHistoryDialogOpen(true);
  };

  const openPriceCardDialog = (product: Product) => {
    setPriceCardProduct(product);
    setIsPriceCardDialogOpen(true);
  };

  return (
    <>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">상품 관리</h1>
            <p className="text-lg text-muted-foreground mt-2">물류 정보를 한눈에 확인하세요</p>
          </div>
          <div className="flex items-center gap-3">
            <ExcelAdvanced data={products} filename="products" />
            <RealtimeNotifications />
            <ThemeToggle />
            <Button onClick={() => window.history.back()} variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <StockAlertSystem products={products} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>총 제품 수</CardTitle>
                <Package className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products.length}</div>
              <p className="text-sm text-muted-foreground mt-1">등록된 제품</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>재고 부족</CardTitle>
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {products.filter(p => p.currentStock < p.safetyStock).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">주의 필요</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>총 재고 가치</CardTitle>
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₩{products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">현재 재고 기준</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>선택된 상품</CardTitle>
                <ShoppingCart className="h-6 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{selectedProducts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">선택된 항목</p>
            </CardContent>
          </Card>
        </div>

        {selectedProducts.length > 0 && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>선택된 상품 작업</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={openQuotationDialog} className="gap-2">
                <FileText className="h-4 w-4" />
                견적서 생성
              </Button>
              <Button 
                onClick={() => {
                  const selected = getSelectedProductsData();
                  if (selected.length === 1) {
                    openHistoryDialog(selected[0]);
                  } else {
                    toast({ title: "상품을 1개만 선택하세요", description: "입출고 내역은 한 번에 하나의 상품만 조회할 수 있습니다.", variant: "destructive" });
                  }
                }}
                variant="outline" 
                className="gap-2"
              >
                <History className="h-4 w-4" />
                입출고 내역
              </Button>
              <Button 
                onClick={() => {
                  const selected = getSelectedProductsData();
                  if (selected.length === 1) {
                    openPriceCardDialog(selected[0]);
                  } else {
                    toast({ title: "상품을 1개만 선택하세요", description: "프라이스카드는 한 번에 하나의 상품만 생성할 수 있습니다.", variant: "destructive" });
                  }
                }}
                variant="outline" 
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                프라이스카드 생성
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">제품 목록</CardTitle>
            <CardDescription>등록된 제품을 관리하고 조회합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="제품명 또는 코드로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px] h-12 text-base">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                <SelectTrigger className="w-[180px] h-12 text-base">
                  <SelectValue placeholder="공급사" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 공급사</SelectItem>
                  {uniqueSuppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[150px] h-12 text-base">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="stock">재고순</SelectItem>
                  <SelectItem value="price">가격순</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>

              <Button size="lg" className="gap-2 h-12" onClick={() => { setSearchTerm(""); setFilterCategory("all"); setFilterSupplier("all"); }}>
                <RefreshCw className="h-4 w-4" />
                초기화
              </Button>
            </div>

            <div className="border-2 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-bold text-base">제품코드</TableHead>
                    <TableHead className="font-bold text-base">제품명</TableHead>
                    <TableHead className="font-bold text-base">카테고리</TableHead>
                    <TableHead className="font-bold text-base">현재고</TableHead>
                    <TableHead className="font-bold text-base">안전재고</TableHead>
                    <TableHead className="font-bold text-base">소비자가</TableHead>
                    <TableHead className="font-bold text-base">매입단가</TableHead>
                    <TableHead className="font-bold text-base">출고가</TableHead>
                    <TableHead className="font-bold text-base">공급사</TableHead>
                    <TableHead className="font-bold text-base">상태</TableHead>
                    <TableHead className="font-bold text-base text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow 
                      key={product.productCode}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedProducts.includes(product.productCode)}
                          onCheckedChange={() => toggleSelectProduct(product.productCode)}
                        />
                      </TableCell>
                      <TableCell 
                        className="font-mono font-semibold cursor-pointer"
                        onClick={() => navigate(`/product/${product.productCode}`)}
                      >
                        {product.productCode}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => navigate(`/product/${product.productCode}`)}
                      >
                        <div className="flex items-center gap-3">
                          {product.thumbnail || (product.images && product.images[0]) ? (
                            <img src={product.thumbnail || product.images![0]} alt={product.productName} className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-semibold">{product.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.category || '미분류'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-base">{product.currentStock.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-base">{product.safetyStock.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-base">₩{product.consumerPrice?.toLocaleString() || '-'}</TableCell>
                      <TableCell className="font-medium text-base">₩{product.purchasePrice?.toLocaleString() || '-'}</TableCell>
                      <TableCell className="font-medium text-base">₩{product.shippingPrice?.toLocaleString() || '-'}</TableCell>
                      <TableCell className="text-base">{product.supplier}</TableCell>
                      <TableCell>
                        <Badge variant={product.currentStock < product.safetyStock ? "destructive" : "default"}>
                          {product.currentStock < product.safetyStock ? "부족" : "정상"}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openQRDialog(product)}
                            title="QR 코드"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            title="수정"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(product)}
                            title="삭제"
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
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>제품 수정</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>제품코드</Label>
                <Input value={editingProduct.productCode} disabled />
              </div>
              <div className="space-y-2">
                <Label>제품명</Label>
                <Input
                  value={editingProduct.productName}
                  onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select
                  value={editingProduct.category}
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>현재고</Label>
                <Input
                  type="number"
                  value={editingProduct.currentStock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>안전재고</Label>
                <Input
                  type="number"
                  value={editingProduct.safetyStock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, safetyStock: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>소비자가</Label>
                <Input
                  type="number"
                  value={editingProduct.consumerPrice || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, consumerPrice: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>매입단가</Label>
                <Input
                  type="number"
                  value={editingProduct.purchasePrice || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, purchasePrice: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>출고가</Label>
                <Input
                  type="number"
                  value={editingProduct.shippingPrice || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shippingPrice: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>공급사</Label>
                <Input
                  value={editingProduct.supplier}
                  onChange={(e) => setEditingProduct({ ...editingProduct, supplier: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>취소</Button>
            <Button onClick={saveEdit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>제품 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingProduct?.productName}을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Dialog */}
      {qrCodeProduct && (
        <QRCodeGenerator
          productCode={qrCodeProduct.productCode}
          productName={qrCodeProduct.productName}
          isOpen={isQRDialogOpen}
          onClose={() => setIsQRDialogOpen(false)}
        />
      )}

      {/* Quotation Dialog */}
      <QuotationGenerator
        products={getSelectedProductsData()}
        isOpen={isQuotationDialogOpen}
        onClose={() => setIsQuotationDialogOpen(false)}
      />

      {/* Stock History Dialog */}
      {historyProduct && (
        <StockHistory
          productName={historyProduct.productName}
          productCode={historyProduct.productCode}
          isOpen={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
        />
      )}

      {/* Price Card Dialog */}
      {priceCardProduct && (
        <PriceCardGenerator
          productCode={priceCardProduct.productCode}
          productName={priceCardProduct.productName}
          barcode={priceCardProduct.barcode}
          unitPrice={priceCardProduct.unitPrice}
          isOpen={isPriceCardDialogOpen}
          onClose={() => setIsPriceCardDialogOpen(false)}
        />
      )}
    </>
  );
};

export default Index;
