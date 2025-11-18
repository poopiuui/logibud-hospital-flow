import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Clock, CheckCircle2 } from "lucide-react";

interface LogisticsStatus {
  outboundWaiting: number;
  outboundComplete: number;
  inTransit: number;
  deliveryComplete: number;
}

export const LogisticsWidget = () => {
  // 실제 데이터는 localStorage나 API에서 가져올 수 있습니다
  const getLogisticsStatus = (): LogisticsStatus => {
    // Mock data - 실제로는 localStorage나 API 연동
    return {
      outboundWaiting: 12,
      outboundComplete: 8,
      inTransit: 15,
      deliveryComplete: 45,
    };
  };

  const status = getLogisticsStatus();

  const statusItems = [
    {
      label: "출고대기",
      count: status.outboundWaiting,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "출고완료",
      count: status.outboundComplete,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "배송중",
      count: status.inTransit,
      icon: Truck,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "배송완료",
      count: status.deliveryComplete,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          물류 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center p-4 rounded-lg ${item.bgColor} transition-all hover:scale-105`}
            >
              <item.icon className={`h-8 w-8 ${item.color} mb-2`} />
              <div className="text-2xl font-bold mb-1">{item.count}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">총 처리 중</span>
            <Badge variant="outline" className="text-lg font-semibold">
              {status.outboundWaiting + status.outboundComplete + status.inTransit}건
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
