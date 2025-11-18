import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Phone, Printer } from "lucide-react";

interface CompanyInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyInfoDialog({ open, onOpenChange }: CompanyInfoDialogProps) {
  // 실제로는 localStorage나 데이터베이스에서 가져와야 함
  const companyInfo = {
    name: localStorage.getItem('companyName') || '로지봇',
    businessNumber: localStorage.getItem('companyBusinessNumber') || '123-45-67890',
    phone: localStorage.getItem('companyPhone') || '02-1234-5678',
    fax: localStorage.getItem('companyFax') || '02-1234-5679'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">회사 정보</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground">회사명</Label>
              <p className="text-lg font-semibold">{companyInfo.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground">사업자번호</Label>
              <p className="text-lg font-semibold">{companyInfo.businessNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground">전화번호</Label>
              <p className="text-lg font-semibold">{companyInfo.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Printer className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground">팩스번호</Label>
              <p className="text-lg font-semibold">{companyInfo.fax}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
