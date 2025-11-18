import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { Bell, Lock, Database, Mail, Type, Building } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState([100]);
  const [companyName, setCompanyName] = useState(localStorage.getItem('companyName') || '로지봇');
  const [companyLogo, setCompanyLogo] = useState(localStorage.getItem('companyLogo') || '');
  const [companyDescription, setCompanyDescription] = useState(localStorage.getItem('companyDescription') || '');

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
    document.documentElement.style.fontSize = `${value[0]}%`;
  };

  const handleCompanyInfoSave = () => {
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('companyLogo', companyLogo);
    localStorage.setItem('companyDescription', companyDescription);
    
    toast({
      title: "회사 정보 저장",
      description: "회사 정보가 업데이트되었습니다. 페이지를 새로고침하면 반영됩니다.",
    });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">설정</h1>
        <p className="text-muted-foreground text-lg mt-2">시스템 설정 및 환경 구성</p>
      </div>

      <div className="grid gap-6">
        {/* 일반 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">일반 설정</CardTitle>
            <CardDescription>기본 시스템 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>다크 모드</Label>
                <p className="text-sm text-muted-foreground">화면 테마를 변경합니다</p>
              </div>
              <ThemeToggle />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <Label>글자 크기</Label>
                </div>
                <p className="text-sm text-muted-foreground">전체 화면의 글자 크기를 조절합니다</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm w-12">작게</span>
                <Slider
                  value={fontSize}
                  onValueChange={handleFontSizeChange}
                  min={80}
                  max={120}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm w-12">크게</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                현재: {fontSize[0]}%
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>자동 저장</Label>
                <p className="text-sm text-muted-foreground">변경사항을 자동으로 저장합니다</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Bell className="w-6 h-6" />
              알림 설정
            </CardTitle>
            <CardDescription>알림 및 이메일 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>재고 알림</Label>
                <p className="text-sm text-muted-foreground">안전 재고 미달 시 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>이메일 알림</Label>
                <p className="text-sm text-muted-foreground">중요 이벤트 이메일 수신</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>배송 알림</Label>
                <p className="text-sm text-muted-foreground">배송 상태 변경 알림</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 데이터 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Database className="w-6 h-6" />
              데이터 관리
            </CardTitle>
            <CardDescription>데이터 백업 및 관리</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>데이터 백업</Label>
                <p className="text-sm text-muted-foreground">마지막 백업: 2024-01-15 09:00</p>
              </div>
              <Button variant="outline">백업 실행</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>데이터 내보내기</Label>
                <p className="text-sm text-muted-foreground">Excel 형식으로 내보내기</p>
              </div>
              <Button variant="outline">내보내기</Button>
            </div>
          </CardContent>
        </Card>

        {/* 회사 정보 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building className="w-6 h-6" />
              회사 정보
            </CardTitle>
            <CardDescription>회사 로고와 이름을 설정합니다. 사이드바에 표시됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">회사 이름</Label>
              <Input 
                id="company-name" 
                placeholder="로지봇" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-logo">회사 로고 URL</Label>
              <Input 
                id="company-logo" 
                placeholder="https://example.com/logo.png"
                type="url"
                value={companyLogo}
                onChange={(e) => setCompanyLogo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                로고 이미지 URL을 입력하세요. 사이드바 상단에 표시됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-description">회사 설명</Label>
              <Input 
                id="company-description" 
                placeholder="물류 통합 관리 시스템"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
              />
            </div>

            <Button onClick={handleCompanyInfoSave}>회사 정보 저장</Button>
          </CardContent>
        </Card>

        {/* 보안 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="w-6 h-6" />
              보안 설정
            </CardTitle>
            <CardDescription>계정 보안 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>비밀번호 변경</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
