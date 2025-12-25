import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Showcase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const { data: publicPhotos = [], refetch } = useQuery({
    queryKey: ["public-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_photos")
        .select(`
          *,
          pet_profiles (name, species),
          showcase_likes (id, user_id),
          showcase_comments (id)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleLike = async (photoId: string) => {
    if (!userId) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인해주세요",
        variant: "destructive",
      });
      return;
    }

    const photo = publicPhotos.find(p => p.id === photoId);
    const isLiked = photo?.showcase_likes?.some((like: any) => like.user_id === userId);

    try {
      if (isLiked) {
        await supabase
          .from("showcase_likes")
          .delete()
          .eq("photo_id", photoId)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("showcase_likes")
          .insert({ photo_id: photoId, user_id: userId });
      }
      refetch();
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">🐾 자랑 게시판</h1>
          </div>
          {!userId && (
            <Link to="/auth">
              <Button size="sm">로그인</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {publicPhotos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🐕‍🦺</div>
            <h2 className="text-xl font-semibold mb-2">아직 공유된 사진이 없어요</h2>
            <p className="text-muted-foreground">
              첫 번째로 귀여운 반려동물 사진을 공유해보세요!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {publicPhotos.map((photo) => {
              const isLiked = photo.showcase_likes?.some((like: any) => like.user_id === userId);
              const likeCount = photo.showcase_likes?.length || 0;
              const commentCount = photo.showcase_comments?.length || 0;

              return (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "반려동물 사진"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {photo.pet_profiles?.species === "dog" ? "🐕" : 
                           photo.pet_profiles?.species === "cat" ? "🐈" : "🐾"}
                        </span>
                        <span className="font-medium">{photo.pet_profiles?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleLike(photo.id)}
                          className="flex items-center gap-1 text-sm"
                        >
                          <Heart 
                            className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} 
                          />
                          <span>{likeCount}</span>
                        </button>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageCircle className="h-5 w-5" />
                          <span>{commentCount}</span>
                        </div>
                      </div>
                    </div>
                    {photo.caption && (
                      <p className="text-sm text-muted-foreground">{photo.caption}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Showcase;
