// Activities data - 간단한 활동 목록

export interface Activity {
  date: string; // YY.MM 형식
  description: string;
}

export const activities: Activity[] = [
  {
    date: '24.06',
    description: '2024 가천대학교 소프트웨어융합교육원 주최 SW 페스티벌 (장려상(3위) 수상)'
  },
  {
    date: '24.07',
    description: 'Google Cloud Study Jam Gemini 과정 (Gemini for Application Developers 등)'
  },
  {
    date: '24.10',
    description: '제8회 부산대학교병원 디지털 헬스케어 MEDICAL HACK 해커톤 ReMindMe'
  },
  {
    date: '25.03',
    description: '2025 한국철도기술연구원 국민행복증진 철도·대중교통·물류 아이디어 공모전 (도시철도 좌석 예측 및 혼잡도 개선 시스템)'
  },
  {
    date: '25.04',
    description: '2025 한국철도학회 학생 철도 창의 작품전 (가천대학교 소속 및 철도정책연구실 첨삭 지원)'
  }
];

