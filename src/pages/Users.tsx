import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Shield, Clock, User, Mail, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompanyProfile {
  id: string;
  user_id: string;
  username: string;
  company_name: string;
  business_number: string;
  ceo_name: string;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  role?: 'admin' | 'user';
}

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<CompanyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<CompanyProfile | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('company_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .eq('role', 'admin')
            .single();

          return {
            ...profile,
            role: roleData ? 'admin' : 'user'
          } as CompanyProfile;
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "데이터 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "상태 변경 완료",
        description: `회원 상태가 ${newStatus === 'approved' ? '승인' : '거부'}되었습니다.`,
      });

      fetchUsers();
      setShowDetailDialog(false);
    } catch (error: any) {
      toast({
        title: "상태 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleAdminRole = async (userId: string, currentRole: 'admin' | 'user') => {
    try {
      if (currentRole === 'admin') {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;

        toast({
          title: "역할 변경",
          description: "관리자 권한이 제거되었습니다.",
        });
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin'
          });

        if (error) throw error;

        toast({
          title: "역할 변경",
          description: "관리자 권한이 부여되었습니다.",
        });
      }

      fetchUsers();
      setShowDetailDialog(false);
    } catch (error: any) {
      toast({
        title: "역할 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />승인됨</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />거부됨</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />대기중</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">접근 권한 없음</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              관리자만 접근할 수 있는 페이지입니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground mt-1">회원 승인 및 관리자 권한 설정</p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          새로고침
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">등록된 사용자가 없습니다.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자명</TableHead>
                    <TableHead>회사명</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {user.username}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {user.company_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>{user.business_number}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge variant="default">
                            <Shield className="w-3 h-3 mr-1" />
                            관리자
                          </Badge>
                        ) : (
                          <Badge variant="outline">일반</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailDialog(true);
                          }}
                        >
                          관리
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>사용자 정보 및 관리</DialogTitle>
            <DialogDescription>회원 승인 및 관리자 권한을 설정할 수 있습니다.</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">사용자명</Label>
                  <div className="text-lg font-semibold">{selectedUser.username}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">회사명</Label>
                  <div className="text-lg">{selectedUser.company_name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">대표자명</Label>
                  <div className="text-lg">{selectedUser.ceo_name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">사업자번호</Label>
                  <div className="text-lg">{selectedUser.business_number}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">이메일</Label>
                  <div className="text-lg">{selectedUser.email}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">연락처</Label>
                  <div className="text-lg">{selectedUser.phone}</div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">회원 상태</Label>
                  <div className="flex gap-2 mt-2">
                    {selectedUser.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => updateUserStatus(selectedUser.user_id, 'approved')}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          승인
                        </Button>
                        <Button
                          onClick={() => updateUserStatus(selectedUser.user_id, 'rejected')}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          거부
                        </Button>
                      </>
                    )}
                    {selectedUser.status === 'approved' && (
                      <Button
                        onClick={() => updateUserStatus(selectedUser.user_id, 'rejected')}
                        variant="destructive"
                        className="w-full"
                      >
                        승인 취소
                      </Button>
                    )}
                    {selectedUser.status === 'rejected' && (
                      <Button
                        onClick={() => updateUserStatus(selectedUser.user_id, 'approved')}
                        className="w-full"
                      >
                        승인
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">관리자 권한</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => toggleAdminRole(selectedUser.user_id, selectedUser.role || 'user')}
                      variant={selectedUser.role === 'admin' ? 'destructive' : 'default'}
                      className="w-full"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {selectedUser.role === 'admin' ? '관리자 권한 제거' : '관리자 권한 부여'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
