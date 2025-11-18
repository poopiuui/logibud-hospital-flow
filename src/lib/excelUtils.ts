import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  data: any[];
  filename: string;
  sheetName?: string;
  includeChart?: boolean;
  chartTitle?: string;
  chartType?: 'bar' | 'line' | 'pie';
}

export const exportToFormattedExcel = ({
  data,
  filename,
  sheetName = 'Sheet1',
  includeChart = true,
  chartTitle = '데이터 분석',
  chartType = 'bar'
}: ExcelExportOptions) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // 열 너비 자동 조정
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    ) + 2
  }));
  ws['!cols'] = colWidths;

  // 헤더 스타일 적용
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  
  // 헤더 행 스타일링 (첫 번째 행)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    
    ws[address].s = {
      fill: { fgColor: { rgb: "4472C4" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };
  }

  // 데이터 행 스타일링 (교차 색상)
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const isEvenRow = R % 2 === 0;
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[address]) continue;
      
      ws[address].s = {
        fill: { fgColor: { rgb: isEvenRow ? "FFFFFF" : "F2F2F2" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "D0D0D0" } },
          bottom: { style: "thin", color: { rgb: "D0D0D0" } },
          left: { style: "thin", color: { rgb: "D0D0D0" } },
          right: { style: "thin", color: { rgb: "D0D0D0" } }
        }
      };

      // 숫자 포맷팅
      if (typeof ws[address].v === 'number') {
        ws[address].z = '#,##0';
      }
    }
  }

  // 필터 추가
  ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 차트 데이터를 별도 시트로 추가
  if (includeChart && data.length > 0) {
    const chartData = generateChartData(data);
    const chartWs = XLSX.utils.json_to_sheet(chartData);
    
    // 차트 시트 스타일링
    const chartRange = XLSX.utils.decode_range(chartWs['!ref'] || 'A1');
    for (let C = chartRange.s.c; C <= chartRange.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!chartWs[address]) continue;
      
      chartWs[address].s = {
        fill: { fgColor: { rgb: "70AD47" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    XLSX.utils.book_append_sheet(wb, chartWs, '통계');
  }

  // 파일 저장
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// 차트용 데이터 생성
const generateChartData = (data: any[]) => {
  // 데이터에서 주요 통계 생성
  const stats: any = {};
  
  Object.keys(data[0] || {}).forEach(key => {
    const values = data.map(row => row[key]);
    
    if (typeof values[0] === 'number') {
      stats[key] = {
        항목: key,
        합계: values.reduce((a, b) => a + b, 0),
        평균: values.reduce((a, b) => a + b, 0) / values.length,
        최대값: Math.max(...values),
        최소값: Math.min(...values)
      };
    }
  });

  return Object.values(stats);
};

// CSV 다운로드
export const exportToCSV = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM 추가로 한글 깨짐 방지
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// PDF 다운로드 (jsPDF 사용)
export const exportToPDF = (data: any[], filename: string, title: string) => {
  import('jspdf').then((jsPDFModule) => {
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF();
    
    // 한글 폰트 설정이 필요할 수 있음
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    doc.setFontSize(10);
    let yOffset = 25;
    
    // 헤더
    const headers = Object.keys(data[0] || {});
    doc.text(headers.join(' | '), 14, yOffset);
    yOffset += 7;
    
    // 데이터 (처음 50개만)
    data.slice(0, 50).forEach(row => {
      const values = headers.map(h => String(row[h] || ''));
      doc.text(values.join(' | '), 14, yOffset);
      yOffset += 7;
      
      if (yOffset > 280) {
        doc.addPage();
        yOffset = 15;
      }
    });
    
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  });
};
