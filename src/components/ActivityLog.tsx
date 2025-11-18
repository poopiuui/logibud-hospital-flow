import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Clock, User, FileEdit, Trash2, Plus, Download } from "lucide-react";
import { useState } from "react";

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  type: 'create' | 'update' | 'delete' | 'access';
}

const sampleLogs: ActivityLogEntry[] = [
  { id: '1', timestamp: '2024-12-15 14:30:25', user: '김관리', action: '사용자 추가', target: '이신규', details: '새 사용자 계정 생성', type: 'create' },
  { id: '2', timestamp: '2024-12-15 14:28:10', user: '박물류', action: '재고 수정', target: '주사기(5ml)', details: '재고 수량 업데이트: 850 → 900', type: 'update' },
  { id: '3', timestamp: '2024-12-15 14:25:42', user: '최영업', action: '출고 등록', target: 'O-007', details: '스마트마켓으로 출고 등록', type: 'create' },
  { id: '4', timestamp: '2024-12-15 14:20:15', user: '이재고', action: '제품 삭제', target: 'P-099', details: '단종 제품 삭제', type: 'delete' },
  { id: '5', timestamp: '2024-12-15 14:15:30', user: '김관리', action: '권한 변경', target: '박물류', details: '재고관리 권한 부여', type: 'update' },
  { id: '6', timestamp: '2024-12-15 14:10:22', user: '최영업', action: '견적서 생성', target: 'QT-20241215-001', details: '노트북 A1 견적서 생성', type: 'create' },
  { id: '7', timestamp: '2024-12-15 14:05:18', user: '박물류', action: '매입 등록', target: 'P-008', details: '㈜글로벌물류로부터 매입', type: 'create' },
  { id: '8', timestamp: '2024-12-15 14:00:05', user: '이재고', action: '재고 조회', target: '전체 재고', details: '재고 현황 조회', type: 'access' },
];

export function ActivityLog() {
  const [logs] = useState<ActivityLogEntry[]>(sampleLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const uniqueUsers = Array.from(new Set(logs.map(log => log.user)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.type === actionFilter;
    const matchesUser = userFilter === "all" || log.user === userFilter;
    
    return matchesSearch && matchesAction && matchesUser;
  });

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <FileEdit className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'access':
        return <Download className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionVariant = (type: string) => {
    switch (type) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'access':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'create':
        return '생성';
      case 'update':
        return '수정';
      case 'delete':
        return '삭제';
      case 'access':
        return '조회';
      default:
        return '기타';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Clock className="h-6 w-6" />
          작업 로그
        </CardTitle>
        <CardDescription>
          관리자 계정에서 모든 작업 내역을 확인할 수 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="사용자, 작업, 대상으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[160px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="사용자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 사용자</SelectItem>
              {uniqueUsers.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="작업 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 작업</SelectItem>
              <SelectItem value="create">생성</SelectItem>
              <SelectItem value="update">수정</SelectItem>
              <SelectItem value="delete">삭제</SelectItem>
              <SelectItem value="access">조회</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[500px] rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50">
              <TableRow>
                <TableHead>시간</TableHead>
                <TableHead>사용자</TableHead>
                <TableHead>작업</TableHead>
                <TableHead>대상</TableHead>
                <TableHead>상세 내용</TableHead>
                <TableHead>유형</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {log.timestamp}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {log.user}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell className="font-medium">
                      {log.target}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getActionVariant(log.type)}
                        className="gap-1"
                      >
                        {getActionIcon(log.type)}
                        {getActionLabel(log.type)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="mt-4 text-sm text-muted-foreground">
          총 {filteredLogs.length}개의 작업 로그
        </div>
      </CardContent>
    </Card>
  );
}
