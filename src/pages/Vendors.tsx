import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  type: "매입처" | "매출처";
  code: string;
  businessName: string;
  businessNumber: string;
  managerName: string;
  managerPhone: string;
  paymentDate: string;
  paymentMethod: string;
  accountNumber: string;
  invoiceEmail: string;
}

export default function Vendors() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "1",
      type: "매입처",
      code: "V001",
      businessName: "메디컬 서플라이",
      businessNumber: "123-45-67890",
      managerName: "김담당",
      managerPhone: "010-1234-5678",
      paymentDate: "매월 말일",
      paymentMethod: "계좌이체",
      accountNumber: "국민 123-456-789",
      invoiceEmail: "medical@supply.com"
    },
    {
      id: "2",
      type: "매출처",
      code: "C001",
      businessName: "서울 병원",
      businessNumber: "987-65-43210",
      managerName: "이구매",
      managerPhone: "010-9876-5432",
      paymentDate: "매월 15일",
      paymentMethod: "카드",
      accountNumber: "-",
      invoiceEmail: "seoul@hospital.com"
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"전체" | "매입처" | "매출처">("전체");
  const [formData, setFormData] = useState({
    type: "매입처" as "매입처" | "매출처",
    businessName: "",
    businessNumber: "",
    managerName: "",
    managerPhone: "",
    paymentDate: "",
    paymentMethod: "",
    accountNumber: "",
    invoiceEmail: ""
  });

  const generateCode = (type: "매입처" | "매출처") => {
    const prefix = type === "매입처" ? "V" : "C";
    const count = vendors.filter(v => v.type === type).length + 1;
    return `${prefix}${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVendor: Vendor = {
      id: Date.now().toString(),
      code: generateCode(formData.type),
      ...formData
    };

    setVendors([...vendors, newVendor]);
    setIsOpen(false);
    setFormData({
      type: "매입처",
      businessName: "",
      businessNumber: "",
      managerName: "",
      managerPhone: "",
      paymentDate: "",
      paymentMethod: "",
      accountNumber: "",
      invoiceEmail: ""
    });

    toast({
      title: "등록 완료",
      description: `${formData.type} ${formData.businessName}이(가) 등록되었습니다.`
    });
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.managerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "전체" || vendor.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">매입/매출처 관리</h1>
          <p className="text-muted-foreground">거래처 정보를 관리합니다</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              거래처 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>거래처 등록</DialogTitle>
              <DialogDescription>새로운 매입/매출처 정보를 입력하세요</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">구분</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "매입처" | "매출처") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="매입처">매입처</SelectItem>
                      <SelectItem value="매출처">매출처</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">사업자명</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자번호</Label>
                  <Input
                    id="businessNumber"
                    value={formData.businessNumber}
                    onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                    placeholder="000-00-00000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerName">담당자명</Label>
                  <Input
                    id="managerName"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerPhone">담당자 전화번호</Label>
                  <Input
                    id="managerPhone"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">결제일</Label>
                  <Input
                    id="paymentDate"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    placeholder="예: 매월 말일"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">결제방법</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="계좌이체">계좌이체</SelectItem>
                      <SelectItem value="카드">카드</SelectItem>
                      <SelectItem value="현금">현금</SelectItem>
                      <SelectItem value="어음">어음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">통장번호</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="은행명 계좌번호"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="invoiceEmail">계산서 발행 메일주소</Label>
                  <Input
                    id="invoiceEmail"
                    type="email"
                    value={formData.invoiceEmail}
                    onChange={(e) => setFormData({ ...formData, invoiceEmail: e.target.value })}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  취소
                </Button>
                <Button type="submit">등록</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>거래처 목록</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="매입처">매입처</SelectItem>
                  <SelectItem value="매출처">매출처</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>코드</TableHead>
                <TableHead>구분</TableHead>
                <TableHead>사업자명</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>결제일</TableHead>
                <TableHead>결제방법</TableHead>
                <TableHead>통장번호</TableHead>
                <TableHead>계산서 이메일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.code}</TableCell>
                  <TableCell>
                    <Badge variant={vendor.type === "매입처" ? "default" : "secondary"}>
                      {vendor.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{vendor.businessName}</TableCell>
                  <TableCell>{vendor.businessNumber}</TableCell>
                  <TableCell>{vendor.managerName}</TableCell>
                  <TableCell>{vendor.managerPhone}</TableCell>
                  <TableCell>{vendor.paymentDate}</TableCell>
                  <TableCell>{vendor.paymentMethod}</TableCell>
                  <TableCell>{vendor.accountNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{vendor.invoiceEmail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
