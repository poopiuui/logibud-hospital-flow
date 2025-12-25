import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  image_url: string;
  caption?: string;
  is_favorite?: boolean;
}

interface PhotoGridProps {
  photos: Photo[];
  onRefetch: () => void;
}

const PhotoGrid = ({ photos, onRefetch }: PhotoGridProps) => {
  const { toast } = useToast();

  const toggleFavorite = async (photo: Photo) => {
    try {
      await supabase
        .from("pet_photos")
        .update({ is_favorite: !photo.is_favorite })
        .eq("id", photo.id);
      onRefetch();
    } catch (error) {
      toast({ title: "오류가 발생했습니다", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
          <img src={photo.image_url} alt={photo.caption || ""} className="w-full h-full object-cover" />
          <button
            onClick={() => toggleFavorite(photo)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`h-4 w-4 ${photo.is_favorite ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
