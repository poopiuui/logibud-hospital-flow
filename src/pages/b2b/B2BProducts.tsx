import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  image_url?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CustomerInfo {
  id: string;
  company_name: string;
  business_number: string;
  ceo_name: string;
}

export default function B2BProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    const customerData = sessionStorage.getItem('b2b_customer');
    if (!customerData) {
      navigate('/b2b/login');
      return;
    }
    setCustomerInfo(JSON.parse(customerData));
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('category', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "상품 조회 실패",
        description: "상품 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "재고 부족",
          description: "재고 수량을 초과할 수 없습니다.",
          variant: "destructive",
        });
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    toast({
      title: "장바구니에 추가됨",
      description: `${product.name}이(가) 장바구니에 추가되었습니다.`,
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          return item;
        }
        if (newQuantity > product.stock) {
          toast({
            title: "재고 부족",
            description: "재고 수량을 초과할 수 없습니다.",
            variant: "destructive",
          });
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "장바구니가 비어있습니다",
        description: "주문할 상품을 추가해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo) {
      toast({
        title: "로그인 필요",
        description: "주문하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      navigate('/b2b/login');
      return;
    }

    try {
      const orderNumber = `B2B-${Date.now()}`;
      const totalAmount = getTotalAmount();

      // 주문 생성
      const { data: orderData, error: orderError } = await supabase
        .from('b2b_orders')
        .insert({
          order_number: orderNumber,
          customer_id: customerInfo.id,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 주문 항목 생성
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_code: item.code,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('b2b_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "주문 완료",
        description: `주문번호 ${orderNumber}로 주문이 접수되었습니다.`,
      });

      setCart([]);
      navigate('/b2b/portal');

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "주문 실패",
        description: "주문 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>상품 로딩중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/b2b/portal')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">상품 주문</h1>
                <p className="text-sm text-muted-foreground">필요한 상품을 선택하세요</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/b2b/portal')}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              장바구니 ({cart.length})
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>상품 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    등록된 상품이 없습니다
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">{product.code}</p>
                              {product.description && (
                                <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">{product.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                재고: {product.stock}개
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">
                                ₩{product.price.toLocaleString()}
                              </span>
                              <Button onClick={() => addToCart(product)} size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                담기
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>장바구니</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    장바구니가 비어있습니다
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₩{item.price.toLocaleString()} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">상품 금액</span>
                        <span>₩{getTotalAmount().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">배송비</span>
                        <span>무료</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>총 결제금액</span>
                        <span className="text-primary">₩{getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>

                    <Button onClick={handleCheckout} className="w-full" size="lg">
                      주문하기
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
