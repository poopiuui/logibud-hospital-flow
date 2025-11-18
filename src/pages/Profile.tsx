import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Lock } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "관리자",
    email: "admin@logibot.com",
    phone: "010-1234-5678",
    department: "물류팀"
  });

  const [companyInfo, setCompanyInfo] = useState({
    name: "로지프로핏",
    businessNumber: "123-45-67890",
    fax: "02-1234-5678",
    phone: "02-9876-5432"
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "프로필 업데이트",
      description: "프로필이 성공적으로 업데이트되었습니다."
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "비밀번호 변경",
      description: "비밀번호가 성공적으로 변경되었습니다."
    });

    setPassword({ current: "", new: "", confirm: "" });
  };

  const handleCompanyUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "회사 정보 업데이트",
      description: "회사 정보가 성공적으로 업데이트되었습니다."
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">계정 정보</h1>
        <p className="text-muted-foreground">계정 정보를 관리합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>회사 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCompanyUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">회사명</Label>
                <Input
                  id="companyName"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자번호</Label>
                <Input
                  id="businessNumber"
                  value={companyInfo.businessNumber}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, businessNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">대표전화번호</Label>
                <Input
                  id="companyPhone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">팩스번호</Label>
                <Input
                  id="fax"
                  value={companyInfo.fax}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, fax: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit">회사 정보 저장</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 p-6 bg-muted rounded-lg">
        <Avatar className="w-20 h-20">
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            관
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-muted-foreground">{profile.department}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">부서</Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">저장</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            비밀번호 변경
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">비밀번호 변경</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
