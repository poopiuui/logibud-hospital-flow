import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  profile_image_url?: string;
  is_deceased?: boolean;
}

interface PetCardProps {
  pet: Pet;
  onAddPhoto: (petId: string) => void;
  onOpenProfile: (petId: string) => void;
  lastPhotoDate?: string;
}

const PetCard = ({ pet, onAddPhoto, onOpenProfile, lastPhotoDate }: PetCardProps) => {
  const formatLastActivity = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch {
      return null;
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      pet.is_deceased 
        ? "memory-card border-primary/20" 
        : "hover:shadow-md border-border/70"
    )}>
      <CardContent className="p-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onOpenProfile(pet.id)}
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
        >
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative",
            pet.is_deceased ? "ring-2 ring-primary/20" : "ring-1 ring-border/50"
          )}>
            {pet.profile_image_url ? (
              <img 
                src={pet.profile_image_url} 
                alt={pet.name} 
                className={cn(
                  "w-full h-full object-cover",
                  pet.is_deceased && "opacity-90"
                )} 
              />
            ) : (
              <div className="w-full h-full bg-accent/30 flex items-center justify-center">
                <span className="text-lg text-primary/60">✦</span>
              </div>
            )}
            {pet.is_deceased && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
                <Star className="h-3 w-3 text-primary/70 fill-primary/30" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate">{pet.name}</h3>
              {pet.is_deceased && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80 whitespace-nowrap">
                  별이 됨
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{pet.breed || pet.species}</p>
            {lastPhotoDate && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                마지막 추억 {formatLastActivity(lastPhotoDate)}
              </p>
            )}
          </div>
        </button>
        {!pet.is_deceased && (
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onAddPhoto(pet.id)} 
            aria-label={`${pet.name} 추억 남기기`}
            className="text-primary/60 hover:text-primary"
          >
            <Image className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PetCard;