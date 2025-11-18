import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface PriceCardGeneratorProps {
  productCode: string;
  productName: string;
  barcode: string;
  unitPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

export function PriceCardGenerator({ 
  productCode, 
  productName, 
  barcode, 
  unitPrice, 
  isOpen, 
  onClose 
}: PriceCardGeneratorProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current && qrCanvasRef.current) {
      generatePriceCard();
    }
  }, [isOpen, productCode, productName, barcode, unitPrice]);

  const generatePriceCard = async () => {
    const canvas = canvasRef.current;
    const qrCanvas = qrCanvasRef.current;
    if (!canvas || !qrCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정 (마트 프라이스카드 표준 사이즈)
    canvas.width = 800;
    canvas.height = 600;

    // 배경 (흰색)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 테두리
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // 상품명 (상단 중앙)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(productName, canvas.width / 2, 80);

    // 품목코드
    ctx.font = '28px sans-serif';
    ctx.fillText(`품목코드: ${productCode}`, canvas.width / 2, 130);

    // 가격 (크고 굵게)
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(`₩${unitPrice.toLocaleString()}`, canvas.width / 2, 280);

    // 바코드 번호
    ctx.fillStyle = '#000000';
    ctx.font = '32px monospace';
    ctx.fillText(barcode, canvas.width / 2, 350);

    // QR 코드 생성
    try {
      await QRCode.toCanvas(qrCanvas, `${productCode}|${productName}|${barcode}`, {
        width: 200,
        margin: 1,
      });

      // QR 코드를 메인 캔버스에 그리기
      ctx.drawImage(qrCanvas, canvas.width / 2 - 100, 400, 200, 200);
    } catch (error) {
      console.error('QR 코드 생성 실패:', error);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `프라이스카드_${productCode}_${productName}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "다운로드 완료",
        description: "프라이스카드 이미지가 다운로드되었습니다.",
      });
    });
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>프라이스카드 인쇄 - ${productName}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="프라이스카드" />
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);

    toast({
      title: "프라이스카드 인쇄",
      description: "프라이스카드를 인쇄합니다.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">프라이스카드 생성</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center p-4 bg-muted rounded-lg">
          <canvas 
            ref={canvasRef} 
            className="border-2 border-border max-w-full h-auto"
          />
          <canvas 
            ref={qrCanvasRef} 
            className="hidden"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            이미지 다운로드
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            인쇄
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
