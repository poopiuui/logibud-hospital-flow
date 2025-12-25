import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { petBreeds, speciesLabels, birthYears, birthMonths } from "@/data/petData";

interface AddPetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddPetDialog = ({ open, onOpenChange, onSuccess }: AddPetDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    birthYear: "",
    birthMonth: "",
  });

  const availableBreeds = petBreeds[formData.species as keyof typeof petBreeds] || [];

  useEffect(() => {
    setFormData(prev => ({ ...prev, breed: "" }));
  }, [formData.species]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("로그인이 필요합니다");

      let birthDate = null;
      if (formData.birthYear && formData.birthMonth) {
        birthDate = `${formData.birthYear}-${formData.birthMonth}-01`;
      }

      const { error } = await supabase.from("pet_profiles").insert({
        user_id: session.user.id,
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        birth_date: birthDate,
      });

      if (error) throw error;

      toast({ title: "등록 완료", description: `${formData.name}이(가) 등록되었습니다` });
      setFormData({ name: "", species: "dog", breed: "", birthYear: "", birthMonth: "" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🐾 반려동물 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>이름 *</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="반려동물 이름"
              required
            />
          </div>
          <div>
            <Label>종류 *</Label>
            <Select value={formData.species} onValueChange={(v) => setFormData({...formData, species: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(speciesLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>품종</Label>
            <Select value={formData.breed} onValueChange={(v) => setFormData({...formData, breed: v})}>
              <SelectTrigger>
                <SelectValue placeholder="품종을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {availableBreeds.map((breed) => (
                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>태어난 해</Label>
              <Select value={formData.birthYear} onValueChange={(v) => setFormData({...formData, birthYear: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="년도" />
                </SelectTrigger>
                <SelectContent>
                  {birthYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}년</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>태어난 달</Label>
              <Select value={formData.birthMonth} onValueChange={(v) => setFormData({...formData, birthMonth: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="월" />
                </SelectTrigger>
                <SelectContent>
                  {birthMonths.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
