import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface OutboundItem {
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  available_stock?: number;
}

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
}

interface Customer {
  id: string;
  business_name: string;
}

interface OutboundRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
}

export function OutboundRegistrationDialog({ 
  open, 
  onClose, 
  products, 
  customers 
}: OutboundRegistrationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    outbound_date: new Date().toISOString().split('T')[0],
    tracking_number: "",
    notes: ""
  });
  
  const [items, setItems] = useState<OutboundItem[]>([]);

  const createOutbound = useMutation({
    mutationFn: async () => {
      if (!formData.customer_id || items.length === 0) {
        throw new Error("고객과 제품을 선택해주세요");
      }

      // Check stock availability
      for (const item of items) {
        if (item.quantity > (item.available_stock || 0)) {
          throw new Error(`${item.product_name}의 재고가 부족합니다 (재고: ${item.available_stock})`);
        }
      }

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
      const outboundNumber = `OUT-${Date.now()}`;

      // Create outbound record
      const { data: outbound, error: outboundError } = await supabase
        .from('outbound_orders')
        .insert([{
          outbound_number: outboundNumber,
          customer_id: formData.customer_id,
          customer_name: formData.customer_name,
          outbound_date: formData.outbound_date,
          tracking_number: formData.tracking_number || null,
          status: formData.tracking_number ? '배송중' : '출고준비중',
          total_amount: totalAmount,
          notes: formData.notes || null
        }])
        .select()
        .single();

      if (outboundError) throw outboundError;

      // Create outbound items (this will trigger auto stock decrease)
      const outboundItems = items.map(item => ({
        outbound_id: outbound.id,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      }));

      const { error: itemsError } = await supabase
        .from('outbound_items')
        .insert(outboundItems);

      if (itemsError) throw itemsError;

      // If tracking number provided, shipment will be auto-created by trigger
      return outbound;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outbound_orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      
      toast({
        title: "출고 등록 완료",
        description: formData.tracking_number 
          ? "출고가 등록되고 배송이 자동으로 생성되었습니다." 
          : "출고가 등록되고 재고가 자동으로 감소되었습니다."
      });
      
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "출고 등록 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      customer_id: "",
      customer_name: "",
      outbound_date: new Date().toISOString().split('T')[0],
      tracking_number: "",
      notes: ""
    });
    setItems([]);
  };

  const addItem = () => {
    setItems([...items, {
      product_id: "",
      product_code: "",
      product_name: "",
      quantity: 0,
      unit_price: 0,
      subtotal: 0,
      available_stock: 0
    }]);
  };

  const updateItem = (index: number, field: keyof OutboundItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].unit_price;
    }
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].product_code = product.code;
        newItems[index].product_name = product.name;
        newItems[index].unit_price = product.price;
        newItems[index].available_stock = product.stock;
        newItems[index].subtotal = newItems[index].quantity * product.price;
      }
    }
    
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    createOutbound.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>출고 등록</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>고객 *</Label>
              <Select 
                value={formData.customer_id} 
                onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  setFormData({ 
                    ...formData, 
                    customer_id: value,
                    customer_name: customer?.business_name || ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="고객 선택" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>출고일 *</Label>
              <Input 
                type="date" 
                value={formData.outbound_date}
                onChange={(e) => setFormData({ ...formData, outbound_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>송장번호 (선택)</Label>
            <Input 
              value={formData.tracking_number}
              onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
              placeholder="송장번호 입력 시 자동으로 배송 생성"
            />
          </div>

          <div>
            <Label>비고</Label>
            <Textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="비고 입력"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">제품 목록</Label>
              <Button onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                제품 추가
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    <div>
                      <Label className="text-xs">제품</Label>
                      <Select 
                        value={item.product_id} 
                        onValueChange={(value) => updateItem(index, 'product_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="제품 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (재고: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">수량</Label>
                      <Input 
                        type="number" 
                        value={item.quantity || ""}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        max={item.available_stock}
                      />
                      {item.available_stock !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          재고: {item.available_stock}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs">단가</Label>
                      <Input 
                        type="number" 
                        value={item.unit_price || ""}
                        onChange={(e) => updateItem(index, 'unit_price', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">합계</Label>
                      <Input 
                        type="text" 
                        value={item.subtotal.toLocaleString()}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="mt-6"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              
              {items.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  제품을 추가해주세요
                </p>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">총 금액</span>
                  <span className="text-xl font-bold">
                    {items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} disabled={createOutbound.isPending}>
            {createOutbound.isPending ? "처리중..." : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
