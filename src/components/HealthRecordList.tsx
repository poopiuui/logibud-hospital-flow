import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const recordTypeLabels: Record<string, { label: string; emoji: string }> = {
  vaccination: { label: "예방접종", emoji: "💉" },
  checkup: { label: "정기검진", emoji: "🩺" },
  treatment: { label: "치료", emoji: "💊" },
  surgery: { label: "수술", emoji: "🏥" },
  grooming: { label: "미용", emoji: "✂️" },
  dental: { label: "치과", emoji: "🦷" },
  other: { label: "기타", emoji: "📋" },
};

interface HealthRecord {
  id: string;
  record_type: string;
  title: string;
  description?: string | null;
  record_date: string;
  next_date?: string | null;
  hospital_name?: string | null;
  cost?: number | null;
}

interface HealthRecordListProps {
  records: HealthRecord[];
  onDelete: () => void;
}

const HealthRecordList = ({ records, onDelete }: HealthRecordListProps) => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pet_health_records").delete().eq("id", id);
    if (error) {
      toast({ title: "삭제 실패", variant: "destructive" });
      return;
    }
    toast({ title: "기록이 삭제되었습니다" });
    onDelete();
  };

  const getUpcomingBadge = (nextDate?: string | null) => {
    if (!nextDate) return null;
    const days = differenceInDays(new Date(nextDate), new Date());
    if (days < 0) return <Badge variant="destructive" className="text-xs">기한 지남</Badge>;
    if (days <= 7) return <Badge variant="default" className="text-xs bg-amber-500">곧 예정</Badge>;
    if (days <= 30) return <Badge variant="secondary" className="text-xs">{days}일 후</Badge>;
    return null;
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">아직 건강 기록이 없어요</p>
        <p className="text-xs mt-1">첫 기록을 추가해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const typeInfo = recordTypeLabels[record.record_type] || { label: "기타", emoji: "📋" };
        return (
          <Card key={record.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="text-2xl">{typeInfo.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm truncate">{record.title}</h4>
                      {getUpcomingBadge(record.next_date)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(record.record_date), "yyyy년 M월 d일", { locale: ko })}
                      {record.hospital_name && ` · ${record.hospital_name}`}
                    </p>
                    {record.next_date && (
                      <p className="text-xs text-primary mt-1">
                        📅 다음 예정: {format(new Date(record.next_date), "yyyy년 M월 d일", { locale: ko })}
                      </p>
                    )}
                    {record.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{record.description}</p>
                    )}
                    {record.cost && (
                      <p className="text-xs text-muted-foreground mt-1">
                        💰 {record.cost.toLocaleString()}원
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(record.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default HealthRecordList;
