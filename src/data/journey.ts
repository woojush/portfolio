export interface JourneyItem {
  id: string;
  period: string;
  title: string;
  description: string;
}

export const journeyItems: JourneyItem[] = [
  {
    id: '2023-hs',
    period: '2023 · 고등학교 후반',
    title: '수학과 컴퓨터에 다시 집중하기 시작',
    description:
      '흩어져 있던 관심들을 정리하고, 대학에서 무엇을 깊게 파고들고 싶은지 차분히 고민하기 시작했습니다.'
  },
  {
    id: '2024-uni',
    period: '2024 · 대학 입학',
    title: '컴퓨터와 수학, 그리고 AI를 본격적으로 만남',
    description:
      '강의와 스스로의 공부를 통해, 개념을 이해하는 것과 그것을 사람과 삶에 연결하는 것의 차이를 느끼고 있습니다.'
  },
  {
    id: '2025-summer',
    period: '2025 여름',
    title: '기초 수학 · AI 집중 학습 기간',
    description:
      '선형대수, 확률, 미분적분 등 기초를 다시 다지며, 작은 예제를 통해 AI 개념을 몸으로 익히는 시간입니다.'
  }
];




