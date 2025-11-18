export interface Category {
  code: string;
  name: string;
  description?: string;
}

export const PRODUCT_CATEGORIES: Category[] = [
  { code: 'MED', name: '의료소모품', description: '일반 의료용 소모품' },
  { code: 'SYR', name: '주사기/바늘', description: '주사기, 바늘 등' },
  { code: 'BAN', name: '붕대/거즈', description: '붕대, 거즈, 드레싱' },
  { code: 'PRO', name: '보호구', description: '장갑, 마스크, 가운' },
  { code: 'INF', name: '수액/주사액', description: '수액, 주사액' },
  { code: 'ETC', name: '기타', description: '기타 품목' },
];

export const getCategoryByCode = (code: string): Category | undefined => {
  return PRODUCT_CATEGORIES.find(cat => cat.code === code);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return PRODUCT_CATEGORIES.find(cat => cat.name === name);
};
