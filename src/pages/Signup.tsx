import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Upload } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    companyName: "",
    businessNumber: "",
    ceoName: "",
    phone: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.passwordConfirm ||
        !formData.companyName || !formData.businessNumber || !formData.ceoName || !formData.phone) {
      toast({
        title: "입력 오류",
        description: "필수 항목(*)을 모두 입력하세요.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.username.length < 4) {
      toast({
        title: "입력 오류",
        description: "아이디는 4자 이상이어야 합니다.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: "입력 오류",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast({
        title: "입력 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "입력 오류",
        description: "올바른 이메일 형식이 아닙니다.",
        variant: "destructive",
      });
      return false;
    }

    if (!file) {
      toast({
        title: "파일 필요",
        description: "사업자등록증을 업로드하세요.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. Supabase Auth로 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("사용자 생성 실패");

      // 2. 사업자등록증 파일 업로드
      let certificateUrl = "";
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${authData.user.id}/certificate.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('business-certificates')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('business-certificates')
          .getPublicUrl(fileName);
        
        certificateUrl = publicUrl;
      }

      // 3. 회사 프로필 정보 저장
      const { error: profileError } = await supabase
        .from('company_profiles')
        .insert({
          user_id: authData.user.id,
          username: formData.username,
          company_name: formData.companyName,
          business_number: formData.businessNumber,
          ceo_name: formData.ceoName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address || null,
          business_certificate_url: certificateUrl,
          status: 'pending'
        });

      if (profileError) throw profileError;

      toast({
        title: "가입 신청 완료",
        description: `${formData.email}로 인증 이메일이 발송되었습니다. 관리자 승인 후 로그인이 가능합니다.`,
      });

      navigate('/login');

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">로지프로핏 가입</CardTitle>
          <CardDescription>새로운 계정을 만들어 ERP 시스템을 시작하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 로그인 정보 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5" />
                <h3 className="text-lg font-semibold">로그인 정보</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">아이디*</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="영문, 숫자 4자 이상"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호*</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="8자 이상"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">비밀번호 확인*</Label>
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    placeholder="비밀번호 재입력"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5" />
                <h3 className="text-lg font-semibold">사업자 정보</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">회사명*</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="회사명 입력"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자번호*</Label>
                  <Input
                    id="businessNumber"
                    name="businessNumber"
                    placeholder="000-00-00000"
                    value={formData.businessNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ceoName">대표자명*</Label>
                  <Input
                    id="ceoName"
                    name="ceoName"
                    placeholder="대표자 이름"
                    value={formData.ceoName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처*</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">회사 주소 (선택)</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="회사 주소 입력"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-semibold">사업자등록증</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="certificate">사업자등록증 업로드*</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="certificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                {file && (
                  <p className="text-sm text-muted-foreground">선택된 파일: {file.name}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : "가입 신청"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                로그인으로 이동
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
