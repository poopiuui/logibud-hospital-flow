import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, LayoutGrid, Clock, Heart, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PhotoGrid from "@/components/PhotoGrid";
import PhotoUploadDialog from "@/components/PhotoUploadDialog";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const Album = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [filter, setFilter] = useState<"all" | "favorite">("all");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const { data: pets = [] } = useQuery({
    queryKey: ["pets", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("pet_profiles")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: photos = [], refetch } = useQuery({
    queryKey: ["photos", userId, filter],
    queryFn: async () => {
      if (!userId) return [];
      let query = supabase
        .from("pet_photos")
        .select("*")
        .eq("user_id", userId)
        .order("photo_date", { ascending: false });
      
      if (filter === "favorite") {
        query = query.eq("is_favorite", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Group photos by date for timeline view
  const photosByDate = photos.reduce((acc, photo) => {
    const date = photo.photo_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, typeof photos>);

  const handleUpload = () => {
    if (pets.length > 0) {
      setSelectedPetId(pets[0].id);
      setShowUpload(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">사진 앨범</h1>
          </div>
          <Button size="sm" onClick={handleUpload} disabled={pets.length === 0}>
            <Camera className="h-4 w-4 mr-1" />
            추가
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* View Controls */}
        <div className="flex items-center justify-between">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="favorite">
                <Heart className="h-4 w-4 mr-1" />
                즐겨찾기
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "timeline" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("timeline")}
            >
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Photos */}
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-muted-foreground mb-4">아직 사진이 없어요</p>
            <Button onClick={handleUpload} disabled={pets.length === 0}>
              첫 사진 업로드하기
            </Button>
            {pets.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                먼저 반려동물을 등록해주세요
              </p>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <PhotoGrid photos={photos} onRefetch={refetch} />
        ) : (
          <div className="space-y-6">
            {Object.entries(photosByDate).map(([date, datePhotos]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {format(new Date(date), "yyyy년 M월 d일 (EEE)", { locale: ko })}
                </h3>
                <PhotoGrid photos={datePhotos} onRefetch={refetch} />
              </div>
            ))}
          </div>
        )}
      </main>

      <PhotoUploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        petId={selectedPetId}
        onSuccess={() => {
          setShowUpload(false);
          refetch();
        }}
      />

      <BottomNav />
    </div>
  );
};

export default Album;
