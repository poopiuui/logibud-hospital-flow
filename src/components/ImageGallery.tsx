import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageGalleryProps {
  images: string[];
  onImagesChange?: (images: string[]) => void;
  productName: string;
  editable?: boolean;
}

export function ImageGallery({ images, onImagesChange, productName, editable = false }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleRemoveImage = (index: number) => {
    if (!onImagesChange) return;
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleAddImages = (files: FileList | null) => {
    if (!files || !onImagesChange) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = e.target?.result as string;
        onImagesChange([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  if (images.length === 0) {
    return (
      <Card className="aspect-square rounded-lg overflow-hidden bg-muted flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-muted-foreground/20 rounded-full flex items-center justify-center">
            <Upload className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">이미지가 없습니다</p>
          {editable && (
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                이미지 추가
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleAddImages(e.target.files)}
                  className="hidden"
                />
              </label>
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* 메인 이미지 */}
        <Card className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
          <img
            src={images[currentIndex]}
            alt={`${productName} - 이미지 ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setIsFullscreen(true)}
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {editable && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleRemoveImage(currentIndex)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </Card>

        {/* 썸네일 그리드 */}
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <Card
              key={index}
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                index === currentIndex ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <img src={image} alt={`썸네일 ${index + 1}`} className="w-full h-full object-cover" />
            </Card>
          ))}
          
          {editable && (
            <Card className="aspect-square rounded-lg overflow-hidden bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
              <label className="w-full h-full flex items-center justify-center cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleAddImages(e.target.files)}
                  className="hidden"
                />
              </label>
            </Card>
          )}
        </div>
      </div>

      {/* 전체화면 다이얼로그 */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-screen-lg w-full h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={images[currentIndex]}
              alt={`${productName} - 전체화면`}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
