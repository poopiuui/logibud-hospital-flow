import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Phone } from "lucide-react";

export default function Users() {
  const users = [
    { id: 1, name: '김영업', email: 'sales1@logibot.com', role: '영업팀', phone: '010-1234-5678', status: '활성' },
    { id: 2, name: '박물류', email: 'logistics1@logibot.com', role: '물류팀', phone: '010-2345-6789', status: '활성' },
    { id: 3, name: '이재고', email: 'inventory1@logibot.com', role: '재고팀', phone: '010-3456-7890', status: '활성' },
    { id: 4, name: '최관리', email: 'admin1@logibot.com', role: '관리자', phone: '010-4567-8901', status: '활성' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">팀원 및 권한 관리</p>
        </div>
        <Button size="lg" className="gap-2">
          <UserPlus className="w-5 h-5" />
          새 사용자 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">전체 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">24</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">영업팀</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">물류팀</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">12</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {user.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">편집</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
