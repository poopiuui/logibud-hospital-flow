import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OutboundManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    outbound_date: new Date().toISOString().split('T')[0],
    notes: "",
    tracking_number: "",
  });

  // Fetch outbound orders
  const { data: outbounds = [], isLoading } = useQuery({
    queryKey: ["outbound_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outbound_orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch suppliers (customers)
  const { data: customers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("business_name");
      
      if (error) throw error;
      return data;
    },
  });

  // Create outbound order mutation
  const createOutbound = useMutation({
    mutationFn: async (newOutbound: typeof formData) => {
      const outboundNumber = `OUT-${Date.now()}`;
      
      const { data, error } = await supabase
        .from("outbound_orders")
        .insert([{
          outbound_number: outboundNumber,
          customer_id: newOutbound.customer_id || null,
          customer_name: newOutbound.customer_name,
          outbound_date: newOutbound.outbound_date,
          notes: newOutbound.notes || null,
          tracking_number: newOutbound.tracking_number || null,
          status: "출고준비중",
          total_amount: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outbound_orders"] });
      toast({
        title: "출고 등록 완료",
        description: "출고가 성공적으로 등록되었습니다.",
      });
      setIsDialogOpen(false);
      setFormData({
        customer_id: "",
        customer_name: "",
        outbound_date: new Date().toISOString().split('T')[0],
        notes: "",
        tracking_number: "",
      });
    },
    onError: (error) => {
      toast({
        title: "출고 등록 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOutbound.mutate(formData);
  };

  const filteredOutbounds = outbounds.filter((outbound) =>
    outbound.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outbound.outbound_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">출고관리</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              출고 등록
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>출고 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>고객 선택</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => {
                    const customer = customers.find(c => c.id === value);
                    setFormData({
                      ...formData,
                      customer_id: value,
                      customer_name: customer?.business_name || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="고객 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.business_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outbound_date">출고일</Label>
                <Input
                  id="outbound_date"
                  type="date"
                  value={formData.outbound_date}
                  onChange={(e) =>
                    setFormData({ ...formData, outbound_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking_number">송장번호 (선택)</Label>
                <Input
                  id="tracking_number"
                  value={formData.tracking_number}
                  onChange={(e) =>
                    setFormData({ ...formData, tracking_number: e.target.value })
                  }
                  placeholder="송장번호 입력"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">비고</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="비고 입력"
                />
              </div>

              <Button type="submit" className="w-full">
                등록
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="고객명 또는 출고번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>출고번호</TableHead>
              <TableHead>고객명</TableHead>
              <TableHead>출고일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>송장번호</TableHead>
              <TableHead>총액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  로딩중...
                </TableCell>
              </TableRow>
            ) : filteredOutbounds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  출고 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredOutbounds.map((outbound) => (
                <TableRow key={outbound.id}>
                  <TableCell>{outbound.outbound_number}</TableCell>
                  <TableCell>{outbound.customer_name}</TableCell>
                  <TableCell>{outbound.outbound_date}</TableCell>
                  <TableCell>{outbound.status}</TableCell>
                  <TableCell>{outbound.tracking_number || "-"}</TableCell>
                  <TableCell>
                    {outbound.total_amount?.toLocaleString() || "0"}원
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default OutboundManagement;
