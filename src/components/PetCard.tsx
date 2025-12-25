import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  profile_image_url?: string;
}

interface PetCardProps {
  pet: Pet;
  onAddPhoto: (petId: string) => void;
}

const PetCard = ({ pet, onAddPhoto }: PetCardProps) => {
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
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {pet.profile_image_url ? (
            <img src={pet.profile_image_url} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{getSpeciesEmoji(pet.species)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{pet.name}</h3>
          <p className="text-sm text-muted-foreground">{pet.breed || pet.species}</p>
        </div>
        <Button size="icon" variant="ghost" onClick={() => onAddPhoto(pet.id)}>
          <Camera className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default PetCard;
