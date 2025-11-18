import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin } from "lucide-react";

export default function Shipping() {
  const shipments = [
    { id: 'SHP-001', customer: '고객 A', items: 15, status: '배송중', destination: '서울시 강남구', date: '2024-01-15' },
    { id: 'SHP-002', customer: '고객 B', items: 8, status: '준비중', destination: '부산시 해운대구', date: '2024-01-15' },
    { id: 'SHP-003', customer: '고객 C', items: 22, status: '배송완료', destination: '대구시 수성구', date: '2024-01-14' },
    { id: 'SHP-004', customer: '고객 D', items: 12, status: '배송중', destination: '인천시 연수구', date: '2024-01-14' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">배송 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">배송 현황 및 물류 추적</p>
        </div>
        <Button size="lg" className="gap-2">
          <Truck className="w-5 h-5" />
          새 배송 등록
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              준비중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              배송중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">15</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              배송완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">142</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">OTIF 달성률</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">94.2%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">배송 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>배송 번호</TableHead>
                <TableHead>고객명</TableHead>
                <TableHead>품목 수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>목적지</TableHead>
                <TableHead>날짜</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.id}</TableCell>
                  <TableCell>{shipment.customer}</TableCell>
                  <TableCell>{shipment.items}개</TableCell>
                  <TableCell>
                    <Badge variant={
                      shipment.status === '배송완료' ? 'default' : 
                      shipment.status === '배송중' ? 'secondary' : 
                      'outline'
                    }>
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>{shipment.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
