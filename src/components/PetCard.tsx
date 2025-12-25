import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const PetCard = ({ pet, onAddPhoto, onOpenProfile }: PetCardProps) => {
  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case "dog": return "🐕";
      case "cat": return "🐈";
      case "bird": return "🐦";
      case "fish": return "🐟";
      case "hamster": return "🐹";
      default: return "🐾";
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      pet.is_deceased && "border-primary/30 bg-primary/5"
    )}>
      <CardContent className="p-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onOpenProfile(pet.id)}
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative",
            pet.is_deceased ? "bg-primary/20" : "bg-primary/10"
          )}>
            {pet.profile_image_url ? (
              <img 
                src={pet.profile_image_url} 
                alt={pet.name} 
                className={cn(
                  "w-full h-full object-cover",
                  pet.is_deceased && "grayscale opacity-80"
                )} 
              />
            ) : (
              <span className="text-2xl">{getSpeciesEmoji(pet.species)}</span>
            )}
            {pet.is_deceased && (
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                <Heart className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{pet.name}</h3>
              {pet.is_deceased && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary whitespace-nowrap">
                  🌈 추모
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{pet.breed || pet.species}</p>
          </div>
        </button>
        {!pet.is_deceased && (
          <Button size="icon" variant="ghost" onClick={() => onAddPhoto(pet.id)} aria-label={`${pet.name} 사진 추가`}>
            <Camera className="h-5 w-5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PetCard;
