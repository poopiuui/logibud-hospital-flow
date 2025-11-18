import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ChatbotSuggestionsProps {
  team: 'sales' | 'logistics' | 'inventory' | 'all';
  onSuggestionClick: (question: string) => void;
}

const suggestions = {
  sales: [
    "이번 달 매출 현황은?",
    "상위 판매 제품은?",
    "미수금 현황 알려줘",
  ],
  logistics: [
    "오늘 출고 건수는?",
    "배송중인 주문은?",
    "배송 지연 건은?",
  ],
  inventory: [
    "재고 부족 제품은?",
    "과다 재고는?",
    "긴급 발주 필요한 제품은?",
  ],
  all: [
    "재고 현황 보여줘",
    "이번 달 매출은?",
    "긴급 알림 있어?",
  ]
};

export function ChatbotSuggestions({ team, onSuggestionClick }: ChatbotSuggestionsProps) {
  const teamSuggestions = suggestions[team];

  return (
    <Card className="p-4 bg-muted/50">
      <p className="text-sm font-medium mb-3 text-muted-foreground">추천 질문:</p>
      <div className="space-y-2">
        {teamSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </Card>
  );
}
