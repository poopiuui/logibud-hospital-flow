import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BarcodeScanner({ onScan, isOpen, onOpenChange }: BarcodeScannerProps) {
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      scannerRef.current = new Html5Qrcode("barcode-reader");
    }

    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen, isScanning]);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      setIsScanning(true);
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
          onOpenChange(false);
          toast({
            title: "바코드 스캔 완료",
            description: `바코드: ${decodedText}`,
          });
        },
        (errorMessage) => {
          // 스캔 중 에러는 무시 (계속 스캔 시도)
        }
      );
    } catch (error) {
      console.error("Scanner error:", error);
      toast({
        title: "카메라 오류",
        description: "카메라에 접근할 수 없습니다. 권한을 확인해주세요.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (error) {
        console.error("Stop scanner error:", error);
      }
    }
  };

  const handleClose = () => {
    stopScanning();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            바코드 스캐너
          </DialogTitle>
          <DialogDescription>
            카메라를 바코드에 가까이 대고 스캔하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            id="barcode-reader"
            className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
          />

          <div className="flex gap-2 justify-end">
            {!isScanning ? (
              <Button onClick={startScanning} className="gap-2">
                <Camera className="w-4 h-4" />
                스캔 시작
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive" className="gap-2">
                <X className="w-4 h-4" />
                스캔 중지
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
