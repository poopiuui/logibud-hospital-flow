import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PackagePlus, Upload, CheckCircle2, XCircle, Settings } from "lucide-react";
import * as XLSX from "xlsx";
import { PRODUCT_CATEGORIES, getCategoryByCode } from "@/data/categories";

interface RegistrationResult {
  success: boolean;
  productName: string;
  message: string;
}

export default function ProductRegistration() {
  const { toast } = useToast();
  const [singleProduct, setSingleProduct] = useState({
    name: "",
    categoryCode: "",
    barcode: "",
    price: "",
    description: "",
    keywords: ["", "", "", "", "", "", "", "", "", ""]
  });
  const [bulkResults, setBulkResults] = useState<RegistrationResult[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 시뮬레이션: 실제로는 API 호출
    const success = Math.random() > 0.1; // 90% 성공률
    
    if (success) {
      toast({
        title: "등록 성공",
        description: `${singleProduct.name}이(가) 성공적으로 등록되었습니다.`,
      });
      setSingleProduct({
        name: "",
        categoryCode: "",
        barcode: "",
        price: "",
        description: "",
        keywords: ["", "", "", "", "", "", "", "", "", ""]
      });
    } else {
      toast({
        title: "등록 실패",
        description: "중복된 바코드입니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // 시뮬레이션: 각 제품 등록 결과
        const results: RegistrationResult[] = jsonData.map((row: any) => ({
          success: Math.random() > 0.15, // 85% 성공률
          productName: row['제품명'] || row['name'] || '알 수 없음',
          message: Math.random() > 0.15 ? '등록 완료' : '바코드 중복'
        }));

        setBulkResults(results);

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        toast({
          title: "대량 등록 완료",
          description: `성공: ${successCount}건, 실패: ${failCount}건`,
        });
      } catch (error) {
        toast({
          title: "파일 읽기 오류",
          description: "엑셀 파일을 읽는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        '제품명': '예시 제품',
        '카테고리': '의료용품',
        '바코드': '1234567890123',
        '가격': '10000',
        '설명': '제품 설명'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "상품등록템플릿");
    XLSX.writeFile(wb, "상품등록_템플릿.xlsx");

    toast({
      title: "템플릿 다운로드",
      description: "엑셀 템플릿이 다운로드되었습니다."
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">상품 등록</h1>
        <p className="text-muted-foreground">신규 상품을 등록합니다</p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="single">단품 등록</TabsTrigger>
          <TabsTrigger value="bulk">대량 등록</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5" />
                단품 등록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">제품명 *</Label>
                    <Input
                      id="name"
                      value={singleProduct.name}
                      onChange={(e) => setSingleProduct({ ...singleProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리 *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={singleProduct.categoryCode}
                        onValueChange={(value) => setSingleProduct({ ...singleProduct, categoryCode: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map(cat => (
                            <SelectItem key={cat.code} value={cat.code}>
                              {cat.code} - {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="icon" onClick={() => setShowCategoryDialog(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">바코드 *</Label>
                    <Input
                      id="barcode"
                      value={singleProduct.barcode}
                      onChange={(e) => setSingleProduct({ ...singleProduct, barcode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">가격 *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={singleProduct.price}
                      onChange={(e) => setSingleProduct({ ...singleProduct, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">제품 설명</Label>
                    <Textarea
                      id="description"
                      value={singleProduct.description}
                      onChange={(e) => setSingleProduct({ ...singleProduct, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">등록하기</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                대량 등록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>엑셀 파일 업로드</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleBulkUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={downloadTemplate}>
                    템플릿 다운로드
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  * 엑셀 템플릿을 다운로드하여 양식에 맞게 작성 후 업로드하세요
                </p>
              </div>

              {bulkResults.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-lg">등록 결과</h3>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {bulkResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 border-b last:border-b-0 ${
                          result.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="font-medium">{result.productName}</span>
                        </div>
                        <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.message}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-semibold">총 {bulkResults.length}건</span>
                    <div className="flex gap-4">
                      <span className="text-green-600">
                        성공: {bulkResults.filter(r => r.success).length}건
                      </span>
                      <span className="text-red-600">
                        실패: {bulkResults.filter(r => !r.success).length}건
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
