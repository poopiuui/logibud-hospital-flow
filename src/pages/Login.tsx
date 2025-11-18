import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Supabase Auth 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("로그인 실패");

      // 회사 프로필 확인 (승인 상태 체크)
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('status, company_name')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error("프로필 정보를 불러올 수 없습니다.");
      }

      if (!profile) {
        toast({
          title: "프로필 없음",
          description: "회원 정보가 존재하지 않습니다. 다시 가입해주세요.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      // 승인 상태 확인
      if (profile.status === 'pending') {
        toast({
          title: "승인 대기중",
          description: "가입 승인 대기중입니다. 관리자 승인 후 이용 가능합니다.",
          variant: "default",
        });
        await supabase.auth.signOut();
        return;
      }

      if (profile.status === 'rejected') {
        toast({
          title: "승인 거부",
          description: "승인 거부된 계정입니다. 관리자에게 문의하세요.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      // 승인된 사용자
      toast({
        title: "로그인 성공",
        description: `${profile.company_name}님, 환영합니다!`,
      });

      // 대시보드로 이동
      navigate('/');

    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = "로그인 중 오류가 발생했습니다.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.";
      }
      
      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">로지프로핏</CardTitle>
          <CardDescription className="text-lg">물류 영업 ERP 시스템</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>

            <div className="border-t pt-6">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  disabled={isLoading}
                >
                  가입하기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                >
                  ID 찾기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                >
                  비밀번호 찾기
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                ID/비밀번호 찾기 기능은 준비 중입니다
              </p>
              <div className="mt-4 text-center">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/admin-setup')}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  관리자 계정 설정
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
