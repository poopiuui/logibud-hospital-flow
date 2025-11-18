import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { Bell, Lock, Database, Mail, Type, Building, Upload, X } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState([100]);
  const [companyName, setCompanyName] = useState(localStorage.getItem('companyName') || '로지봇');
  const [companyLogo, setCompanyLogo] = useState(localStorage.getItem('companyLogo') || '');
  const [companyDescription, setCompanyDescription] = useState(localStorage.getItem('companyDescription') || '');
  const [companyBusinessNumber, setCompanyBusinessNumber] = useState(localStorage.getItem('companyBusinessNumber') || '');
  const [companyPhone, setCompanyPhone] = useState(localStorage.getItem('companyPhone') || '');
  const [companyFax, setCompanyFax] = useState(localStorage.getItem('companyFax') || '');
  const [logoPreview, setLogoPreview] = useState(localStorage.getItem('companyLogo') || '');

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
    document.documentElement.style.fontSize = `${value[0]}%`;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "오류",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // 이미지를 500x500에 맞게 그리기 (비율 유지하며 crop)
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          ctx.drawImage(img, x, y, size, size, 0, 0, 500, 500);
          
          const base64 = canvas.toDataURL('image/png');
          setCompanyLogo(base64);
          setLogoPreview(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setCompanyLogo('');
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCompanyInfoSave = () => {
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('companyLogo', companyLogo);
    localStorage.setItem('companyDescription', companyDescription);
    localStorage.setItem('companyBusinessNumber', companyBusinessNumber);
    localStorage.setItem('companyPhone', companyPhone);
    localStorage.setItem('companyFax', companyFax);
    
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

        {/* 메뉴 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">메뉴 관리</CardTitle>
            <CardDescription>사이드바 메뉴를 커스터마이징하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              사용하지 않는 메뉴를 숨기거나 순서를 변경할 수 있습니다.
            </p>
            <Button variant="outline" className="w-full" onClick={() => {
              toast({
                title: "개발 예정",
                description: "메뉴 커스터마이징 기능은 곧 제공될 예정입니다.",
              });
            }}>
              메뉴 설정 열기
            </Button>
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
              <Label htmlFor="company-logo">회사 로고 (500x500)</Label>
              <div className="flex items-center gap-4">
                <Input
                  ref={fileInputRef}
                  id="company-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  로고 업로드
                </Button>
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Company logo preview"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                      onClick={handleLogoRemove}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                이미지를 업로드하면 자동으로 500x500 크기로 조정됩니다.
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

            <div className="space-y-2">
              <Label htmlFor="company-business-number">사업자번호</Label>
              <Input 
                id="company-business-number" 
                placeholder="123-45-67890" 
                value={companyBusinessNumber}
                onChange={(e) => setCompanyBusinessNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-phone">전화번호</Label>
              <Input 
                id="company-phone" 
                placeholder="02-1234-5678" 
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-fax">팩스번호</Label>
              <Input 
                id="company-fax" 
                placeholder="02-1234-5679" 
                value={companyFax}
                onChange={(e) => setCompanyFax(e.target.value)}
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
