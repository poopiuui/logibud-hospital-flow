import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrendingUp, TrendingDown, Package, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";

// Color Identity
const COLORS = {
  profit: "#4CAF50", // 🟢 Bright Green
  cost: "#F44336", // 🔴 Deep Red
  efficiency: "#2196F3", // 🔵 Vivid Blue
  profitLight: "#81C784",
  costLight: "#E57373",
  efficiencyLight: "#64B5F6",
};

// Sample Data
const kpiData = {
  totalRevenue: { value: 45800000, trend: 12.5, unit: "원" },
  contributionMargin: { value: 18320000, trend: 8.3, unit: "원" },
  logisticsCost: { value: 8450000, budget: 9000000, trend: -6.1, unit: "원" },
  inventoryTurnover: { value: 8.5, trend: 5.2, unit: "회" },
  otif: { value: 94.2, trend: 2.1, unit: "%" },
};

const activityCostData = [
  { name: "운송비", value: 3800000, color: COLORS.cost },
  { name: "창고보관비", value: 2100000, color: "#E91E63" },
  { name: "하역비", value: 1850000, color: "#9C27B0" },
  { name: "포장비", value: 700000, color: "#FF5722" },
];

const customerMarginData = [
  { customer: "고객 A", revenue: 12000000, marginRatio: 42, logisticsCost: 1200000 },
  { customer: "고객 B", revenue: 8500000, marginRatio: 38, logisticsCost: 950000 },
  { customer: "고객 C", revenue: 15000000, marginRatio: 28, logisticsCost: 2800000 },
  { customer: "고객 D", revenue: 5200000, marginRatio: 45, logisticsCost: 480000 },
  { customer: "고객 E", revenue: 4300000, marginRatio: 22, logisticsCost: 890000 },
  { customer: "고객 F", revenue: 9800000, marginRatio: 35, logisticsCost: 1150000 },
];

const productMarginData = [
  { product: "제품 A", margin: 45.2 },
  { product: "제품 B", margin: 38.7 },
  { product: "제품 C", margin: 35.1 },
  { product: "제품 D", margin: 28.3 },
  { product: "제품 E", margin: 22.8 },
  { product: "제품 F", margin: 18.5 },
].sort((a, b) => b.margin - a.margin);

const scenarioData = [
  { month: "1월", scenario1: 7200000, scenario2: 8100000, scenario3: 9500000 },
  { month: "2월", scenario1: 7350000, scenario2: 8250000, scenario3: 9800000 },
  { month: "3월", scenario1: 7100000, scenario2: 8000000, scenario3: 9300000 },
  { month: "4월", scenario1: 7450000, scenario2: 8400000, scenario3: 10100000 },
  { month: "5월", scenario1: 7300000, scenario2: 8150000, scenario3: 9700000 },
  { month: "6월", scenario1: 7500000, scenario2: 8500000, scenario3: 10200000 },
];

const KPICard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  icon: Icon, 
  color, 
  budget 
}: { 
  title: string;
  value: number;
  unit: string;
  trend: number;
  icon: any;
  color: string;
  budget?: number;
}) => {
  const isPositive = trend > 0;
  const formattedValue = unit === "원" 
    ? (value / 1000000).toFixed(1) + "M" 
    : value.toFixed(1);

  return (
    <Card className="p-6 border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
        <div className={`flex items-center gap-1 text-lg font-bold ${isPositive ? "text-success" : "text-destructive"}`}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
        <div className="text-5xl font-bold" style={{ color }}>
          {formattedValue}
          <span className="text-2xl ml-2">{unit}</span>
        </div>
        {budget && (
          <div className="text-sm text-muted-foreground">
            예산: {(budget / 1000000).toFixed(1)}M{unit}
          </div>
        )}
      </div>
    </Card>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const highestCost = activityCostData.reduce((max, item) => 
    item.value > max.value ? item : max
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                제품 관리
              </Button>
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold">LogiProfit 대시보드</h1>
                <p className="text-sm text-muted-foreground">수익성 & ABC 원가 분석 모듈</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-[1800px] space-y-8">
        {/* Section 1: Key KPI Summary */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            🥇 핵심 KPI 요약
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <KPICard
              title="총 매출"
              value={kpiData.totalRevenue.value}
              unit={kpiData.totalRevenue.unit}
              trend={kpiData.totalRevenue.trend}
              icon={TrendingUp}
              color={COLORS.profit}
            />
            <KPICard
              title="공헌이익"
              value={kpiData.contributionMargin.value}
              unit={kpiData.contributionMargin.unit}
              trend={kpiData.contributionMargin.trend}
              icon={TrendingUp}
              color={COLORS.profit}
            />
            <KPICard
              title="물류비용"
              value={kpiData.logisticsCost.value}
              unit={kpiData.logisticsCost.unit}
              trend={kpiData.logisticsCost.trend}
              icon={Package}
              color={COLORS.cost}
              budget={kpiData.logisticsCost.budget}
            />
            <KPICard
              title="재고회전율"
              value={kpiData.inventoryTurnover.value}
              unit={kpiData.inventoryTurnover.unit}
              trend={kpiData.inventoryTurnover.trend}
              icon={Package}
              color={COLORS.efficiency}
            />
            <KPICard
              title="OTIF"
              value={kpiData.otif.value}
              unit={kpiData.otif.unit}
              trend={kpiData.otif.trend}
              icon={Clock}
              color={COLORS.efficiency}
            />
          </div>
        </section>

        {/* Section 2: ABC-based Profitability Analysis */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            📊 활동기준원가(ABC) 및 다차원 손익 분석
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Report 1: Activity Cost Breakdown */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6" style={{ color: COLORS.cost }}>
                물류 활동별 원가 구성
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={activityCostData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${((entry.value / activityCostData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityCostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${(value / 1000000).toFixed(1)}M원`}
                    contentStyle={{ 
                      fontSize: "16px",
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-border">
                <p className="text-xl font-bold text-destructive">
                  ⚠️ 최대 비용: {highestCost.name} ({((highestCost.value / activityCostData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
                </p>
              </div>
            </Card>

            {/* Report 2: Customer/Route Contribution Margin */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6" style={{ color: COLORS.profit }}>
                고객/노선별 공헌이익 분석
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    dataKey="revenue" 
                    name="매출" 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    tick={{ fontSize: 14, fill: 'hsl(var(--muted-foreground))' }}
                  >
                    <Label value="매출액" position="insideBottom" offset={-10} style={{ fontSize: 16, fontWeight: "bold", fill: 'hsl(var(--foreground))' }} />
                  </XAxis>
                  <YAxis 
                    type="number" 
                    dataKey="marginRatio" 
                    name="이익률" 
                    unit="%" 
                    tick={{ fontSize: 14, fill: 'hsl(var(--muted-foreground))' }}
                  >
                    <Label value="공헌이익률 (%)" angle={-90} position="insideLeft" style={{ fontSize: 16, fontWeight: "bold", fill: 'hsl(var(--foreground))' }} />
                  </YAxis>
                  <Tooltip 
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ 
                      fontSize: "16px",
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "매출") return `${(value / 1000000).toFixed(1)}M원`;
                      if (name === "이익률") return `${value}%`;
                      if (name === "물류비") return `${(value / 1000000).toFixed(1)}M원`;
                      return value;
                    }}
                  />
                  <Scatter 
                    data={customerMarginData} 
                    fill={COLORS.profit}
                  >
                    {customerMarginData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.marginRatio > 35 ? COLORS.profit : COLORS.cost}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground">
                버블 크기 = 물류비용 | 🟢 고수익 (35%+) | 🔴 저수익
              </div>
            </Card>
          </div>

          {/* Report 3: Product Real Profit Margin */}
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6" style={{ color: COLORS.profit }}>
              품목별 실질 수익률 (물류비 포함)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productMarginData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="product" 
                  tick={{ fontSize: 16, fontWeight: "bold", fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  tick={{ fontSize: 16, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: "수익률 (%)", angle: -90, position: "insideLeft", style: { fontSize: 16, fontWeight: "bold", fill: 'hsl(var(--foreground))' } }}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  contentStyle={{ 
                    fontSize: "16px",
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="margin" fill={COLORS.profit} radius={[8, 8, 0, 0]}>
                  {productMarginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.margin > 30 ? COLORS.profit : COLORS.profitLight} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-muted-foreground">
              * 실질 수익률 = (매출 - 원가 - 물류비) / 매출 × 100
            </div>
          </Card>
        </section>

        {/* Section 3: Forecasting & Simulation */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            🔮 수요 예측 및 의사결정 시뮬레이션
          </h2>
          
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6" style={{ color: COLORS.cost }}>
              안전재고 시뮬레이션
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={scenarioData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 16, fontWeight: "bold", fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 16, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: "물류비용 (원)", angle: -90, position: "insideLeft", style: { fontSize: 16, fontWeight: "bold", fill: 'hsl(var(--foreground))' } }}
                />
                <Tooltip 
                  formatter={(value: number) => `${(value / 1000000).toFixed(1)}M원`}
                  contentStyle={{ 
                    fontSize: "16px",
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "16px", fontWeight: "bold" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scenario1" 
                  stroke={COLORS.efficiency} 
                  strokeWidth={3}
                  name="시나리오 1 (저재고)"
                  dot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scenario2" 
                  stroke={COLORS.cost} 
                  strokeWidth={3}
                  name="시나리오 2 (중재고)"
                  dot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scenario3" 
                  stroke={COLORS.costLight} 
                  strokeWidth={3}
                  name="시나리오 3 (고재고)"
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="text-sm font-semibold text-muted-foreground mb-1">시나리오 1 (저재고)</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.efficiency }}>
                  평균 7.3M원
                </div>
                <div className="text-sm text-muted-foreground mt-1">재고 부족 리스크 높음</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="text-sm font-semibold text-muted-foreground mb-1">시나리오 2 (중재고)</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.cost }}>
                  평균 8.2M원
                </div>
                <div className="text-sm text-muted-foreground mt-1">최적 균형점 (권장)</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="text-sm font-semibold text-muted-foreground mb-1">시나리오 3 (고재고)</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.costLight }}>
                  평균 9.8M원
                </div>
                <div className="text-sm text-muted-foreground mt-1">보관비용 과다</div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
