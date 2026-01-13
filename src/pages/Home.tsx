import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Feather, Image, LogOut, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PetCard from "@/components/PetCard";
import AddPetDialog from "@/components/AddPetDialog";
import PhotoUploadDialog from "@/components/PhotoUploadDialog";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

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
        .select("*, pet_profiles(name)")
        .eq("user_id", userId)
        .order("photo_date", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: lastPhotoByPet = {} } = useQuery({
    queryKey: ["last-photo-by-pet", userId],
    queryFn: async () => {
      if (!userId) return {};
      const { data, error } = await supabase
        .from("pet_photos")
        .select("pet_id, photo_date")
        .eq("user_id", userId)
        .order("photo_date", { ascending: false });
      if (error) throw error;
      const result: Record<string, string> = {};
      data?.forEach((photo) => {
        if (!result[photo.pet_id]) {
          result[photo.pet_id] = photo.photo_date;
        }
      });
      return result;
    },
    enabled: !!userId,
  });

  const activePetsList = pets.filter(p => !p.is_deceased);
  const deceasedPetsList = pets.filter(p => p.is_deceased);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "안녕히 가세요" });
    navigate("/");
  };

  const handleAddPhoto = (petId: string) => {
    setSelectedPetId(petId);
    setShowPhotoUpload(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border/50 z-10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-primary" />
            <span className="text-base font-medium text-foreground">너에게 쓰는 편지</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-8">
        {/* Welcome Message */}
        <section className="text-center py-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            오늘도 생각나는 순간이 있나요?<br />
            천천히 기억을 되새겨 보세요
          </p>
        </section>

        {/* Timeline Preview - Recent Memories */}
        {recentPhotos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary/70" />
                최근 추억
              </h2>
              <Button size="sm" variant="ghost" onClick={() => navigate("/album")} className="text-sm">
                더보기
              </Button>
            </div>
            <div className="space-y-3">
              {recentPhotos.slice(0, 3).map((photo: any) => (
                <Card key={photo.id} className="memory-card overflow-hidden">
                  <CardContent className="p-0 flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={photo.image_url}
                        alt={photo.caption || "추억"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex flex-col justify-center flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(photo.photo_date), "yyyy년 M월 d일", { locale: ko })}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {photo.pet_profiles?.name || "소중한 순간"}
                      </p>
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Companions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium">함께한 친구들</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowAddPet(true)} className="text-sm">
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
          
          {pets.length === 0 ? (
            <Card className="border-dashed border-border/70">
              <CardContent className="p-8 text-center">
                <div className="text-3xl mb-3">🌟</div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  기억하고 싶은 친구가 있나요?<br />
                  이름을 불러주세요
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowAddPet(true)}>
                  친구 등록하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* 함께하는 친구들 */}
              {activePetsList.map((pet) => (
                <PetCard 
                  key={pet.id} 
                  pet={pet} 
                  onAddPhoto={handleAddPhoto}
                  onOpenProfile={(petId) => navigate(`/pets/${petId}`)}
                  lastPhotoDate={lastPhotoByPet[pet.id]}
                />
              ))}
              
              {/* 떠나보낸 친구들 */}
              {deceasedPetsList.length > 0 && (
                <>
                  <div className="flex items-center gap-3 pt-4 pb-2">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="text-xs text-muted-foreground">
                      ✦ 별이 된 친구들
                    </span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                  {deceasedPetsList.map((pet) => (
                    <PetCard 
                      key={pet.id} 
                      pet={pet} 
                      onAddPhoto={handleAddPhoto}
                      onOpenProfile={(petId) => navigate(`/pets/${petId}`)}
                      lastPhotoDate={lastPhotoByPet[pet.id]}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        {pets.length > 0 && (
          <section className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-1.5 border-border/70"
                onClick={() => pets[0] && handleAddPhoto(pets[0].id)}
              >
                <Image className="h-5 w-5 text-primary/70" />
                <span className="text-xs">추억 남기기</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-1.5 border-border/70"
                onClick={() => navigate("/album")}
              >
                <Feather className="h-5 w-5 text-primary/70" />
                <span className="text-xs">편지 쓰기</span>
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