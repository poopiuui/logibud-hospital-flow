import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const Memorial = () => {
  const navigate = useNavigate();

  const { data: memorials = [] } = useQuery({
    queryKey: ["public-memorials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memorial_posts")
        .select(`
          *,
          pet_profiles (name, species, birth_date, deceased_date, profile_image_url),
          memorial_condolences (id)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-memorial/10">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">🌈 추모 공간</h1>
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm">로그인</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Intro */}
        <Card className="mb-6 bg-memorial/5 border-memorial/20">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🌈</div>
            <h2 className="text-xl font-semibold mb-2">무지개다리를 건넌 아이들</h2>
            <p className="text-muted-foreground text-sm">
              언제나 우리 곁에 있었던 소중한 친구들을 기억합니다
            </p>
          </CardContent>
        </Card>

        {memorials.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🕊️</div>
            <h3 className="text-lg font-semibold mb-2">아직 추모글이 없습니다</h3>
            <p className="text-muted-foreground text-sm">
              소중한 반려동물을 추억하는 공간입니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {memorials.map((memorial) => (
              <Card key={memorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  {memorial.cover_image_url && (
                    <div className="w-32 h-32 flex-shrink-0 bg-muted">
                      <img
                        src={memorial.cover_image_url}
                        alt={memorial.pet_profiles?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <span>
                            {memorial.pet_profiles?.species === "dog" ? "🐕" : 
                             memorial.pet_profiles?.species === "cat" ? "🐈" : "🐾"}
                          </span>
                          {memorial.pet_profiles?.name}
                        </h3>
                        {memorial.pet_profiles?.birth_date && memorial.pet_profiles?.deceased_date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(memorial.pet_profiles.birth_date), "yyyy.MM.dd")} ~ {format(new Date(memorial.pet_profiles.deceased_date), "yyyy.MM.dd")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span>{memorial.memorial_condolences?.length || 0}</span>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{memorial.title}</h4>
                    {memorial.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {memorial.content}
                      </p>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Memorial;
