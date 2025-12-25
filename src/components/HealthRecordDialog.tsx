import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const recordTypes = [
  { value: "vaccination", label: "💉 예방접종" },
  { value: "checkup", label: "🩺 정기검진" },
  { value: "treatment", label: "💊 치료" },
  { value: "surgery", label: "🏥 수술" },
  { value: "grooming", label: "✂️ 미용" },
  { value: "dental", label: "🦷 치과" },
  { value: "other", label: "📋 기타" },
];

interface HealthRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  userId: string;
  onSuccess: () => void;
}

const HealthRecordDialog = ({ open, onOpenChange, petId, userId, onSuccess }: HealthRecordDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    record_type: "checkup",
    title: "",
    description: "",
    record_date: new Date().toISOString().slice(0, 10),
    next_date: "",
    hospital_name: "",
    cost: "",
  });

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: "제목을 입력해주세요", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from("pet_health_records").insert({
      pet_id: petId,
      user_id: userId,
      record_type: form.record_type,
      title: form.title,
      description: form.description || null,
      record_date: form.record_date,
      next_date: form.next_date || null,
      hospital_name: form.hospital_name || null,
      cost: form.cost ? Number(form.cost) : null,
    });

    setIsLoading(false);

    if (error) {
      toast({ title: "저장 실패", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "건강 기록이 추가되었습니다" });
    setForm({
      record_type: "checkup",
      title: "",
      description: "",
      record_date: new Date().toISOString().slice(0, 10),
      next_date: "",
      hospital_name: "",
      cost: "",
    });
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>건강 기록 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>기록 유형</Label>
            <Select value={form.record_type} onValueChange={(v) => setForm((p) => ({ ...p, record_type: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recordTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>제목</Label>
            <Input
              placeholder="예: 광견병 예방접종"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>기록 날짜</Label>
              <Input
                type="date"
                value={form.record_date}
                onChange={(e) => setForm((p) => ({ ...p, record_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>다음 예정일</Label>
              <Input
                type="date"
                value={form.next_date}
                onChange={(e) => setForm((p) => ({ ...p, next_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>병원명</Label>
            <Input
              placeholder="예: 행복동물병원"
              value={form.hospital_name}
              onChange={(e) => setForm((p) => ({ ...p, hospital_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>비용 (원)</Label>
            <Input
              type="number"
              placeholder="예: 50000"
              value={form.cost}
              onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>메모</Label>
            <Textarea
              placeholder="추가 기록할 내용을 입력해주세요"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealthRecordDialog;
