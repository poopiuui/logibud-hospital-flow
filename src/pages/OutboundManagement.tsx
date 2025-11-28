import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { OutboundRegistrationDialog } from "@/components/OutboundRegistrationDialog";
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

  // Fetch products for selection
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });


  const filteredOutbounds = outbounds.filter((outbound) =>
    outbound.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outbound.outbound_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">출고관리</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          출고 등록
        </Button>
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

      <OutboundRegistrationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        products={products}
        customers={customers}
      />
    </div>
  );
};

export default OutboundManagement;
