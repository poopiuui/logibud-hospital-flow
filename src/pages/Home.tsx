import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, PenLine, Image, LogOut, Heart, Flower2, Cookie, Infinity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PetCard from "@/components/PetCard";
import AddPetDialog from "@/components/AddPetDialog";
import PhotoUploadDialog from "@/components/PhotoUploadDialog";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const ActionButton = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="action-button p-4 text-center w-full group"
  >
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <span className="text-xs font-medium text-foreground">{label}</span>
  </button>
);

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
  const featuredPet = pets[0];

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
            <Infinity className="w-5 h-5 text-primary" />
            <span className="text-base font-semibold text-foreground">lovable</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Hero Section - 40% 메인 메모리얼 */}
        {featuredPet && (
          <section className="relative hero-gradient">
            <div className="aspect-[4/3] relative overflow-hidden">
              {featuredPet.profile_image_url ? (
                <img 
                  src={featuredPet.profile_image_url} 
                  alt={featuredPet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                  <span className="text-6xl">🐾</span>
                </div>
              )}
              <div className="absolute inset-0 soft-gradient" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <p className="text-lg font-semibold text-foreground mb-1">
                  보고 싶은 <span className="text-primary">{featuredPet.name}</span>,
                </p>
                <p className="text-muted-foreground text-sm">오늘도 사랑해</p>
              </div>
            </div>
          </section>
        )}

        {/* Interaction Bar */}
        {featuredPet && (
          <section className="px-4 -mt-3 relative z-10">
            <Card className="border-primary/20 shadow-md">
              <CardContent className="p-2">
                <div className="grid grid-cols-3 gap-2">
                  <ActionButton 
                    icon={Flower2} 
                    label="헌화하기"
                    onClick={() => toast({ title: "💐 꽃을 바쳤어요" })}
                  />
                  <ActionButton 
                    icon={PenLine} 
                    label="편지쓰기"
                    onClick={() => navigate("/album")}
                  />
                  <ActionButton 
                    icon={Cookie} 
                    label="간식주기"
                    onClick={() => toast({ title: "🍪 간식을 줬어요" })}
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <div className="p-4 space-y-6">
          {/* Welcome Message (only when no pets) */}
          {pets.length === 0 && (
            <section className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center star-glow">
                <span className="text-4xl">🐾</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed letter-text">
                기억하고 싶은 친구가 있나요?<br />
                이름을 불러주세요
              </p>
            </section>
          )}

          {/* Timeline Preview - Recent Memories */}
          {recentPhotos.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  최근 추억
                </h2>
                <Button size="sm" variant="ghost" onClick={() => navigate("/album")} className="text-sm text-primary">
                  더보기
                </Button>
              </div>
              <div className="space-y-3">
                {recentPhotos.slice(0, 3).map((photo: any) => (
                  <Card key={photo.id} className="memory-card overflow-hidden card-hover">
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
                        <p className="text-sm font-medium truncate text-foreground">
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
              <h2 className="text-base font-semibold text-foreground">함께한 친구들</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowAddPet(true)} className="text-sm text-primary">
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            </div>
            
            {pets.length === 0 ? (
              <Card className="border-dashed border-primary/30">
                <CardContent className="p-8 text-center">
                  <div className="text-3xl mb-3">🌟</div>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed letter-text">
                    소중한 친구의 추모관을<br />
                    만들어 보세요
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setShowAddPet(true)} className="rounded-full">
                    추모관 만들기
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
                      <div className="h-px flex-1 bg-primary/20" />
                      <span className="text-xs text-primary/70 font-medium">
                        ✦ 별이 된 친구들
                      </span>
                      <div className="h-px flex-1 bg-primary/20" />
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
            <section className="pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-1.5 border-primary/20 rounded-xl card-hover"
                  onClick={() => pets[0] && handleAddPhoto(pets[0].id)}
                >
                  <Image className="h-5 w-5 text-primary" />
                  <span className="text-xs">추억 남기기</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-1.5 border-primary/20 rounded-xl card-hover"
                  onClick={() => navigate("/album")}
                >
                  <PenLine className="h-5 w-5 text-primary" />
                  <span className="text-xs">편지 쓰기</span>
                </Button>
              </div>
            </section>
          )}
        </div>
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