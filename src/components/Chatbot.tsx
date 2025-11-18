import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Message {
  id: string;
  text?: string;
  chart?: 'pie' | 'bar';
  chartData?: any[];
  sender: 'user' | 'bot';
  timestamp: Date;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요! 로지봇입니다. 재고, 주문, 통계에 대해 질문해주세요.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input.toLowerCase();
    setInput('');

    // 키워드 기반 응답
    setTimeout(() => {
      let response: Message;

      if (query.includes('재고') || query.includes('제품')) {
        response = {
          id: (Date.now() + 1).toString(),
          text: '현재 재고 현황입니다:',
          chart: 'pie',
          chartData: [
            { name: '정상', value: 15 },
            { name: '부족', value: 8 },
            { name: '과다', value: 3 },
          ],
          sender: 'bot',
          timestamp: new Date()
        };
      } else if (query.includes('매출') || query.includes('판매') || query.includes('통계')) {
        response = {
          id: (Date.now() + 1).toString(),
          text: '최근 6개월 매출 추이입니다:',
          chart: 'bar',
          chartData: [
            { month: '1월', 매출: 45 },
            { month: '2월', 매출: 52 },
            { month: '3월', 매출: 48 },
            { month: '4월', 매출: 61 },
            { month: '5월', 매출: 55 },
            { month: '6월', 매출: 67 },
          ],
          sender: 'bot',
          timestamp: new Date()
        };
      } else if (query.includes('주문') || query.includes('출고')) {
        response = {
          id: (Date.now() + 1).toString(),
          text: '주문 현황: 총 32건, 금일 출고 15건, 대기 8건입니다.',
          sender: 'bot',
          timestamp: new Date()
        };
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          text: '재고, 매출, 주문 등에 대해 질문해주세요.',
          sender: 'bot',
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, response]);
    }, 800);
  };

  return (
    <>
      {/* 챗봇 버튼 */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* 챗봇 창 */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">로지봇</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/20 text-primary-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 메시지 영역 */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {message.text && (
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('ko-KR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  )}
                  
                  {/* 차트 렌더링 */}
                  {message.chart && message.chartData && (
                    <div className="w-full max-w-[300px] mt-2 p-3 rounded-lg bg-card border">
                      <ResponsiveContainer width="100%" height={200}>
                        {message.chart === 'pie' ? (
                          <PieChart>
                            <Pie
                              data={message.chartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              fill="hsl(var(--primary))"
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {message.chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        ) : (
                          <BarChart data={message.chartData}>
                            <XAxis dataKey="month" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            <Bar dataKey="매출" fill="hsl(var(--primary))" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* 입력 영역 */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="메시지를 입력하세요..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
