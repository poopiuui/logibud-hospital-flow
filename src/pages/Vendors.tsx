import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, X, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface Vendor {
  id: string;
  code: string;
  type: '매입처' | '매출처';
  businessName: string;
  businessNumber: string;
  contactName: string;
  contactPhone: string;
  faxNumber: string;
  paymentDate: string;
  paymentMethod: string;
  bankAccount: string;
  invoiceEmail: string;
  salesRep?: string;
  logisticsManager?: string;
}

const Vendors = () => {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: '1',
      code: 'V-001',
      type: '매입처',
      businessName: '(주)글로벌물류',
      businessNumber: '123-45-67890',
      contactName: '김철수',
      contactPhone: '010-1234-5678',
      faxNumber: '02-1234-5678',
      paymentDate: '매월 말일',
      paymentMethod: '계좌이체',
      bankAccount: '국민 123-456-789012',
      invoiceEmail: 'vendor1@example.com',
      salesRep: '김영업',
      logisticsManager: '김물류'
    },
    {
      id: '2',
      code: 'C-001',
      type: '매출처',
      businessName: '스마트마켓',
      businessNumber: '098-76-54321',
      contactName: '이영희',
      contactPhone: '010-9876-5432',
      faxNumber: '02-9876-5432',
      paymentDate: '익월 15일',
      paymentMethod: '현금',
      bankAccount: '신한 987-654-321098',
      invoiceEmail: 'customer1@example.com',
      salesRep: '이영업',
      logisticsManager: '이물류'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [vendorType, setVendorType] = useState<'매입처' | '매출처'>('매입처');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    businessName: '',
    businessNumber: '',
    contactName: '',
    contactPhone: '',
    faxNumber: '',
    paymentDate: '',
    paymentMethod: '',
    bankAccount: '',
    invoiceEmail: '',
    salesRep: '',
    logisticsManager: ''
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const generateCode = (type: '매입처' | '매출처') => {
    const prefix = type === '매입처' ? 'V' : 'C';
    const existingCodes = vendors
      .filter(v => v.type === type)
      .map(v => parseInt(v.code.split('-')[1]))
      .filter(n => !isNaN(n));
    const maxNum = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const handleViewDetail = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDetailOpen(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (selectedVendor) {
      setFormData({
        businessName: selectedVendor.businessName,
        businessNumber: selectedVendor.businessNumber,
        contactName: selectedVendor.contactName,
        contactPhone: selectedVendor.contactPhone,
        faxNumber: selectedVendor.faxNumber,
        paymentDate: selectedVendor.paymentDate,
        paymentMethod: selectedVendor.paymentMethod,
        bankAccount: selectedVendor.bankAccount,
        invoiceEmail: selectedVendor.invoiceEmail,
        salesRep: selectedVendor.salesRep || '',
        logisticsManager: selectedVendor.logisticsManager || ''
      });
      setVendorType(selectedVendor.type);
      setIsEditing(true);
    }
  };

  const handleEditSelected = () => {
    if (selectedVendors.length === 1) {
      const vendor = vendors.find(v => v.id === selectedVendors[0]);
      if (vendor) {
        setSelectedVendor(vendor);
        setFormData({
          businessName: vendor.businessName,
          businessNumber: vendor.businessNumber,
          contactName: vendor.contactName,
          contactPhone: vendor.contactPhone,
          faxNumber: vendor.faxNumber,
          paymentDate: vendor.paymentDate,
          paymentMethod: vendor.paymentMethod,
          bankAccount: vendor.bankAccount,
          invoiceEmail: vendor.invoiceEmail,
          salesRep: vendor.salesRep || '',
          logisticsManager: vendor.logisticsManager || ''
        });
        setVendorType(vendor.type);
        setIsEditing(true);
        setIsDetailOpen(true);
      }
    } else if (selectedVendors.length > 1) {
      toast({
        title: "알림",
        description: "한 개의 거래처만 선택하여 수정할 수 있습니다.",
        variant: "destructive"
      });
    }
  };

  const handleSaveEdit = () => {
    if (!selectedVendor) return;
    
    setVendors(vendors.map(v =>
      v.id === selectedVendor.id ? { ...selectedVendor, ...formData, type: vendorType } : v
    ));
    
    toast({
      title: "수정 완료",
      description: `${formData.businessName}의 정보가 수정되었습니다.`
    });
    
    setIsEditing(false);
    setIsDetailOpen(false);
    setSelectedVendors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVendor: Vendor = {
      id: Date.now().toString(),
      code: generateCode(vendorType),
      type: vendorType,
      ...formData,
      salesRep: formData.salesRep,
      logisticsManager: formData.logisticsManager
    };
    setVendors([...vendors, newVendor]);
    setIsDialogOpen(false);
    setFormData({
      businessName: '',
      businessNumber: '',
      contactName: '',
      contactPhone: '',
      faxNumber: '',
      paymentDate: '',
      paymentMethod: '',
      bankAccount: '',
      invoiceEmail: '',
      salesRep: '',
      logisticsManager: ''
    });
    toast({
      title: "등록 완료",
      description: `${vendorType}가 성공적으로 등록되었습니다.`
    });
  };

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(vendors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "매입매출처");
    XLSX.writeFile(wb, "매입매출처_데이터.xlsx");
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">매입/매출처 관리</h1>
          <p className="text-muted-foreground">거래처 정보를 관리합니다</p>
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>거래처 목록</CardTitle>
              <CardDescription>등록된 매입처와 매출처를 확인하고 관리하세요</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedVendors.length > 0 && (
                <Button onClick={handleEditSelected} variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  정보수정 ({selectedVendors.length}개)
                </Button>
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    거래처 등록
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>거래처 등록</DialogTitle>
                  <DialogDescription>새로운 거래처 정보를 입력하세요</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>거래처 유형</Label>
                    <Select value={vendorType} onValueChange={(value: '매입처' | '매출처') => setVendorType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="매입처">매입처</SelectItem>
                        <SelectItem value="매출처">매출처</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>사업자명</Label>
                      <Input
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>사업자번호</Label>
                      <Input
                        required
                        value={formData.businessNumber}
                        onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>담당자명</Label>
                      <Input
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>담당자 전화번호</Label>
                      <Input
                        required
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>팩스번호</Label>
                      <Input
                        value={formData.faxNumber}
                        onChange={(e) => setFormData({ ...formData, faxNumber: e.target.value })}
                        placeholder="02-1234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>결제일</Label>
                      <Input
                        required
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>결제방법</Label>
                      <Input
                        required
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>통장번호</Label>
                      <Input
                        required
                        value={formData.bankAccount}
                        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>계산서 발행 메일주소</Label>
                      <Input
                        required
                        type="email"
                        value={formData.invoiceEmail}
                        onChange={(e) => setFormData({ ...formData, invoiceEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>물류 출고담당</Label>
                      <Input
                        value={formData.logisticsManager}
                        onChange={(e) => setFormData({ ...formData, logisticsManager: e.target.value })}
                        placeholder="담당자명"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      취소
                    </Button>
                    <Button type="submit">등록</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="거래처명, 코드, 담당자로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="매입처">매입처</TabsTrigger>
              <TabsTrigger value="매출처">매출처</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedVendors(filteredVendors.map(v => v.id));
                          } else {
                            setSelectedVendors([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-base">코드</TableHead>
                    <TableHead className="text-base">유형</TableHead>
                    <TableHead className="text-base">사업자명</TableHead>
                    <TableHead className="text-base">담당자</TableHead>
                    <TableHead className="text-base">연락처</TableHead>
                    <TableHead className="text-base">결제방법</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-muted/50">
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedVendors.includes(vendor.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedVendors([...selectedVendors, vendor.id]);
                            } else {
                              setSelectedVendors(selectedVendors.filter(id => id !== vendor.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-base cursor-pointer" onClick={() => handleViewDetail(vendor)}>{vendor.code}</TableCell>
                      <TableCell className="text-base cursor-pointer" onClick={() => handleViewDetail(vendor)}>
                        <Badge variant={vendor.type === '매입처' ? 'default' : 'secondary'}>{vendor.type}</Badge>
                      </TableCell>
                      <TableCell className="text-base cursor-pointer" onClick={() => handleViewDetail(vendor)}>{vendor.businessName}</TableCell>
                      <TableCell className="text-base cursor-pointer" onClick={() => handleViewDetail(vendor)}>{vendor.contactName}</TableCell>
                      <TableCell className="text-base cursor-pointer" onClick={() => handleViewDetail(vendor)}>{vendor.contactPhone}</TableCell>
                      <TableCell className="text-base cursor-pointer" onClick={() => handleViewDetail(vendor)}>{vendor.paymentMethod}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="매입처">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base">코드</TableHead>
                    <TableHead className="text-base">사업자명</TableHead>
                    <TableHead className="text-base">사업자번호</TableHead>
                    <TableHead className="text-base">담당자</TableHead>
                    <TableHead className="text-base">연락처</TableHead>
                    <TableHead className="text-base">팩스</TableHead>
                    <TableHead className="text-base">결제일</TableHead>
                    <TableHead className="text-base">결제방법</TableHead>
                    <TableHead className="text-base">물류 출고담당</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.filter(v => v.type === '매입처').map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium text-base">{vendor.code}</TableCell>
                      <TableCell className="text-base">{vendor.businessName}</TableCell>
                      <TableCell className="text-base">{vendor.businessNumber}</TableCell>
                      <TableCell className="text-base">{vendor.contactName}</TableCell>
                      <TableCell className="text-base">{vendor.contactPhone}</TableCell>
                      <TableCell className="text-base">{vendor.faxNumber || '-'}</TableCell>
                      <TableCell className="text-base">{vendor.paymentDate}</TableCell>
                      <TableCell className="text-base">{vendor.paymentMethod}</TableCell>
                      <TableCell className="text-base">
                        <Badge variant="secondary">{vendor.logisticsManager || '-'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="매출처">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base">코드</TableHead>
                    <TableHead className="text-base">사업자명</TableHead>
                    <TableHead className="text-base">사업자번호</TableHead>
                    <TableHead className="text-base">담당자</TableHead>
                    <TableHead className="text-base">연락처</TableHead>
                    <TableHead className="text-base">팩스</TableHead>
                    <TableHead className="text-base">결제일</TableHead>
                    <TableHead className="text-base">결제방법</TableHead>
                    <TableHead className="text-base">물류 출고담당</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.filter(v => v.type === '매출처').map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium text-base">{vendor.code}</TableCell>
                      <TableCell className="text-base">{vendor.businessName}</TableCell>
                      <TableCell className="text-base">{vendor.businessNumber}</TableCell>
                      <TableCell className="text-base">{vendor.contactName}</TableCell>
                      <TableCell className="text-base">{vendor.contactPhone}</TableCell>
                      <TableCell className="text-base">{vendor.faxNumber || '-'}</TableCell>
                      <TableCell className="text-base">{vendor.paymentDate}</TableCell>
                      <TableCell className="text-base">{vendor.paymentMethod}</TableCell>
                      <TableCell className="text-base">
                        <Badge variant="secondary">{vendor.logisticsManager || '-'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail/Edit Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? '거래처 수정' : '거래처 상세정보'}</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>코드</Label>
                  <Input value={selectedVendor.code} disabled />
                </div>
                <div>
                  <Label>구분</Label>
                  <Input value={selectedVendor.type} disabled />
                </div>
                <div className="col-span-2">
                  <Label>사업자명</Label>
                  <Input 
                    value={isEditing ? formData.businessName : selectedVendor.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>사업자번호</Label>
                  <Input 
                    value={isEditing ? formData.businessNumber : selectedVendor.businessNumber}
                    onChange={(e) => setFormData({...formData, businessNumber: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>담당자명</Label>
                  <Input 
                    value={isEditing ? formData.contactName : selectedVendor.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>담당자 전화번호</Label>
                  <Input 
                    value={isEditing ? formData.contactPhone : selectedVendor.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>팩스번호</Label>
                  <Input 
                    value={isEditing ? formData.faxNumber : selectedVendor.faxNumber}
                    onChange={(e) => setFormData({...formData, faxNumber: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>결제일</Label>
                  <Input 
                    value={isEditing ? formData.paymentDate : selectedVendor.paymentDate}
                    onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>결제방법</Label>
                  <Input 
                    value={isEditing ? formData.paymentMethod : selectedVendor.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-span-2">
                  <Label>통장번호</Label>
                  <Input 
                    value={isEditing ? formData.bankAccount : selectedVendor.bankAccount}
                    onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-span-2">
                  <Label>계산서 발행 메일주소</Label>
                  <Input 
                    value={isEditing ? formData.invoiceEmail : selectedVendor.invoiceEmail}
                    onChange={(e) => setFormData({...formData, invoiceEmail: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-span-2">
                  <Label>물류 출고담당</Label>
                  <Input 
                    value={isEditing ? formData.logisticsManager : (selectedVendor.logisticsManager || '-')}
                    onChange={(e) => setFormData({...formData, logisticsManager: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {!isEditing ? (
                  <>
                    <Button type="button" onClick={handleEdit}>수정</Button>
                    <Button type="button" variant="outline" onClick={() => setIsDetailOpen(false)}>닫기</Button>
                  </>
                ) : (
                  <>
                    <Button type="button" onClick={handleSaveEdit}>수정완료</Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsEditing(false);
                      setIsDetailOpen(false);
                      setSelectedVendors([]);
                    }}>취소</Button>
                  </>
                )}
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendors;
