import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string | null;
  onSuccess: () => void;
}

const PhotoUploadDialog = ({ open, onOpenChange, petId, onSuccess }: PhotoUploadDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !petId) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("로그인이 필요합니다");

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("pet-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("pet-photos")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("pet_photos").insert({
        user_id: session.user.id,
        pet_id: petId,
        image_url: publicUrl,
        caption: caption || null,
        photo_date: new Date().toISOString().split("T")[0],
      });

      if (dbError) throw dbError;

      toast({ title: "업로드 완료" });
      setFile(null);
      setCaption("");
      setPreview(null);
      onSuccess();
    } catch (error: any) {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>사진 업로드</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>사진 선택</Label>
            <div className="mt-2">
              {preview ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    className="absolute bottom-2 right-2"
                    onClick={() => { setFile(null); setPreview(null); }}
                  >
                    변경
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">클릭하여 사진 선택</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>
          <div>
            <Label>설명 (선택)</Label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="이 순간을 설명해주세요" />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !file}>
            {loading ? "업로드 중..." : "업로드"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadDialog;
