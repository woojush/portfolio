export interface WritingEntry {
  id: string;
  title: string;
  date: string;
  type: 'reflection' | 'essay' | 'note';
  summary: string;
  link?: string;
}

export const writingEntries: WritingEntry[] = [
  {
    id: 'isolation-shell',
    title: '고립이라는 껍질 안의 해방',
    date: '2024-11',
    type: 'essay',
    summary:
      '혼자 있는 시간이 두렵지 않게 된 이후, 공부와 삶을 대하는 태도가 어떻게 달라졌는지에 대한 기록입니다.'
  },
  {
    id: 'labor-and-unearned-income',
    title: '노가다와 불로소득에 대한 생각',
    date: '2025-02',
    type: 'reflection',
    summary:
      '몸을 쓰는 노동과 디지털 세계에서의 수익 사이에서, 내가 어떤 삶을 원하는지 질문해 본 글입니다.'
  },
  {
    id: 'small-steps',
    title: '작은 걸음이 쌓이는 속도',
    date: '2025-05',
    type: 'note',
    summary:
      '하루에 한 개념씩이라도 꾸준히 쌓였을 때, 어느 순간 시야가 넓어지는 경험에 대해 적었습니다.'
  }
];




