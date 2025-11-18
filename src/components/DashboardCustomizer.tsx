import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Eye, EyeOff, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DashboardSettings {
  widgetVisibility: Record<string, boolean>;
  themeColor: string;
}

const widgets = [
  { id: 'kpi', name: '핵심 지표', description: '매출, 재고, 주문 현황' },
  { id: 'stock-alert', name: '재고 알림', description: '재고 부족 제품 알림' },
  { id: 'sales', name: '매출/매입 추이', description: '월별 매출 및 매입 차트' },
  { id: 'inventory', name: '카테고리별 재고', description: '재고 분포 차트' },
  { id: 'inventory-viz', name: '재고 시각화', description: '고급 재고 분석' },
  { id: 'auto-reorder', name: '자동 발주 시스템', description: 'AI 기반 발주 제안' },
  { id: 'ai-prediction', name: 'AI 재주문 예측', description: '재주문 시점 예측' },
];

const themeColors = [
  { id: 'default', name: '기본', color: 'hsl(var(--primary))' },
  { id: 'blue', name: '블루', color: '#3B82F6' },
  { id: 'green', name: '그린', color: '#10B981' },
  { id: 'purple', name: '퍼플', color: '#8B5CF6' },
  { id: 'orange', name: '오렌지', color: '#F59E0B' },
];

interface DashboardCustomizerProps {
  onSettingsChange: (settings: DashboardSettings) => void;
}

export function DashboardCustomizer({ onSettingsChange }: DashboardCustomizerProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<DashboardSettings>({
    widgetVisibility: widgets.reduce((acc, w) => ({ ...acc, [w.id]: true }), {}),
    themeColor: 'default',
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('dashboard_settings')
      .select('*')
      .eq('user_id', 'default')
      .maybeSingle();

    if (error) {
      console.error('Error loading settings:', error);
      return;
    }

    if (data) {
      const loadedSettings = {
        widgetVisibility: data.widget_visibility as Record<string, boolean>,
        themeColor: data.theme_color || 'default',
      };
      setSettings(loadedSettings);
      onSettingsChange(loadedSettings);
    }
  };

  const saveSettings = async (newSettings: DashboardSettings) => {
    const { error } = await supabase
      .from('dashboard_settings')
      .upsert({
        user_id: 'default',
        widget_visibility: newSettings.widgetVisibility,
        theme_color: newSettings.themeColor,
      });

    if (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "저장 실패",
        description: "설정을 저장하는데 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "설정 저장 완료",
      description: "대시보드 설정이 저장되었습니다.",
    });

    onSettingsChange(newSettings);
  };

  const toggleWidget = (widgetId: string) => {
    const newSettings = {
      ...settings,
      widgetVisibility: {
        ...settings.widgetVisibility,
        [widgetId]: !settings.widgetVisibility[widgetId],
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const changeTheme = (themeId: string) => {
    const newSettings = {
      ...settings,
      themeColor: themeId,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>대시보드 커스터마이징</SheetTitle>
          <SheetDescription>
            위젯 표시 여부와 테마를 설정하세요
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Widget Visibility */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              위젯 표시 설정
            </h3>
            <div className="space-y-3">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <Label htmlFor={widget.id} className="font-medium cursor-pointer">
                      {widget.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {widget.description}
                    </p>
                  </div>
                  <Switch
                    id={widget.id}
                    checked={settings.widgetVisibility[widget.id]}
                    onCheckedChange={() => toggleWidget(widget.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Theme Color */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4" />
              테마 색상
            </h3>
            <RadioGroup
              value={settings.themeColor}
              onValueChange={changeTheme}
              className="grid grid-cols-2 gap-3"
            >
              {themeColors.map((theme) => (
                <div key={theme.id} className="relative">
                  <RadioGroupItem
                    value={theme.id}
                    id={theme.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={theme.id}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer peer-data-[state=checked]:border-primary hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="font-medium">{theme.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
