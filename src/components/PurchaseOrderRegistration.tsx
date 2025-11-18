import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

interface Product {
  productCode: string;
  productName: string;
  supplier: string;
  unitPrice: number;
  currentStock: number;
  lastOrderQuantity?: number;
}

interface PurchaseOrderItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
}

interface PurchaseOrderRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts?: Product[];
}

export const PurchaseOrderRegistration = ({ isOpen, onClose, selectedProducts = [] }: PurchaseOrderRegistrationProps) => {
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>(
    selectedProducts.map(p => ({
      productCode: p.productCode,
      productName: p.productName,
      quantity: p.lastOrderQuantity || 0,
      unitPrice: p.unitPrice,
      supplier: p.supplier
    }))
  );
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  const addNewItem = () => {
    setOrderItems([...orderItems, {
      productCode: '',
      productName: '',
      quantity: 0,
      unitPrice: 0,
      supplier: ''
    }]);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const handleSubmit = () => {
    if (orderItems.length === 0) {
      toast({
        title: "오류",
        description: "발주 품목을 추가해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (orderItems.some(item => !item.productCode || item.quantity <= 0)) {
      toast({
        title: "오류",
        description: "모든 품목의 정보를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "발주서 등록 완료",
      description: `${orderItems.length}개 품목이 등록되었습니다.`
    });
    onClose();
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">발주서 등록</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 발주 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>발주일</Label>
              <Input 
                type="date" 
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <div>
              <Label>납품요청일</Label>
              <Input 
                type="date" 
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          {/* 발주 품목 목록 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg">발주 품목</Label>
              <Button onClick={addNewItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                품목 추가
              </Button>
            </div>

            {orderItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">제품코드</Label>
                    <Input
                      value={item.productCode}
                      onChange={(e) => updateItem(index, 'productCode', e.target.value)}
                      placeholder="A-001"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">제품명</Label>
                    <Input
                      value={item.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      placeholder="제품명 입력"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">공급처</Label>
                    <Input
                      value={item.supplier}
                      onChange={(e) => updateItem(index, 'supplier', e.target.value)}
                      placeholder="공급처명"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">단가</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">발주수량</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      placeholder="0"
                    />
                    {selectedProducts[index]?.lastOrderQuantity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        이전 발주: {selectedProducts[index].lastOrderQuantity}개
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">금액</Label>
                    <Input
                      value={(item.quantity * item.unitPrice).toLocaleString()}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 비고 */}
          <div>
            <Label>비고</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="추가 요청사항이나 특이사항을 입력하세요"
              rows={3}
            />
          </div>

          {/* 합계 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>총 발주금액</span>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalAmount.toLocaleString()}원
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>발주서 등록</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
