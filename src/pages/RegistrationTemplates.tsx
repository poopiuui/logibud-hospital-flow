import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

export default function RegistrationTemplates() {
  const { toast } = useToast();

  const downloadTemplate = (type: string) => {
    let template: any[] = [];
    let fileName = '';

    switch (type) {
      case 'product':
        template = [{
          '상품코드': 'PROD-001',
          '상품명': '예시 상품',
          '카테고리코드': 'CAT-01',
          '바코드': '1234567890123',
          '매입단가': 10000,
          '출고단가': 12000,
          '소비자가': 15000,
          '재고수량': 100,
          '안전재고': 20,
          '설명': '상품 설명',
          '키워드1': '키워드1',
          '키워드2': '키워드2',
          '키워드3': '키워드3'
        }];
        fileName = '상품등록_템플릿';
        break;

      case 'purchase':
        template = [{
          '매입번호': 'P-001',
          '매입일시': '2024-01-15 14:30',
          '매입처': '(주)글로벌물류',
          '상품코드': 'PROD-001',
          '상품명': '노트북 A1',
          '수량': 50,
          '매입단가': 1000000,
          '총액': 50000000,
          '유형': '제조사',
          '영업담당': '김영업',
          '비고': ''
        }];
        fileName = '매입등록_템플릿';
        break;

      case 'outbound':
        template = [{
          '출고번호': 'OUT-001',
          '출고일시': '2024-01-15 10:00',
          '고객명': '서울병원',
          '상품코드': 'PROD-001',
          '상품명': '주사기(5ml)',
          '수량': 100,
          '출고단가': 150,
          '총액': 15000,
          '출고상태': '출고완료',
          '물류담당': '박물류',
          '비고': ''
        }];
        fileName = '출고등록_템플릿';
        break;

      case 'shipping':
        template = [{
          '배송번호': 'SHIP-001',
          '주문번호': 'ORD-001',
          '고객명': '서울병원',
          '고객전화': '02-1234-5678',
          '배송주소': '서울시 강남구',
          '상품명': '주사기(5ml)',
          '수량': 100,
          '배송상태': '배송준비중',
          '운송장번호': '',
          '출고날짜': '2024-01-15',
          '비고': ''
        }];
        fileName = '배송등록_템플릿';
        break;

      case 'billing':
        template = [{
          '청구번호': 'INV-001',
          '고객명': '서울병원',
          '청구일자': '2024-01-15',
          '상품명': '주사기(5ml)',
          '수량': 100,
          '단가': 150,
          '금액': 15000,
          '청구상태': '발행대기',
          '계산서발행여부': '미발행',
          '입금확인여부': '미확인',
          '비고': ''
        }];
        fileName = '청구등록_템플릿';
        break;

      case 'quotation':
        template = [{
          '견적번호': 'QT-001',
          '견적일자': '2024-01-15',
          '고객명': '서울병원',
          '유효기한': '2024-02-15',
          '상품코드': 'PROD-001',
          '상품명': '주사기(5ml)',
          '수량': 100,
          '단가': 150,
          '금액': 15000,
          '총견적금액': 15000,
          'VAT': 1500,
          '총액': 16500,
          '상태': '발행',
          '비고': ''
        }];
        fileName = '견적서등록_템플릿';
        break;

      case 'purchaseOrder':
        template = [{
          '발주번호': 'PO-001',
          '발주일자': '2024-01-15',
          '공급업체': '(주)글로벌물류',
          '담당자명': '김담당',
          '담당자전화': '010-1234-5678',
          '상품코드': 'PROD-001',
          '상품명': '노트북 A1',
          '수량': 50,
          '단가': 1000000,
          '금액': 50000000,
          '납품희망일': '2024-01-25',
          '발주상태': '발주대기',
          '비고': ''
        }];
        fileName = '발주서등록_템플릿';
        break;

      case 'vendor':
        template = [{
          '코드': 'V-001',
          '사업자명': '(주)글로벌물류',
          '사업자번호': '123-45-67890',
          '대표자명': '홍길동',
          '담당자명': '김담당',
          '담당자전화': '010-1234-5678',
          '담당자이메일': 'contact@global.com',
          '주소': '서울시 강남구',
          '영업담당': '김영업',
          '물류출고담당': '박물류',
          '결제일': '말일',
          '결제방법': '계좌이체',
          '통장번호': '110-123-456789',
          '계산서발행메일': 'invoice@global.com',
          '비고': ''
        }];
        fileName = '매입매출처등록_템플릿';
        break;

      case 'category':
        template = [{
          '카테고리코드': 'CAT-01',
          '카테고리명': '의료용품',
          '상위카테고리': '',
          '설명': '카테고리 설명',
          '정렬순서': 1,
          '사용여부': '사용'
        }];
        fileName = '카테고리등록_템플릿';
        break;

      default:
        return;
    }

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '템플릿');
    
    // 열 너비 자동 조정
    const colWidths = Object.keys(template[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    toast({
      title: "템플릿 다운로드 완료",
      description: `${fileName}.xlsx 파일이 다운로드되었습니다.`
    });
  };

  const templates = [
    {
      title: "상품 등록",
      description: "상품 정보를 일괄 등록하기 위한 템플릿입니다.",
      type: "product",
      icon: FileSpreadsheet,
      color: "text-blue-600"
    },
    {
      title: "매입 등록",
      description: "매입 내역을 일괄 등록하기 위한 템플릿입니다.",
      type: "purchase",
      icon: FileSpreadsheet,
      color: "text-green-600"
    },
    {
      title: "출고 등록",
      description: "출고 내역을 일괄 등록하기 위한 템플릿입니다.",
      type: "outbound",
      icon: FileSpreadsheet,
      color: "text-purple-600"
    },
    {
      title: "배송 등록",
      description: "배송 정보를 일괄 등록하기 위한 템플릿입니다.",
      type: "shipping",
      icon: FileSpreadsheet,
      color: "text-orange-600"
    },
    {
      title: "청구서 등록",
      description: "청구서를 일괄 발행하기 위한 템플릿입니다.",
      type: "billing",
      icon: FileSpreadsheet,
      color: "text-red-600"
    },
    {
      title: "견적서 등록",
      description: "견적서를 일괄 작성하기 위한 템플릿입니다.",
      type: "quotation",
      icon: FileSpreadsheet,
      color: "text-indigo-600"
    },
    {
      title: "발주서 등록",
      description: "발주서를 일괄 작성하기 위한 템플릿입니다.",
      type: "purchaseOrder",
      icon: FileSpreadsheet,
      color: "text-teal-600"
    },
    {
      title: "매입/매출처 등록",
      description: "거래처 정보를 일괄 등록하기 위한 템플릿입니다.",
      type: "vendor",
      icon: FileSpreadsheet,
      color: "text-pink-600"
    },
    {
      title: "카테고리 등록",
      description: "상품 카테고리를 일괄 등록하기 위한 템플릿입니다.",
      type: "category",
      icon: FileSpreadsheet,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">등록 양식</h1>
        <p className="text-muted-foreground text-lg mt-2">
          각 메뉴별 Excel 등록 템플릿을 다운로드하여 일괄 등록에 활용하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.type} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${template.color}`}>
                  <template.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{template.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="mt-3">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => downloadTemplate(template.type)}
                className="w-full gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                템플릿 다운로드
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-xl">사용 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <span className="font-semibold text-primary">1.</span>
            <p>원하는 템플릿을 다운로드하세요.</p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-primary">2.</span>
            <p>Excel 파일을 열어 예시 데이터를 참고하여 실제 데이터를 입력하세요.</p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-primary">3.</span>
            <p>첫 번째 행(헤더)은 삭제하지 마시고, 두 번째 행부터 데이터를 입력하세요.</p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-primary">4.</span>
            <p>해당 메뉴의 "Excel 일괄 등록" 기능을 사용하여 파일을 업로드하세요.</p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-primary">5.</span>
            <p className="text-muted-foreground">
              * 모든 템플릿은 표준화된 형식을 따르며, 각 필드의 형식을 준수해야 합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
