import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface CustomerInfo {
  id: string;
  company_name: string;
  business_number: string;
  ceo_name: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function B2BPortal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const customerData = sessionStorage.getItem('b2b_customer');
    if (!customerData) {
      navigate('/b2b/login');
      return;
    }
    const customer = JSON.parse(customerData);
    setCustomerInfo(customer);
    fetchOrders(customer.id);
  }, [navigate]);

  const fetchOrders = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('b2b_orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "주문 조회 실패",
        description: "주문 내역을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('b2b_customer');
    toast({
      title: "로그아웃",
      description: "로그아웃되었습니다.",
    });
    navigate('/b2b/login');
  };

  if (!customerInfo) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '주문확인중',
      confirmed: '출고준비중',
      shipped: '배송중',
      delivered: '배송완료',
      cancelled: '취소됨'
    };
    return statusMap[status] || status;
  };

  const stats = {
    monthlyOrders: orders.filter(o => {
      const orderDate = new Date(o.created_at);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear();
    }).length,
    totalAmount: orders.reduce((sum, o) => sum + o.total_amount, 0),
    pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length
  };

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
              <div className="text-2xl font-bold">{stats.monthlyOrders}건</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 거래액</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{stats.totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">처리 대기</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}건</div>
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
            onClick={() => {
              // 주문 탭으로 스크롤
              document.getElementById('orders-tab')?.click();
            }}
          >
            <Package className="w-6 h-6 mr-2" />
            주문 내역 보기
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" id="orders-tab">최근 주문</TabsTrigger>
            <TabsTrigger value="settings">계정 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>최근 주문 내역</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-8">로딩중...</p>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    주문 내역이 없습니다
                  </p>
                ) : (
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
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString('ko-KR')}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">₩{order.total_amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
