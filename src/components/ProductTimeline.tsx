import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Package } from "lucide-react";

interface TimelineEntry {
  date: string;
  type: '매입' | '출고' | '조정';
  quantity: number;
  stock: number;
  note?: string;
}

interface ProductTimelineProps {
  productName: string;
  timeline: TimelineEntry[];
}

export const ProductTimeline = ({ productName, timeline }: ProductTimelineProps) => {
  // 차트 데이터 준비
  const chartData = timeline.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    재고: entry.stock,
    변동량: entry.quantity,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Package className="w-6 h-6" />
          {productName} - 입출고 히스토리
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 타임라인 차트 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">재고 변동 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="재고" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#stockGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 타임라인 목록 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">상세 이력</h3>
          <div className="space-y-3">
            {timeline.map((entry, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={`p-2 rounded-full ${
                  entry.type === '매입' ? 'bg-success/20 text-success' :
                  entry.type === '출고' ? 'bg-info/20 text-info' :
                  'bg-warning/20 text-warning'
                }`}>
                  {entry.type === '매입' ? (
                    <ArrowUpCircle className="w-5 h-5" />
                  ) : entry.type === '출고' ? (
                    <ArrowDownCircle className="w-5 h-5" />
                  ) : (
                    <Package className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{entry.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`text-sm font-medium ${
                      entry.quantity > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {entry.quantity > 0 ? '+' : ''}{entry.quantity}개
                    </span>
                    <span className="text-sm text-muted-foreground">
                      재고: {entry.stock}개
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 샘플 데이터 생성 함수
export const generateSampleTimeline = (productName: string): TimelineEntry[] => {
  const timeline: TimelineEntry[] = [];
  let currentStock = 1000;
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const random = Math.random();
    let type: '매입' | '출고' | '조정';
    let quantity: number;

    if (random > 0.7) {
      type = '매입';
      quantity = Math.floor(Math.random() * 300) + 100;
      currentStock += quantity;
    } else if (random > 0.3) {
      type = '출고';
      quantity = -Math.floor(Math.random() * 200) - 50;
      currentStock += quantity;
    } else {
      type = '조정';
      quantity = Math.floor(Math.random() * 20) - 10;
      currentStock += quantity;
    }

    timeline.push({
      date: date.toISOString(),
      type,
      quantity,
      stock: Math.max(0, currentStock),
      note: type === '조정' ? '재고 실사 조정' : undefined,
    });
  }

  return timeline;
};
