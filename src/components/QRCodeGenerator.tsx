import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  productCode: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeGenerator({ productCode, productName, isOpen, onClose }: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        code: productCode,
        name: productName,
        timestamp: new Date().toISOString()
      });

      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(url);
    } catch (error) {
      console.error('QR 코드 생성 실패:', error);
      toast({
        title: "오류",
        description: "QR 코드 생성에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_${productCode}.png`;
    link.click();

    toast({
      title: "다운로드 완료",
      description: "QR 코드가 다운로드되었습니다."
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR 코드 인쇄 - ${productName}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              img {
                max-width: 300px;
                margin: 20px;
              }
              h2 {
                margin: 10px 0;
              }
              p {
                margin: 5px 0;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h2>${productName}</h2>
            <p>제품 코드: ${productCode}</p>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p style="font-size: 12px;">생성일: ${new Date().toLocaleString('ko-KR')}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "인쇄 준비",
      description: "인쇄 창이 열렸습니다."
    });
  };

  useEffect(() => {
    if (isOpen && productCode) {
      generateQRCode();
    }
  }, [isOpen, productCode]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR 코드 생성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <p className="font-semibold text-lg">{productName}</p>
            <p className="text-sm text-muted-foreground">제품 코드: {productCode}</p>
          </div>

          {qrCodeUrl && (
            <div className="flex justify-center p-4 bg-muted rounded-lg">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              다운로드
            </Button>
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              인쇄
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
