// Pet breed data by species
export const petBreeds = {
  dog: [
    "말티즈", "푸들", "비숑 프리제", "포메라니안", "치와와", "시츄", "요크셔 테리어",
    "골든 리트리버", "래브라도 리트리버", "시바 이누", "웰시 코기", "비글", "불독",
    "프렌치 불독", "보더 콜리", "진돗개", "삽살개", "믹스견", "기타"
  ],
  cat: [
    "코리안 숏헤어", "페르시안", "러시안 블루", "브리티시 숏헤어", "샴", "메인쿤",
    "스코티시 폴드", "랙돌", "아메리칸 숏헤어", "노르웨이 숲", "벵갈", "아비시니안",
    "터키시 앙고라", "먼치킨", "스핑크스", "믹스묘", "기타"
  ],
  bird: [
    "앵무새", "잉꼬", "카나리아", "문조", "사랑앵무", "왕관앵무", "모란앵무",
    "십자매", "금화조", "기타"
  ],
  fish: [
    "금붕어", "베타", "구피", "네온 테트라", "엔젤피시", "디스커스", "플레코",
    "아로와나", "코리도라스", "기타"
  ],
  hamster: [
    "골든 햄스터", "드워프 햄스터", "캠벨 드워프", "로보로브스키", "펄 햄스터",
    "윈터화이트", "기타"
  ],
  rabbit: [
    "네덜란드 드워프", "롭이어", "미니렉스", "라이온헤드", "앙고라", "렉스", "기타"
  ],
  other: ["기타"]
};

export const speciesLabels: Record<string, string> = {
  dog: "🐕 강아지",
  cat: "🐈 고양이",
  bird: "🐦 새",
  fish: "🐟 물고기",
  hamster: "🐹 햄스터",
  rabbit: "🐰 토끼",
  other: "🐾 기타"
};

// Generate years from 2000 to current year
export const birthYears = Array.from(
  { length: new Date().getFullYear() - 1999 },
  (_, i) => (new Date().getFullYear() - i).toString()
);

export const birthMonths = [
  { value: "01", label: "1월" },
  { value: "02", label: "2월" },
  { value: "03", label: "3월" },
  { value: "04", label: "4월" },
  { value: "05", label: "5월" },
  { value: "06", label: "6월" },
  { value: "07", label: "7월" },
  { value: "08", label: "8월" },
  { value: "09", label: "9월" },
  { value: "10", label: "10월" },
  { value: "11", label: "11월" },
  { value: "12", label: "12월" },
];
