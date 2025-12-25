import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { petBreeds, speciesLabels } from "@/data/petData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function calcAge(birthDateIso?: string | null) {
  if (!birthDateIso) return null;
  const birth = new Date(birthDateIso);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years -= 1;
  return years;
}

const PetProfile = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    species: "dog",
    breed: "",
    birth_date: "", // yyyy-mm-dd
  });

  useEffect(() => {
    document.title = "반려동물 프로필 | 펫라이프";
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: pet, refetch: refetchPet } = useQuery({
    queryKey: ["pet", petId, userId],
    enabled: !!petId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_profiles")
        .select("*")
        .eq("id", petId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!pet) return;
    setForm({
      name: pet.name ?? "",
      species: pet.species ?? "dog",
      breed: pet.breed ?? "",
      birth_date: pet.birth_date ?? "",
    });
  }, [pet]);

  const { data: weights = [], refetch: refetchWeights } = useQuery({
    queryKey: ["pet-weights", petId, userId],
    enabled: !!petId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_weight_records")
        .select("*")
        .eq("pet_id", petId)
        .eq("user_id", userId)
        .order("recorded_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const chartData = useMemo(() => {
    return weights
      .filter((w) => typeof w.weight === "number")
      .map((w) => ({
        date: w.recorded_at,
        weight: Number(w.weight),
      }));
  }, [weights]);

  const age = useMemo(() => calcAge(pet?.birth_date ?? null), [pet?.birth_date]);

  const availableBreeds = petBreeds[form.species as keyof typeof petBreeds] || [];

  const [newWeight, setNewWeight] = useState({
    recorded_at: new Date().toISOString().slice(0, 10),
    weight: "",
    unit: "kg",
    notes: "",
  });

  const saveProfile = async () => {
    if (!petId || !userId) return;
    if (!form.name.trim()) {
      toast({ title: "이름을 입력해주세요", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("pet_profiles")
      .update({
        name: form.name,
        species: form.species,
        breed: form.breed || null,
        birth_date: form.birth_date || null,
      })
      .eq("id", petId)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "저장 실패", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "저장 완료", description: "프로필이 업데이트되었습니다." });
    refetchPet();
  };

  const addWeight = async () => {
    if (!petId || !userId) return;

    const weightNum = Number(newWeight.weight);
    if (!newWeight.recorded_at) {
      toast({ title: "날짜를 선택해주세요", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      toast({ title: "체중을 올바르게 입력해주세요", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("pet_weight_records").insert({
      pet_id: petId,
      user_id: userId,
      recorded_at: newWeight.recorded_at,
      weight: weightNum,
      unit: newWeight.unit,
      notes: newWeight.notes || null,
    });

    if (error) {
      toast({ title: "체중 저장 실패", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "체중 기록 완료" });
    setNewWeight((p) => ({ ...p, weight: "", notes: "" }));
    refetchWeights();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="뒤로가기">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-sm font-semibold">반려동물 프로필</div>
          <Button variant="ghost" size="icon" onClick={saveProfile} aria-label="프로필 저장">
            <Save className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <section>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>이름</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>종류</Label>
                  <Select
                    value={form.species}
                    onValueChange={(v) => setForm((p) => ({ ...p, species: v, breed: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(speciesLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>품종</Label>
                  <Select value={form.breed} onValueChange={(v) => setForm((p) => ({ ...p, breed: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBreeds.map((breed) => (
                        <SelectItem key={breed} value={breed}>
                          {breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>생일</Label>
                <Input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm((p) => ({ ...p, birth_date: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  {age !== null ? `현재 나이: 만 ${age}세` : "생일을 입력하면 나이를 자동으로 계산해요"}
                </p>
              </div>

              <div className="pt-1">
                <Button onClick={saveProfile} className="w-full">
                  저장하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">체중 추적</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>기록 날짜</Label>
                  <Input
                    type="date"
                    value={newWeight.recorded_at}
                    onChange={(e) => setNewWeight((p) => ({ ...p, recorded_at: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>단위</Label>
                  <Select value={newWeight.unit} onValueChange={(v) => setNewWeight((p) => ({ ...p, unit: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-2">
                  <Label>체중</Label>
                  <Input
                    inputMode="decimal"
                    placeholder={newWeight.unit === "kg" ? "예: 4.2" : "예: 9.3"}
                    value={newWeight.weight}
                    onChange={(e) => setNewWeight((p) => ({ ...p, weight: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={addWeight} className="w-full">
                    추가
                  </Button>
                </div>
              </div>

              <div className="h-56 w-full">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                    아직 체중 기록이 없어요. 첫 기록을 추가해보세요.
                  </div>
                )}
              </div>

              {weights.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">최근 기록</div>
                  <div className="space-y-2">
                    {weights
                      .slice(-5)
                      .reverse()
                      .map((w) => (
                        <div key={w.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{w.recorded_at}</span>
                          <span className="font-medium">
                            {Number(w.weight).toFixed(1)} {w.unit}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default PetProfile;
