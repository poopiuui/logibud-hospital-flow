import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, Package } from "lucide-react";

interface StockHistoryItem {
  date: string;
  type: '입고' | '출고';
  quantity: number;
  reason: string;
  staff: string;
}

interface StockHistoryProps {
  productName: string;
  productCode: string;
  isOpen: boolean;
  onClose: () => void;
}

// 샘플 데이터 생성 함수
const generateSampleHistory = (productCode: string): StockHistoryItem[] => {
  const types: ('입고' | '출고')[] = ['입고', '출고'];
  const reasons = {
    입고: ['매입', '반품입고', '재고조정'],
    출고: ['판매', '폐기', '샘플제공', '재고조정']
  };
  const staff = ['김담당', '이직원', '박팀장', '최사원'];
  
  const history: StockHistoryItem[] = [];
  const today = new Date();
  
  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const type = types[Math.floor(Math.random() * types.length)];
    
    history.push({
      date: date.toLocaleDateString('ko-KR'),
      type,
      quantity: Math.floor(Math.random() * 100) + 10,
      reason: reasons[type][Math.floor(Math.random() * reasons[type].length)],
      staff: staff[Math.floor(Math.random() * staff.length)]
    });
  }
  
  return history;
};

export function StockHistory({ productName, productCode, isOpen, onClose }: StockHistoryProps) {
  const history = generateSampleHistory(productCode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6" />
            입출고 내역 - {productName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">품목코드: {productCode}</p>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">일자</TableHead>
                <TableHead className="text-center">구분</TableHead>
                <TableHead className="text-center">수량</TableHead>
                <TableHead className="text-center">사유</TableHead>
                <TableHead className="text-center">담당자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={item.type === '입고' ? 'default' : 'secondary'}
                      className="flex items-center gap-1 justify-center w-fit mx-auto"
                    >
                      {item.type === '입고' ? (
                        <ArrowDownCircle className="h-3 w-3" />
                      ) : (
                        <ArrowUpCircle className="h-3 w-3" />
                      )}
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {item.type === '입고' ? '+' : '-'}{item.quantity}
                  </TableCell>
                  <TableCell className="text-center">{item.reason}</TableCell>
                  <TableCell className="text-center">{item.staff}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
