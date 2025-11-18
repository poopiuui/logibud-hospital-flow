import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Outbound {
  id: string;
  date: Date;
  productName: string;
  quantity: number;
  destination: string;
  address: string;
  status: "출고완료" | "출고대기" | "배송중";
  deliveryDate?: Date;
}

export default function OutboundManagement() {
  const [outbounds] = useState<Outbound[]>([
    {
      id: "O001",
      date: new Date(2025, 0, 15, 14, 30),
      productName: "주사기 5ml",
      quantity: 100,
      destination: "서울병원",
      address: "서울시 강남구",
      status: "출고완료",
      deliveryDate: new Date(2025, 0, 16)
    },
    {
      id: "O002",
      date: new Date(2025, 0, 15, 10, 20),
      productName: "거즈 패드",
      quantity: 50,
      destination: "부산의료원",
      address: "부산시 해운대구",
      status: "배송중",
      deliveryDate: undefined
    },
    {
      id: "O003",
      date: new Date(2025, 0, 14, 16, 45),
      productName: "의료용 장갑",
      quantity: 200,
      destination: "대구클리닉",
      address: "대구시 중구",
      status: "출고대기",
      deliveryDate: undefined
    }
  ]);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [filterStatus, setFilterStatus] = useState<"전체" | "출고완료" | "출고대기" | "배송중">("전체");
  const [filterDestination, setFilterDestination] = useState<string>("전체");

  const destinations = ["전체", ...Array.from(new Set(outbounds.map(o => o.destination)))];

  const filteredOutbounds = outbounds.filter(outbound => {
    const matchesStatus = filterStatus === "전체" || outbound.status === filterStatus;
    const matchesDestination = filterDestination === "전체" || outbound.destination === filterDestination;
    const matchesDate = 
      (!dateRange.from || outbound.date >= dateRange.from) &&
      (!dateRange.to || outbound.date <= dateRange.to);
    return matchesStatus && matchesDestination && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "출고완료": return "default";
      case "배송중": return "secondary";
      case "출고대기": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">출고 관리</h1>
        <p className="text-muted-foreground">출고 내역을 조회하고 관리합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 출고 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOutbounds.length}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">출고 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredOutbounds.filter(o => o.status === "출고완료").length}건
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">배송 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredOutbounds.filter(o => o.status === "배송중").length}건
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">출고 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredOutbounds.filter(o => o.status === "출고대기").length}건
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>출고 내역</CardTitle>
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

              <Select value={filterDestination} onValueChange={setFilterDestination}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="출고지" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="출고완료">출고완료</SelectItem>
                  <SelectItem value="배송중">배송중</SelectItem>
                  <SelectItem value="출고대기">출고대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>출고번호</TableHead>
                <TableHead>출고일시</TableHead>
                <TableHead>제품명</TableHead>
                <TableHead>수량</TableHead>
                <TableHead>출고지</TableHead>
                <TableHead>주소</TableHead>
                <TableHead>배송예정일</TableHead>
                <TableHead>출고여부</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOutbounds.map((outbound) => (
                <TableRow key={outbound.id}>
                  <TableCell className="font-medium">{outbound.id}</TableCell>
                  <TableCell>{format(outbound.date, "yyyy-MM-dd HH:mm", { locale: ko })}</TableCell>
                  <TableCell className="font-medium">{outbound.productName}</TableCell>
                  <TableCell>{outbound.quantity.toLocaleString()}개</TableCell>
                  <TableCell>{outbound.destination}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{outbound.address}</TableCell>
                  <TableCell>
                    {outbound.deliveryDate 
                      ? format(outbound.deliveryDate, "yyyy-MM-dd", { locale: ko })
                      : "-"
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(outbound.status)}>
                      {outbound.status}
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
