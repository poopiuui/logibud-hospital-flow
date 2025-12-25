import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Camera, Image, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PetCard from "@/components/PetCard";
import AddPetDialog from "@/components/AddPetDialog";
import PhotoUploadDialog from "@/components/PhotoUploadDialog";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const { data: pets = [], refetch: refetchPets } = useQuery({
    queryKey: ["pets", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("pet_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: recentPhotos = [] } = useQuery({
    queryKey: ["recent-photos", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("pet_photos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "로그아웃 완료" });
    navigate("/");
  };

  const handleAddPhoto = (petId: string) => {
    setSelectedPetId(petId);
    setShowPhotoUpload(true);
  };

  const totalPhotos = recentPhotos.length;
  const activePets = pets.filter(p => !p.is_deceased).length;
  const deceasedPets = pets.filter(p => p.is_deceased).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-bold text-primary">펫라이프</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{activePets}</div>
              <div className="text-xs text-muted-foreground">함께하는</div>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{deceasedPets}</div>
              <div className="text-xs text-muted-foreground">🌈 추모</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{totalPhotos}</div>
              <div className="text-xs text-muted-foreground">사진</div>
            </CardContent>
          </Card>
        </div>

        {/* My Pets */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">내 반려동물</h2>
            <Button size="sm" variant="outline" onClick={() => setShowAddPet(true)}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
          
          {pets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-2">🐕</div>
                <p className="text-muted-foreground mb-4">아직 등록된 반려동물이 없어요</p>
                <Button onClick={() => setShowAddPet(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  첫 반려동물 등록하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pets.map((pet) => (
                <PetCard 
                  key={pet.id} 
                  pet={pet} 
                  onAddPhoto={handleAddPhoto}
                  onOpenProfile={(petId) => navigate(`/pets/${petId}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Photos */}
        {recentPhotos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">최근 사진</h2>
              <Button size="sm" variant="ghost" onClick={() => navigate("/album")}>
                전체보기
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {recentPhotos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo.image_url}
                    alt={photo.caption || "반려동물 사진"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        {pets.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">빠른 기록</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => pets[0] && handleAddPhoto(pets[0].id)}
              >
                <Camera className="h-6 w-6" />
                <span>사진 추가</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate("/album")}
              >
                <Image className="h-6 w-6" />
                <span>앨범 보기</span>
              </Button>
            </div>
          </section>
        )}
      </main>

      <AddPetDialog 
        open={showAddPet} 
        onOpenChange={setShowAddPet}
        onSuccess={() => {
          refetchPets();
          setShowAddPet(false);
        }}
      />

      <PhotoUploadDialog
        open={showPhotoUpload}
        onOpenChange={setShowPhotoUpload}
        petId={selectedPetId}
        onSuccess={() => {
          setShowPhotoUpload(false);
        }}
      />

      <BottomNav />
    </div>
  );
};

export default Home;
