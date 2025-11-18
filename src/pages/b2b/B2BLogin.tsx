import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

export default function B2BLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    businessNumber: "",
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
    
    if (!formData.businessNumber || !formData.password) {
      toast({
        title: "입력 오류",
        description: "사업자번호와 비밀번호를 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 거래처 정보 확인
      const { data: profile, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('business_number', formData.businessNumber)
        .eq('status', 'approved')
        .single();

      if (error || !profile) {
        throw new Error("등록되지 않은 거래처이거나 승인되지 않은 계정입니다.");
      }

      // 간단한 비밀번호 확인 (실제로는 더 안전한 방법 필요)
      // 여기서는 사업자번호 뒤 5자리를 비밀번호로 사용
      const expectedPassword = formData.businessNumber.replace(/-/g, '').slice(-5);
      
      if (formData.password !== expectedPassword) {
        throw new Error("비밀번호가 올바르지 않습니다.");
      }

      // 세션 저장
      sessionStorage.setItem('b2b_customer', JSON.stringify({
        id: profile.id,
        company_name: profile.company_name,
        business_number: profile.business_number,
        ceo_name: profile.ceo_name
      }));

      toast({
        title: "로그인 성공",
        description: `${profile.company_name}님, 환영합니다!`,
      });

      navigate('/b2b/portal');

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">B2B 포털</CardTitle>
          <CardDescription className="text-lg">거래처 전용 주문 시스템</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자번호</Label>
                <Input
                  id="businessNumber"
                  name="businessNumber"
                  type="text"
                  placeholder="000-00-00000"
                  value={formData.businessNumber}
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
                <p className="text-xs text-muted-foreground">
                  초기 비밀번호는 사업자번호 뒤 5자리입니다
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => navigate('/')}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                직원 로그인
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
