import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface FilterPreset {
  name: string;
  dateRange: DateRange;
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  storageKey?: string;
}

export const DateRangeFilter = ({ onDateRangeChange, storageKey = "dateFilterPresets" }: DateRangeFilterProps) => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    onDateRangeChange(range);
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast({ title: "오류", description: "프리셋 이름을 입력하세요.", variant: "destructive" });
      return;
    }
    if (!dateRange.from || !dateRange.to) {
      toast({ title: "오류", description: "날짜 범위를 선택하세요.", variant: "destructive" });
      return;
    }

    const newPresets = [...presets, { name: presetName, dateRange }];
    setPresets(newPresets);
    localStorage.setItem(storageKey, JSON.stringify(newPresets));
    setShowSaveDialog(false);
    setPresetName("");
    toast({ title: "저장 완료", description: "필터 프리셋이 저장되었습니다." });
  };

  const loadPreset = (preset: FilterPreset) => {
    const range = {
      from: preset.dateRange.from ? new Date(preset.dateRange.from) : undefined,
      to: preset.dateRange.to ? new Date(preset.dateRange.to) : undefined,
    };
    setDateRange(range);
    onDateRangeChange(range);
    toast({ title: "프리셋 로드", description: `"${preset.name}" 프리셋이 적용되었습니다.` });
  };

  const deletePreset = (index: number) => {
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
    localStorage.setItem(storageKey, JSON.stringify(newPresets));
    toast({ title: "삭제 완료", description: "프리셋이 삭제되었습니다." });
  };

  const quickFilters = [
    { label: "오늘", getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: "최근 7일", getValue: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 7);
      return { from, to };
    }},
    { label: "최근 30일", getValue: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      return { from, to };
    }},
    { label: "이번 달", getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from, to };
    }},
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "yyyy-MM-dd")} - {format(dateRange.to, "yyyy-MM-dd")}
                  </>
                ) : (
                  format(dateRange.from, "yyyy-MM-dd")
                )
              ) : (
                <span>날짜 범위 선택</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => handleDateRangeChange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <div className="flex gap-1">
          {quickFilters.map((filter) => (
            <Button
              key={filter.label}
              variant="outline"
              size="sm"
              onClick={() => handleDateRangeChange(filter.getValue())}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {dateRange.from && dateRange.to && (
          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        )}
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">저장된 프리셋:</span>
          {presets.map((preset, index) => (
            <div key={index} className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => loadPreset(preset)}
              >
                {preset.name}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => deletePreset(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>필터 프리셋 저장</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">프리셋 이름</label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="예: 2024년 1분기"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {dateRange.from && dateRange.to && (
                <>
                  {format(dateRange.from, "yyyy-MM-dd")} - {format(dateRange.to, "yyyy-MM-dd")}
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>취소</Button>
            <Button onClick={savePreset}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
