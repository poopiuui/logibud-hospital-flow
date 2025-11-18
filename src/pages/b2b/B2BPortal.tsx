import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Package, ShoppingCart, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomerInfo {
  id: string;
  company_name: string;
  business_number: string;
  ceo_name: string;
}

export default function B2BPortal() {
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    const customerData = sessionStorage.getItem('b2b_customer');
    if (!customerData) {
      navigate('/b2b/login');
      return;
    }
    setCustomerInfo(JSON.parse(customerData));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('b2b_customer');
    navigate('/b2b/login');
  };

  if (!customerInfo) {
    return null;
  }

  // 더미 데이터
  const recentOrders = [
    { id: "ORD-001", date: "2024-11-15", status: "배송완료", amount: "₩1,250,000" },
    { id: "ORD-002", date: "2024-11-14", status: "배송중", amount: "₩890,000" },
    { id: "ORD-003", date: "2024-11-13", status: "출고준비중", amount: "₩2,100,000" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">B2B 포털</h1>
              <p className="text-sm text-muted-foreground">{customerInfo.company_name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">
              환영합니다, {customerInfo.ceo_name} 대표님
            </h2>
            <p className="text-muted-foreground">
              {customerInfo.company_name}의 주문 및 거래 현황을 확인하실 수 있습니다.
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 주문</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156건</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12</span> 지난달 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 거래액</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩45,230,000</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+₩3,200,000</span> 지난달 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">배송 대기</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23건</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">-5</span> 전일 대비
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => navigate('/b2b/products')}
            size="lg"
            className="h-20 text-lg"
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            상품 주문하기
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-20 text-lg"
          >
            <Package className="w-6 h-6 mr-2" />
            주문 내역 보기
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">최근 주문</TabsTrigger>
            <TabsTrigger value="analytics">거래 분석</TabsTrigger>
            <TabsTrigger value="settings">계정 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>최근 주문 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문번호</TableHead>
                      <TableHead>주문일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell className="text-right">{order.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>거래 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  거래 통계 및 분석 차트가 여기에 표시됩니다.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>계정 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">회사명</p>
                  <p className="text-sm text-muted-foreground">{customerInfo.company_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">사업자번호</p>
                  <p className="text-sm text-muted-foreground">{customerInfo.business_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">대표자명</p>
                  <p className="text-sm text-muted-foreground">{customerInfo.ceo_name}</p>
                </div>
                <Button variant="outline" className="mt-4">
                  비밀번호 변경
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
