import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Plus, X } from "lucide-react";
import { petBreeds, speciesLabels, birthYears, birthMonths } from "@/data/petData";

interface PetInfo {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
}

const birthDays = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

const createEmptyPet = (): PetInfo => ({
  id: crypto.randomUUID(),
  name: "",
  species: "dog",
  breed: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "",
    displayName: "",
  });
  
  const [pets, setPets] = useState<PetInfo[]>([createEmptyPet()]);

  const updatePet = (id: string, field: keyof PetInfo, value: string) => {
    setPets(prev => prev.map(pet => {
      if (pet.id !== id) return pet;
      if (field === "species") {
        return { ...pet, species: value, breed: "" };
      }
      return { ...pet, [field]: value };
    }));
  };

  const addPet = () => {
    setPets(prev => [...prev, createEmptyPet()]);
  };

  const removePet = (id: string) => {
    if (pets.length > 1) {
      setPets(prev => prev.filter(pet => pet.id !== id));
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/home");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message || "이메일 또는 비밀번호를 확인해주세요",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 6자 이상이어야 합니다",
        variant: "destructive",
      });
      return;
    }

    const validPets = pets.filter(p => p.name.trim());
    if (validPets.length === 0) {
      toast({
        title: "반려동물 이름 필요",
        description: "최소 한 마리의 반려동물 이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/home`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (authError) throw authError;

      // Ensure we have an authenticated session before inserting (RLS requires auth.uid())
      let session = authData.session;
      if (!session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: signupData.email,
          password: signupData.password,
        });
        if (signInError) throw signInError;
        const { data: sessionData } = await supabase.auth.getSession();
        session = sessionData.session;
      }

      if (!session?.user) {
        throw new Error("회원가입은 완료되었지만 로그인 상태를 확인할 수 없습니다. 다시 로그인해주세요.");
      }

      const userId = session.user.id;

      const { error: profileError } = await supabase.from("user_profiles").insert({
        user_id: userId,
        display_name: signupData.displayName || signupData.email.split("@")[0],
      });
      if (profileError) throw profileError;

      const petInserts = validPets.map((pet) => {
        const hasDateParts = pet.birthYear && pet.birthMonth;
        const day = pet.birthDay || "01";
        return {
          user_id: userId,
          name: pet.name,
          species: pet.species,
          breed: pet.breed || null,
          birth_date: hasDateParts ? `${pet.birthYear}-${pet.birthMonth}-${day}` : null,
        };
      });

      const { error: petError } = await supabase.from("pet_profiles").insert(petInserts);
      if (petError) throw petError;

      const petNames = validPets.map((p) => p.name).join(", ");
      toast({
        title: "가입 완료! 🎉",
        description: `${petNames}와(과) 함께 펫라이프를 시작하세요!`,
      });

      navigate("/home");
    } catch (error: any) {
      toast({
        title: "가입 실패",
        description: error.message || "회원가입에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🐾</div>
          <CardTitle className="text-2xl">펫라이프</CardTitle>
          <CardDescription>반려동물과의 소중한 순간을 기록하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                {/* User Info */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">계정 정보</h3>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일 *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="email@example.com"
                        className="pl-10"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">닉네임</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="display-name"
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        className="pl-10"
                        value={signupData.displayName}
                        onChange={(e) => setSignupData({ ...signupData, displayName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">비밀번호 *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="6자 이상"
                          className="pl-10"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">비밀번호 확인 *</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="재입력"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pet Info - Multiple Pets */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between pt-2">
                    <h3 className="font-medium text-sm text-muted-foreground">🐾 반려동물 정보</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPet}
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      추가
                    </Button>
                  </div>

                  {pets.map((pet, index) => {
                    const availableBreeds = petBreeds[pet.species as keyof typeof petBreeds] || [];
                    
                    return (
                      <div key={pet.id} className="space-y-2 p-3 bg-muted/30 rounded-lg relative">
                        {pets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePet(pet.id)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          반려동물 {index + 1}
                        </div>
                        
                        <div className="space-y-2">
                          <Label>이름 *</Label>
                          <Input
                            type="text"
                            placeholder="예: 초코, 나비..."
                            value={pet.name}
                            onChange={(e) => updatePet(pet.id, "name", e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>종류</Label>
                            <Select 
                              value={pet.species} 
                              onValueChange={(v) => updatePet(pet.id, "species", v)}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Object.entries(speciesLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>품종</Label>
                            <Select 
                              value={pet.breed} 
                              onValueChange={(v) => updatePet(pet.id, "breed", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableBreeds.map((breed) => (
                                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-2">
                            <Label>태어난 해</Label>
                            <Select 
                              value={pet.birthYear} 
                              onValueChange={(v) => updatePet(pet.id, "birthYear", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="년도" />
                              </SelectTrigger>
                              <SelectContent>
                                {birthYears.map((year) => (
                                  <SelectItem key={year} value={year}>{year}년</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>태어난 달</Label>
                            <Select 
                              value={pet.birthMonth} 
                              onValueChange={(v) => updatePet(pet.id, "birthMonth", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="월" />
                              </SelectTrigger>
                              <SelectContent>
                                {birthMonths.map(({ value, label }) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>일</Label>
                            <Select 
                              value={pet.birthDay} 
                              onValueChange={(v) => updatePet(pet.id, "birthDay", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="일" />
                              </SelectTrigger>
                              <SelectContent>
                                {birthDays.map((day) => (
                                  <SelectItem key={day} value={day}>{day}일</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "가입 중..." : "가입하기"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
