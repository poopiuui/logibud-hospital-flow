import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLog } from "@/components/ActivityLog";
import { UserPlus, Mail, Phone, CheckCircle, XCircle, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: '활성' | '대기' | '비활성';
  permissions: {
    productManagement: Permission;
    inventoryManagement: Permission;
    purchaseManagement: Permission;
    outboundManagement: Permission;
    shippingManagement: Permission;
    billingManagement: Permission;
    userManagement: Permission;
    analytics: Permission;
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
        productManagement: { view: true, create: true, edit: true, delete: false },
        inventoryManagement: { view: true, create: true, edit: true, delete: false },
        purchaseManagement: { view: false, create: false, edit: false, delete: false },
        outboundManagement: { view: true, create: true, edit: true, delete: false },
        shippingManagement: { view: true, create: true, edit: true, delete: false },
        billingManagement: { view: true, create: false, edit: false, delete: false },
        userManagement: { view: false, create: false, edit: false, delete: false },
        analytics: { view: true, create: false, edit: false, delete: false },
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
        productManagement: { view: true, create: true, edit: true, delete: false },
        inventoryManagement: { view: true, create: true, edit: true, delete: true },
        purchaseManagement: { view: true, create: true, edit: true, delete: false },
        outboundManagement: { view: true, create: true, edit: true, delete: false },
        shippingManagement: { view: true, create: true, edit: true, delete: false },
        billingManagement: { view: false, create: false, edit: false, delete: false },
        userManagement: { view: false, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
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
        productManagement: { view: true, create: true, edit: true, delete: true },
        inventoryManagement: { view: true, create: true, edit: true, delete: true },
        purchaseManagement: { view: true, create: true, edit: true, delete: true },
        outboundManagement: { view: true, create: true, edit: true, delete: true },
        shippingManagement: { view: true, create: true, edit: true, delete: true },
        billingManagement: { view: true, create: true, edit: true, delete: true },
        userManagement: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, create: true, edit: true, delete: true },
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
        productManagement: { view: false, create: false, edit: false, delete: false },
        inventoryManagement: { view: false, create: false, edit: false, delete: false },
        purchaseManagement: { view: false, create: false, edit: false, delete: false },
        outboundManagement: { view: false, create: false, edit: false, delete: false },
        shippingManagement: { view: false, create: false, edit: false, delete: false },
        billingManagement: { view: false, create: false, edit: false, delete: false },
        userManagement: { view: false, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
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
  });

  const handleAddUser = () => {
    const tempPassword = Math.random().toString(36).slice(-8);
    const userCode = `U${String(users.length + 1).padStart(3, '0')}`;
    
    toast({
      title: "사용자 추가 완료",
      description: `${newUser.name} (${userCode})님이 추가되었습니다. 임시 비밀번호: ${tempPassword}`,
    });
    
    setIsAddUserDialogOpen(false);
    setNewUser({ name: '', email: '', role: '', phone: '' });
  };

  const handleApproveUser = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: '활성' as const } : user
    ));
    toast({
      title: "사용자 승인 완료",
      description: "사용자가 승인되었습니다.",
    });
  };

  const handleRejectUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "사용자 거부",
      description: "사용자가 거부되었습니다.",
      variant: "destructive",
    });
  };

  const openPermissionDialog = (user: User) => {
    setSelectedUser(user);
    setIsPermissionDialogOpen(true);
  };

  const handlePermissionChange = (category: keyof User['permissions'], action: keyof Permission, value: boolean) => {
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        permissions: {
          ...selectedUser.permissions,
          [category]: {
            ...selectedUser.permissions[category],
            [action]: value
          }
        }
      });
    }
  };

  const savePermissions = () => {
    if (selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      toast({
        title: "권한 설정 완료",
        description: "사용자 권한이 업데이트되었습니다.",
      });
      setIsPermissionDialogOpen(false);
    }
  };

  const activeUsers = users.filter(u => u.status === '활성');
  const pendingUsers = users.filter(u => u.status === '대기');
  const adminUsers = users.filter(u => u.role === '관리자');

  const permissionCategories = [
    { key: 'productManagement' as const, label: '상품관리' },
    { key: 'inventoryManagement' as const, label: '재고관리' },
    { key: 'purchaseManagement' as const, label: '매입관리' },
    { key: 'outboundManagement' as const, label: '출고관리' },
    { key: 'shippingManagement' as const, label: '배송관리' },
    { key: 'billingManagement' as const, label: '청구관리' },
    { key: 'userManagement' as const, label: '사용자관리' },
    { key: 'analytics' as const, label: '분석' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground text-lg mt-2">시스템 사용자 및 권한 관리</p>
        </div>
        <Button onClick={() => setIsAddUserDialogOpen(true)} size="lg">
          <UserPlus className="mr-2 h-5 w-5" />
          신규 사용자 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">전체 사용자</CardTitle>
            <Shield className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">활성 사용자</CardTitle>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeUsers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">대기중</CardTitle>
            <Clock className="h-6 w-6 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingUsers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">관리자</CardTitle>
            <Shield className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adminUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 사용자 목록 및 활동 로그 탭 */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="text-base">사용자 목록</TabsTrigger>
          <TabsTrigger value="activity" className="text-base">활동 로그</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">사용자 목록</CardTitle>
              <CardDescription>등록된 사용자 및 권한 정보</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold text-base">사용자 코드</TableHead>
                      <TableHead className="font-bold text-base">이름</TableHead>
                      <TableHead className="font-bold text-base">이메일</TableHead>
                      <TableHead className="font-bold text-base">팀/역할</TableHead>
                      <TableHead className="font-bold text-base">전화번호</TableHead>
                      <TableHead className="font-bold text-base">상태</TableHead>
                      <TableHead className="font-bold text-base text-center">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono font-semibold text-base">{user.userCode}</TableCell>
                        <TableCell className="font-medium text-base">{user.name}</TableCell>
                        <TableCell className="text-base">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-base">
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-base">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {user.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === '활성' ? 'default' : 
                              user.status === '대기' ? 'secondary' : 
                              'destructive'
                            }
                          >
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
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  승인
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectUser(user.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  거부
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPermissionDialog(user)}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                권한 설정
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog />
        </TabsContent>
      </Tabs>

      {/* 신규 사용자 추가 Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">신규 사용자 추가</DialogTitle>
            <DialogDescription>
              새로운 사용자를 추가하고 임시 비밀번호를 발급합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="이름 입력"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="이메일 입력"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">팀/역할</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="팀 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="영업팀">영업팀</SelectItem>
                  <SelectItem value="물류팀">물류팀</SelectItem>
                  <SelectItem value="재고팀">재고팀</SelectItem>
                  <SelectItem value="관리자">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="전화번호 입력"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>취소</Button>
            <Button onClick={handleAddUser}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 설정 Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">권한 설정 - {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              사용자별 세부 권한을 설정합니다.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              {permissionCategories.map((category) => (
                <Card key={category.key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{category.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category.key}-view`}
                          checked={selectedUser.permissions[category.key].view}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(category.key, 'view', checked as boolean)
                          }
                        />
                        <Label htmlFor={`${category.key}-view`} className="text-sm">조회</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category.key}-create`}
                          checked={selectedUser.permissions[category.key].create}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(category.key, 'create', checked as boolean)
                          }
                        />
                        <Label htmlFor={`${category.key}-create`} className="text-sm">생성</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category.key}-edit`}
                          checked={selectedUser.permissions[category.key].edit}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(category.key, 'edit', checked as boolean)
                          }
                        />
                        <Label htmlFor={`${category.key}-edit`} className="text-sm">수정</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category.key}-delete`}
                          checked={selectedUser.permissions[category.key].delete}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(category.key, 'delete', checked as boolean)
                          }
                        />
                        <Label htmlFor={`${category.key}-delete`} className="text-sm">삭제</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>취소</Button>
            <Button onClick={savePermissions}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
