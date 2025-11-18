import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function B2BProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // 더미 상품 데이터 (실제로는 Supabase에서 가져옴)
  const products: Product[] = [
    { id: "1", name: "의료용 마스크 KF94", code: "PROD-001", price: 25000, stock: 500, category: "보호장비" },
    { id: "2", name: "일회용 장갑 (100매)", code: "PROD-002", price: 15000, stock: 300, category: "보호장비" },
    { id: "3", name: "소독용 알코올 1L", code: "PROD-003", price: 12000, stock: 150, category: "소독제" },
    { id: "4", name: "체온계 디지털", code: "PROD-004", price: 35000, stock: 80, category: "측정기기" },
    { id: "5", name: "의료용 테이프", code: "PROD-005", price: 8000, stock: 200, category: "의료소모품" },
    { id: "6", name: "붕대 (10개입)", code: "PROD-006", price: 18000, stock: 120, category: "의료소모품" },
  ];

  useEffect(() => {
    const customerData = sessionStorage.getItem('b2b_customer');
    if (!customerData) {
      navigate('/b2b/login');
    }
  }, [navigate]);

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
          return item; // 별도로 제거 처리
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

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "장바구니가 비어있습니다",
        description: "주문할 상품을 추가해주세요.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "주문 완료",
      description: "주문이 성공적으로 접수되었습니다.",
    });

    // 실제로는 Supabase에 주문 저장
    setCart([]);
  };

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.code}</p>
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
