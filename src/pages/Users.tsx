import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLog } from "@/components/ActivityLog";
import { UserPlus, Mail, Phone, CheckCircle, XCircle, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: '활성' | '대기' | '비활성';
  permissions: {
    productManagement: boolean;
    inventoryManagement: boolean;
    purchaseManagement: boolean;
    outboundManagement: boolean;
    userManagement: boolean;
    analytics: boolean;
  };
  userCode: string;
}

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    { 
      id: 1, 
      name: '김영업', 
      email: 'sales1@logibot.com', 
      role: '영업팀', 
      phone: '010-1234-5678', 
      status: '활성',
      userCode: 'U001',
      permissions: {
        productManagement: true,
        inventoryManagement: true,
        purchaseManagement: false,
        outboundManagement: true,
        userManagement: false,
        analytics: true,
      }
    },
    { 
      id: 2, 
      name: '박물류', 
      email: 'logistics1@logibot.com', 
      role: '물류팀', 
      phone: '010-2345-6789', 
      status: '활성',
      userCode: 'U002',
      permissions: {
        productManagement: true,
        inventoryManagement: true,
        purchaseManagement: true,
        outboundManagement: true,
        userManagement: false,
        analytics: false,
      }
    },
    { 
      id: 3, 
      name: '이재고', 
      email: 'inventory1@logibot.com', 
      role: '재고팀', 
      phone: '010-3456-7890', 
      status: '활성',
      userCode: 'U003',
      permissions: {
        productManagement: true,
        inventoryManagement: true,
        purchaseManagement: true,
        outboundManagement: false,
        userManagement: false,
        analytics: false,
      }
    },
    { 
      id: 4, 
      name: '최관리', 
      email: 'admin1@logibot.com', 
      role: '관리자', 
      phone: '010-4567-8901', 
      status: '활성',
      userCode: 'U004',
      permissions: {
        productManagement: true,
        inventoryManagement: true,
        purchaseManagement: true,
        outboundManagement: true,
        userManagement: true,
        analytics: true,
      }
    },
    { 
      id: 5, 
      name: '정신규', 
      email: 'new1@logibot.com', 
      role: '영업팀', 
      phone: '010-5678-9012', 
      status: '대기',
      userCode: 'U005',
      permissions: {
        productManagement: false,
        inventoryManagement: false,
        purchaseManagement: false,
        outboundManagement: false,
        userManagement: false,
        analytics: false,
      }
    },
  ]);

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    password: ''
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const user: User = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      status: '대기',
      userCode: `U${String(users.length + 1).padStart(3, '0')}`,
      permissions: {
        productManagement: false,
        inventoryManagement: false,
        purchaseManagement: false,
        outboundManagement: false,
        userManagement: false,
        analytics: false,
      }
    };

    setUsers([...users, user]);
    setIsAddUserDialogOpen(false);
    setNewUser({ name: '', email: '', role: '', phone: '', password: '' });
    
    toast({
      title: "사용자 추가 완료",
      description: `${user.name}님이 승인 대기 상태로 추가되었습니다.`,
    });
  };

  const handleApproveUser = (userId: number) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: '활성' as const } : u
    ));
    
    const user = users.find(u => u.id === userId);
    toast({
      title: "사용자 승인",
      description: `${user?.name}님이 승인되었습니다.`,
    });
  };

  const handleRejectUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    
    toast({
      title: "사용자 거부",
      description: `${user?.name}님의 가입이 거부되었습니다.`,
      variant: "destructive"
    });
  };

  const openPermissionDialog = (user: User) => {
    setSelectedUser(user);
    setIsPermissionDialogOpen(true);
  };

  const handlePermissionChange = (permission: keyof User['permissions']) => {
    if (!selectedUser) return;
    
    setSelectedUser({
      ...selectedUser,
      permissions: {
        ...selectedUser.permissions,
        [permission]: !selectedUser.permissions[permission]
      }
    });
  };

  const savePermissions = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(u => 
      u.id === selectedUser.id ? selectedUser : u
    ));
    
    setIsPermissionDialogOpen(false);
    toast({
      title: "권한 변경 완료",
      description: `${selectedUser.name}님의 권한이 업데이트되었습니다.`,
    });
  };

  const activeUsers = users.filter(u => u.status === '활성');
  const pendingUsers = users.filter(u => u.status === '대기');

  const permissionLabels = {
    productManagement: '상품관리',
    inventoryManagement: '재고관리',
    purchaseManagement: '매입관리',
    outboundManagement: '출고관리',
    userManagement: '사용자관리',
    analytics: '분석/통계',
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">팀원 및 권한 관리</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setIsAddUserDialogOpen(true)}>
          <UserPlus className="w-5 h-5" />
          새 사용자 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">전체 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">활성 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{activeUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">승인 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">{pendingUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">
              {users.filter(u => u.role === '관리자').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">사용자 목록</TabsTrigger>
          <TabsTrigger value="logs">
            <Clock className="h-4 w-4 mr-2" />
            작업 로그
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">사용자 목록</CardTitle>
              <CardDescription>사용자 정보 및 권한을 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>사용자 코드</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono font-semibold">{user.userCode}</TableCell>
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
                        <Badge variant={
                          user.status === '활성' ? 'default' : 
                          user.status === '대기' ? 'secondary' : 
                          'destructive'
                        }>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          {user.status === '대기' ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleApproveUser(user.id)}
                                className="gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                승인
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectUser(user.id)}
                                className="gap-1"
                              >
                                <XCircle className="h-4 w-4" />
                                거부
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openPermissionDialog(user)}
                              className="gap-1"
                            >
                              <Shield className="h-4 w-4" />
                              권한 설정
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <ActivityLog />
        </TabsContent>
      </Tabs>

      {/* 사용자 추가 다이얼로그 */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 사용자 추가</DialogTitle>
            <DialogDescription>
              새로운 사용자를 등록합니다. 관리자 승인 후 활성화됩니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="홍길동"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@logibot.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">역할 *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="영업팀">영업팀</SelectItem>
                  <SelectItem value="물류팀">물류팀</SelectItem>
                  <SelectItem value="재고팀">재고팀</SelectItem>
                  <SelectItem value="관리자">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="010-1234-5678"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="password">초기 비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="8자 이상 입력"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddUser}>
              사용자 추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 설정 다이얼로그 */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>권한 설정</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}님의 기능 사용 권한을 설정합니다
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-base">{label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'userManagement' ? '사용자 추가 및 권한 관리' : `${label} 메뉴 접근 및 데이터 수정`}
                    </p>
                  </div>
                  <Switch
                    checked={selectedUser.permissions[key as keyof User['permissions']]}
                    onCheckedChange={() => handlePermissionChange(key as keyof User['permissions'])}
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={savePermissions}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
