import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Download, ChevronDown, X, Trash2, FileDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { CommonFilters } from "@/components/CommonFilters";
import { PurchaseRegistrationDialog } from "@/components/PurchaseRegistrationDialog";
import { exportToFormattedExcel, exportToCSV, exportToPDF } from "@/lib/excelUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PurchaseManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch purchases from Supabase
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_items (*),
          suppliers (business_name)
        `)
        .order('purchase_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch products for selection
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('business_name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  const toggleSelectAll = () => {
    if (selectedPurchases.length === filteredPurchases.length) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(filteredPurchases.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPurchases(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    toast({
      title: "일괄 삭제",
      description: `${selectedPurchases.length}개 항목이 삭제되었습니다.`
    });
    setSelectedPurchases([]);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleExcelDownload = (filtered: boolean = false) => {
    const dataToExport = filtered ? filteredPurchases : purchases;
    const exportData = dataToExport.map(p => ({
      '매입번호': p.purchase_number,
      '매입처': p.suppliers?.business_name || '',
      '매입일': new Date(p.purchase_date).toLocaleDateString(),
      '유형': p.purchase_type === 'manufacturer' ? '제조사' : '반품',
      '상태': p.status,
      '총액': p.total_amount
    }));
    
    exportToFormattedExcel({
      data: exportData,
      filename: `매입관리_${filtered ? '필터링' : '전체'}_데이터`,
      sheetName: '매입관리'
    });
  };

  const handleCSVDownload = (filtered: boolean = false) => {
    const dataToExport = filtered ? filteredPurchases : purchases;
    const exportData = dataToExport.map(p => ({
      '매입번호': p.purchase_number,
      '매입처': p.suppliers?.business_name || '',
      '매입일': new Date(p.purchase_date).toLocaleDateString(),
      '유형': p.purchase_type === 'manufacturer' ? '제조사' : '반품',
      '상태': p.status,
      '총액': p.total_amount
    }));
    
    exportToCSV(exportData, `매입관리_${filtered ? '필터링' : '전체'}_데이터`);
  };

  const handlePDFDownload = (filtered: boolean = false) => {
    const dataToExport = filtered ? filteredPurchases : purchases;
    const exportData = dataToExport.map(p => ({
      '매입번호': p.purchase_number,
      '매입처': p.suppliers?.business_name || '',
      '매입일': new Date(p.purchase_date).toLocaleDateString(),
      '유형': p.purchase_type === 'manufacturer' ? '제조사' : '반품',
      '상태': p.status,
      '총액': p.total_amount
    }));
    
    exportToPDF(exportData, `매입관리_${filtered ? '필터링' : '전체'}_데이터`, '매입 관리');
  };

  const availableYears = Array.from(new Set(purchases.map(p => new Date(p.purchase_date).getFullYear()))).sort((a, b) => b - a);
  const availableMonths = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const filteredPurchases = purchases
    .filter(purchase => {
      const supplierName = purchase.suppliers?.business_name || '';
      const matchesSearch = supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          purchase.purchase_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const purchaseDate = new Date(purchase.purchase_date);
      const matchesYear = yearFilter === "all" || purchaseDate.getFullYear().toString() === yearFilter;
      const matchesMonth = monthFilter === "all" || (purchaseDate.getMonth() + 1).toString() === monthFilter;
      const matchesType = typeFilter === "all" || purchase.purchase_type === typeFilter;
      
      return matchesSearch && matchesYear && matchesMonth && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.purchase_date).getTime();
      const dateB = new Date(b.purchase_date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">매입 관리</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowRegistrationDialog(true)} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            매입 등록
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                전체 다운로드
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCSVDownload(false)}>
                <FileDown className="mr-2 h-4 w-4" />
                CSV로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExcelDownload(false)}>
                <FileDown className="mr-2 h-4 w-4" />
                Excel로 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePDFDownload(false)}>
                <FileDown className="mr-2 h-4 w-4" />
                PDF로 다운로드
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => window.history.back()} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>매입 내역</CardTitle>
          <CardDescription>최신순으로 매입 내역을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <CommonFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="매입처, 매입번호로 검색..."
              yearFilter={yearFilter}
              onYearChange={setYearFilter}
              availableYears={availableYears}
              monthFilter={monthFilter}
              onMonthChange={setMonthFilter}
              availableMonths={availableMonths}
              sortOrder={sortOrder}
              onSortToggle={toggleSortOrder}
            />
          </div>

          {selectedPurchases.length > 0 && (
            <div className="bg-muted p-4 rounded-lg mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">{selectedPurchases.length}개 항목 선택됨</span>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPurchases.length === filteredPurchases.length && filteredPurchases.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>매입번호</TableHead>
                  <TableHead>매입처</TableHead>
                  <TableHead>매입일</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">총액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchasesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      로딩중...
                    </TableCell>
                  </TableRow>
                ) : filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      매입 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPurchases.includes(purchase.id)}
                          onCheckedChange={() => toggleSelect(purchase.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{purchase.purchase_number}</TableCell>
                      <TableCell>{purchase.suppliers?.business_name || '-'}</TableCell>
                      <TableCell>{new Date(purchase.purchase_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={purchase.purchase_type === 'manufacturer' ? 'default' : 'secondary'}>
                          {purchase.purchase_type === 'manufacturer' ? '제조사' : '반품'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={purchase.status === '완료' ? 'outline' : 'default'}>
                          {purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {purchase.total_amount?.toLocaleString() || 0}원
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PurchaseRegistrationDialog
        open={showRegistrationDialog}
        onClose={() => setShowRegistrationDialog(false)}
        products={products}
        suppliers={suppliers}
      />
    </div>
  );
};

export default PurchaseManagement;
