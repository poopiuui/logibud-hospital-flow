import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ExcelAdvancedProps {
  data: any[];
  filename?: string;
  sheetName?: string;
}

export const ExcelAdvanced = ({ data, filename = 'export', sheetName = 'Sheet1' }: ExcelAdvancedProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'txt'>('xlsx');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeFilters, setIncludeFilters] = useState(true);
  const [multiSheet, setMultiSheet] = useState(false);

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();

      if (multiSheet && Array.isArray(data) && data.length > 0) {
        // 카테고리별로 시트 분할
        const categories = [...new Set(data.map((item: any) => item.category || '기타'))];
        
        categories.forEach(category => {
          const filteredData = data.filter((item: any) => (item.category || '기타') === category);
          const ws = XLSX.utils.json_to_sheet(filteredData);
          
          if (includeFilters) {
            ws['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref'] || 'A1')) };
          }
          
          XLSX.utils.book_append_sheet(wb, ws, category.substring(0, 31)); // Excel 시트 이름 제한
        });
      } else {
        const ws = XLSX.utils.json_to_sheet(data);
        
        if (includeFilters) {
          ws['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref'] || 'A1')) };
        }
        
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      // 포맷에 따라 내보내기
      if (format === 'csv') {
        const ws = wb.Sheets[wb.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
      } else if (format === 'txt') {
        const ws = wb.Sheets[wb.SheetNames[0]];
        const txt = XLSX.utils.sheet_to_txt(ws);
        const blob = new Blob([txt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        a.click();
      } else {
        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.${format}`);
      }

      toast({
        title: "내보내기 완료",
        description: `데이터가 ${format.toUpperCase()} 형식으로 저장되었습니다.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "파일 내보내기 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
        <FileSpreadsheet className="w-4 h-4" />
        고급 내보내기
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Excel 고급 내보내기</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>파일 형식</Label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="txt">텍스트 (.txt)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="headers" 
                checked={includeHeaders}
                onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
              />
              <Label htmlFor="headers" className="cursor-pointer">헤더 포함</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filters" 
                checked={includeFilters}
                onCheckedChange={(checked) => setIncludeFilters(checked as boolean)}
              />
              <Label htmlFor="filters" className="cursor-pointer">자동 필터 추가</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="multisheet" 
                checked={multiSheet}
                onCheckedChange={(checked) => setMultiSheet(checked as boolean)}
              />
              <Label htmlFor="multisheet" className="cursor-pointer">카테고리별 시트 분할</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              내보내기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
