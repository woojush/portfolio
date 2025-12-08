export interface ExperienceItem {
  id: string;
  category: 'part-time' | 'club' | 'project' | 'other';
  title: string;
  period: string;
  role: string;
  summary: string;
  learnings: string[];
  images?: string[]; // TODO: 나중에 이미지 URL을 추가해서 카드에 썸네일로 보여줄 수 있습니다.
}

export const experienceItems: ExperienceItem[] = [
  {
    id: 'hotel-cleaning',
    category: 'part-time',
    title: '호텔 객실 정리 아르바이트',
    period: '2023 겨울',
    role: '객실 정리 · 청소',
    summary:
      '정해진 시간 안에 여러 사람의 공간을 정갈하게 만드는 일을 경험했습니다.',
    learnings: [
      '눈에 보이지 않는 곳까지 신경 쓰는 태도의 중요성을 몸으로 배웠습니다.',
      '사람마다 사용하는 방식이 다른 공간을 정리하는 일이 얼마나 섬세한 일인지 느꼈습니다.'
    ]
  },
  {
    id: 'study-club',
    category: 'club',
    title: '학습 소모임 운영',
    period: '2024 ~',
    role: '기초 수학 · 프로그래밍 스터디 진행',
    summary:
      '비슷한 수준의 친구들과 함께 개념을 정리하고, 서로 설명해 주는 공부 방식의 힘을 느꼈습니다.',
    learnings: [
      '내가 이해했다고 생각한 개념도, 직접 설명해 보면 허점이 드러난다는 것을 알게 되었습니다.',
      '속도가 조금 느려도, 함께 가는 공부가 훨씬 오래 남는다는 확신을 얻었습니다.'
    ]
  }
];


