import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Purchase {
  id: string;
  date: Date;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendor: string;
  type: "제조사" | "반품";
  status: "완료" | "처리중";
}

export default function PurchaseManagement() {
  const [purchases] = useState<Purchase[]>([
    {
      id: "P001",
      date: new Date(2025, 0, 15),
      productName: "주사기 5ml",
      quantity: 500,
      unitPrice: 200,
      totalPrice: 100000,
      vendor: "메디컬 서플라이",
      type: "제조사",
      status: "완료"
    },
    {
      id: "P002",
      date: new Date(2025, 0, 14),
      productName: "거즈 패드",
      quantity: 200,
      unitPrice: 150,
      totalPrice: 30000,
      vendor: "헬스케어 코리아",
      type: "반품",
      status: "완료"
    },
    {
      id: "P003",
      date: new Date(2025, 0, 13),
      productName: "의료용 장갑",
      quantity: 1000,
      unitPrice: 50,
      totalPrice: 50000,
      vendor: "메디컬 서플라이",
      type: "제조사",
      status: "처리중"
    }
  ]);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [filterType, setFilterType] = useState<"전체" | "제조사" | "반품">("전체");
  const [filterStatus, setFilterStatus] = useState<"전체" | "완료" | "처리중">("전체");

  const filteredPurchases = purchases.filter(purchase => {
    const matchesType = filterType === "전체" || purchase.type === filterType;
    const matchesStatus = filterStatus === "전체" || purchase.status === filterStatus;
    const matchesDate = 
      (!dateRange.from || purchase.date >= dateRange.from) &&
      (!dateRange.to || purchase.date <= dateRange.to);
    return matchesType && matchesStatus && matchesDate;
  });

  const totalAmount = filteredPurchases.reduce((sum, p) => sum + p.totalPrice, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">매입 관리</h1>
        <p className="text-muted-foreground">매입 내역을 조회하고 관리합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 매입 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPurchases.length}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 매입 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">제조사 매입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPurchases.filter(p => p.type === "제조사").length}건
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">반품 매입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPurchases.filter(p => p.type === "반품").length}건
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>매입 내역</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy-MM-dd", { locale: ko })} -{" "}
                          {format(dateRange.to, "yyyy-MM-dd", { locale: ko })}
                        </>
                      ) : (
                        format(dateRange.from, "yyyy-MM-dd", { locale: ko })
                      )
                    ) : (
                      <span>기간 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>

              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="제조사">제조사</SelectItem>
                  <SelectItem value="반품">반품</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="완료">완료</SelectItem>
                  <SelectItem value="처리중">처리중</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>매입번호</TableHead>
                <TableHead>매입일시</TableHead>
                <TableHead>제품명</TableHead>
                <TableHead>수량</TableHead>
                <TableHead>단가</TableHead>
                <TableHead>총액</TableHead>
                <TableHead>매입처</TableHead>
                <TableHead>구분</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{format(purchase.date, "yyyy-MM-dd HH:mm", { locale: ko })}</TableCell>
                  <TableCell className="font-medium">{purchase.productName}</TableCell>
                  <TableCell>{purchase.quantity.toLocaleString()}개</TableCell>
                  <TableCell>₩{purchase.unitPrice.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">₩{purchase.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>{purchase.vendor}</TableCell>
                  <TableCell>
                    <Badge variant={purchase.type === "제조사" ? "default" : "secondary"}>
                      {purchase.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={purchase.status === "완료" ? "default" : "outline"}>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
