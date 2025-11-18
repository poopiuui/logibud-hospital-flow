import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  supplierName: string
  supplierRegistrationNumber: string
  customerName: string
  customerRegistrationNumber: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  totalAmount: number
  taxAmount: number
  grandTotal: number
}

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const invoiceData: InvoiceData = await req.json()

    // 홈텍스 API 연동 구조
    // 실제 홈텍스 API 키와 엔드포인트는 환경 변수로 관리해야 합니다
    const hometaxApiKey = Deno.env.get('HOMETAX_API_KEY') || ''
    const hometaxEndpoint = Deno.env.get('HOMETAX_ENDPOINT') || 'https://api.hometax.go.kr/v1/invoice'

    // 홈텍스 API 요청 형식으로 변환
    const hometaxPayload = {
      writeDate: invoiceData.issueDate.replace(/[^0-9]/g, ''), // YYYYMMDD 형식
      invoiceType: '01', // 01: 세금계산서
      purposeType: '02', // 02: 영수
      modifyCode: '', // 수정 사유 코드
      
      // 공급자 정보
      invoicerCorpNum: invoiceData.supplierRegistrationNumber,
      invoicerCorpName: invoiceData.supplierName,
      
      // 공급받는자 정보
      invoiceeCorpNum: invoiceData.customerRegistrationNumber,
      invoiceeCorpName: invoiceData.customerName,
      
      // 금액 정보
      supplyCostTotal: invoiceData.totalAmount.toString(),
      taxTotal: invoiceData.taxAmount.toString(),
      totalAmount: invoiceData.grandTotal.toString(),
      
      // 품목 정보
      detailList: invoiceData.items.map((item, index) => ({
        serialNum: (index + 1).toString(),
        itemName: item.name,
        qty: item.quantity.toString(),
        unitCost: item.unitPrice.toString(),
        supplyCost: item.amount.toString(),
        tax: Math.floor(item.amount * 0.1).toString()
      }))
    }

    // 홈텍스 API 호출 (실제 구현 시)
    // 현재는 구조만 제공하며, 실제 API 연동은 홈텍스 계약 및 인증이 필요합니다
    console.log('홈텍스 API 요청 데이터:', hometaxPayload)

    // 홈텍스 API 키가 없는 경우 테스트 응답 반환
    if (!hometaxApiKey) {
      return new Response(
        JSON.stringify({
          success: true,
          message: '홈텍스 연동 구조 준비 완료 (API 키 설정 필요)',
          invoiceKey: `TEST-${invoiceData.invoiceNumber}-${Date.now()}`,
          data: hometaxPayload
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // 실제 홈텍스 API 호출
    const response = await fetch(hometaxEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hometaxApiKey}`,
      },
      body: JSON.stringify(hometaxPayload),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`홈텍스 API 오류: ${result.message || '알 수 없는 오류'}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '홈텍스 전송 완료',
        invoiceKey: result.invoiceKey || result.ntsconfirmNum,
        data: result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('홈텍스 연동 오류:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
