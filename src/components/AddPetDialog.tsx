import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddPetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddPetDialog = ({ open, onOpenChange, onSuccess }: AddPetDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", species: "dog", breed: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("로그인이 필요합니다");

      const { error } = await supabase.from("pet_profiles").insert({
        user_id: session.user.id,
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
      });

      if (error) throw error;

      toast({ title: "등록 완료", description: `${formData.name}이(가) 등록되었습니다` });
      setFormData({ name: "", species: "dog", breed: "" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>반려동물 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>이름</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="반려동물 이름"
              required
            />
          </div>
          <div>
            <Label>종류</Label>
            <Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">🐕 강아지</SelectItem>
                <SelectItem value="cat">🐈 고양이</SelectItem>
                <SelectItem value="bird">🐦 새</SelectItem>
                <SelectItem value="fish">🐟 물고기</SelectItem>
                <SelectItem value="hamster">🐹 햄스터</SelectItem>
                <SelectItem value="other">🐾 기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>품종 (선택)</Label>
            <Input 
              value={formData.breed} 
              onChange={(e) => setFormData({...formData, breed: e.target.value})}
              placeholder="예: 말티즈, 페르시안..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "등록 중..." : "등록하기"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPetDialog;
