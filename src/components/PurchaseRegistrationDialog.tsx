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

interface PurchaseItem {
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
}

interface Supplier {
  id: string;
  business_name: string;
}

interface PurchaseRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
}

export function PurchaseRegistrationDialog({ 
  open, 
  onClose, 
  products, 
  suppliers 
}: PurchaseRegistrationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    supplier_id: "",
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_type: "manufacturer",
    notes: ""
  });
  
  const [items, setItems] = useState<PurchaseItem[]>([]);

  const createPurchase = useMutation({
    mutationFn: async () => {
      if (!formData.supplier_id || items.length === 0) {
        throw new Error("거래처와 제품을 선택해주세요");
      }

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
      const purchaseNumber = `PUR-${Date.now()}`;

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          purchase_number: purchaseNumber,
          supplier_id: formData.supplier_id,
          purchase_date: formData.purchase_date,
          purchase_type: formData.purchase_type,
          status: '완료',
          total_amount: totalAmount,
          notes: formData.notes || null
        }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Create purchase items (this will trigger auto stock increase)
      const purchaseItems = items.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems);

      if (itemsError) throw itemsError;

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "매입 등록 완료",
        description: "매입이 등록되고 재고가 자동으로 증가되었습니다."
      });
      
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "매입 등록 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      supplier_id: "",
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_type: "manufacturer",
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
      subtotal: 0
    }]);
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
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
        newItems[index].subtotal = newItems[index].quantity * product.price;
      }
    }
    
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    createPurchase.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>매입 등록</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>거래처 *</Label>
              <Select 
                value={formData.supplier_id} 
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="거래처 선택" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>매입일 *</Label>
              <Input 
                type="date" 
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>매입 유형</Label>
            <Select 
              value={formData.purchase_type} 
              onValueChange={(value) => setFormData({ ...formData, purchase_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturer">제조사</SelectItem>
                <SelectItem value="return">반품</SelectItem>
              </SelectContent>
            </Select>
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
                  <div className="flex-1 grid grid-cols-4 gap-2">
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
                              {product.name}
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
                      />
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
          <Button onClick={handleSubmit} disabled={createPurchase.isPending}>
            {createPurchase.isPending ? "처리중..." : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
