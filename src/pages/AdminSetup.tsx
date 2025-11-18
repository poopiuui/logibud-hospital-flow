import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const createAdminAccount = async () => {
    setIsCreating(true);

    try {
      // 1. 관리자 계정 생성
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@logiprofit.com',
        password: 'admin1234!',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: 'admin'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // 이미 존재하면 마스터 계정 생성 시도
          const { data: masterAuthData, error: masterSignUpError } = await supabase.auth.signUp({
            email: 'master@logiprofit.com',
            password: 'master1234!',
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                username: 'master'
              }
            }
          });

          if (masterSignUpError) {
            if (masterSignUpError.message.includes('already registered')) {
              toast({
                title: "계정 존재",
                description: "관리자 계정과 마스터 계정이 모두 존재합니다. 로그인 페이지로 이동합니다.",
              });
              setTimeout(() => navigate('/login'), 2000);
              return;
            }
            throw masterSignUpError;
          }

          if (!masterAuthData.user) throw new Error("사용자 생성 실패");

          // 마스터 회사 프로필 생성
          const { error: masterProfileError } = await supabase
            .from('company_profiles')
            .insert({
              user_id: masterAuthData.user.id,
              username: 'master',
              company_name: '로지프로핏 마스터',
              business_number: '999-99-99999',
              ceo_name: '마스터 관리자',
              phone: '010-9999-9999',
              email: 'master@logiprofit.com',
              status: 'approved'
            });

          if (masterProfileError) throw masterProfileError;

          // 마스터 역할 부여
          const { error: masterRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: masterAuthData.user.id,
              role: 'admin'
            });

          if (masterRoleError) throw masterRoleError;

          setIsCreated(true);
          toast({
            title: "마스터 계정 생성 완료",
            description: "이메일: master@logiprofit.com / 비밀번호: master1234!",
          });
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        throw signUpError;
      }

      if (signUpError) {
        // 이미 존재하는 계정인 경우 처리
        if (signUpError.message.includes('already registered')) {
          toast({
            title: "계정 존재",
            description: "관리자 계정이 이미 존재합니다. 로그인 페이지로 이동합니다.",
          });
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        throw signUpError;
      }

      if (!authData.user) throw new Error("사용자 생성 실패");

      // 2. 회사 프로필 생성
      const { error: profileError } = await supabase
        .from('company_profiles')
        .insert({
          user_id: authData.user.id,
          username: 'admin',
          company_name: '로지프로핏 관리',
          business_number: '000-00-00000',
          ceo_name: '관리자',
          phone: '010-0000-0000',
          email: 'admin@logiprofit.com',
          status: 'approved' // 자동 승인
        });

      if (profileError) throw profileError;

      // 3. 관리자 역할 부여
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      // 마스터 계정도 함께 생성
      const { data: masterAuthData, error: masterSignUpError } = await supabase.auth.signUp({
        email: 'master@logiprofit.com',
        password: 'master1234!',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: 'master'
          }
        }
      });

      if (!masterSignUpError && masterAuthData.user) {
        // 마스터 회사 프로필 생성
        await supabase
          .from('company_profiles')
          .insert({
            user_id: masterAuthData.user.id,
            username: 'master',
            company_name: '로지프로핏 마스터',
            business_number: '999-99-99999',
            ceo_name: '마스터 관리자',
            phone: '010-9999-9999',
            email: 'master@logiprofit.com',
            status: 'approved'
          });

        // 마스터 역할 부여
        await supabase
          .from('user_roles')
          .insert({
            user_id: masterAuthData.user.id,
            role: 'admin'
          });
      }

      setIsCreated(true);
      
      toast({
        title: "계정 생성 완료",
        description: "관리자 및 마스터 계정이 생성되었습니다.",
      });

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Admin creation error:', error);
      toast({
        title: "계정 생성 실패",
        description: error.message || "관리자 계정 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">관리자 계정 설정</CardTitle>
          <CardDescription>
            테스트용 관리자 계정을 생성합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isCreated ? (
            <>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">생성될 계정 정보:</p>
                    
                    <div className="border-l-2 border-primary pl-3 space-y-1">
                      <p className="font-semibold text-primary">관리자 계정</p>
                      <p>• 이메일: admin@logiprofit.com</p>
                      <p>• 비밀번호: admin1234!</p>
                      <p>• 권한: 관리자 (모든 권한)</p>
                    </div>
                    
                    <div className="border-l-2 border-purple-600 pl-3 space-y-1">
                      <p className="font-semibold text-purple-600">마스터 계정 (개발자용)</p>
                      <p>• 이메일: master@logiprofit.com</p>
                      <p>• 비밀번호: master1234!</p>
                      <p>• 권한: 마스터 관리자 (모든 메뉴 접근)</p>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      * 두 계정 모두 자동 승인됩니다
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={createAdminAccount}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? "생성 중..." : "관리자 & 마스터 계정 생성"}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  disabled={isCreating}
                >
                  로그인 페이지로 이동
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <p className="text-lg font-semibold">계정 생성 완료!</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
                <p className="text-sm text-center font-semibold">
                  계정 생성 완료!
                </p>
                <div className="text-xs space-y-1">
                  <p>✓ 관리자: admin@logiprofit.com</p>
                  <p>✓ 마스터: master@logiprofit.com</p>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  로그인 페이지로 자동 이동합니다...
                </p>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                로그인하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
