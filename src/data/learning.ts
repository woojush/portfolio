export interface LearningEntry {
  id: string;
  subject: string;
  subjectSlug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  link?: string;
}

export const learningEntries: LearningEntry[] = [
  {
    id: 'lin-algebra-basics',
    subject: '선형대수학',
    subjectSlug: 'linear-algebra',
    title: '벡터와 행렬로 세상을 보는 법',
    date: '2025-06',
    tags: ['Linear Algebra', 'Math'],
    summary:
      '선형대수의 기초 개념들을 생활 속 예시와 함께 정리하며, AI 모델에서 왜 이 개념들이 중요한지 연결해 보았습니다.'
  },
  {
    id: 'lin-algebra-eigen',
    subject: '선형대수학',
    subjectSlug: 'linear-algebra',
    title: '고유값과 고유벡터의 직관',
    date: '2025-07',
    tags: ['Linear Algebra', 'Eigenvalues'],
    summary:
      '고유값과 고유벡터를 단순한 계산 공식이 아니라, 변환의 방향과 크기를 이해하는 도구로 정리했습니다.'
  },
  {
    id: 'probability-intro',
    subject: '확률과 통계',
    subjectSlug: 'probability-statistics',
    title: '확률이라는 언어로 불확실성을 다루기',
    date: '2025-07',
    tags: ['Probability', 'Math', 'AI'],
    summary:
      '조건부 확률과 베이즈 정리를 중심으로, 직관과 수식을 동시에 놓치지 않으려는 시도로 정리한 노트입니다.'
  },
  {
    id: 'python-foundations',
    subject: 'Python',
    subjectSlug: 'python',
    title: '파이썬으로 사고 정리하기',
    date: '2025-07',
    tags: ['Python', 'Programming'],
    summary:
      '단순한 문법 암기가 아니라, 문제를 쪼개고 코드로 표현하는 연습 과정에서 느낀 점들을 정리했습니다.'
  }
];

export interface LearningSubject {
  subject: string;
  subjectSlug: string;
  description: string;
  entryCount: number;
  latestDate: string;
}

const subjectDescriptions: Record<string, string> = {
  'linear-algebra':
    '벡터와 행렬, 선형변환을 통해 AI와 데이터 세계를 바라보는 연습을 모아 둔 폴더입니다.',
  'probability-statistics':
    '불확실성과 데이터를 다루는 기본 언어인 확률과 통계를 차분히 정리하는 공간입니다.',
  python:
    '아이디어를 코드로 옮기기 위한 파이썬 기초와 작은 실험들을 기록해 두는 폴더입니다.'
};

export function getLearningSubjects(): LearningSubject[] {
  const map = new Map<
    string,
    { subject: string; subjectSlug: string; dates: string[]; count: number }
  >();

  for (const entry of learningEntries) {
    const existing = map.get(entry.subjectSlug);
    if (existing) {
      existing.dates.push(entry.date);
      existing.count += 1;
    } else {
      map.set(entry.subjectSlug, {
        subject: entry.subject,
        subjectSlug: entry.subjectSlug,
        dates: [entry.date],
        count: 1
      });
    }
  }

  const subjects: LearningSubject[] = [];

  map.forEach((value, key) => {
    const latestDate = value.dates.sort().slice(-1)[0] ?? '';
    subjects.push({
      subject: value.subject,
      subjectSlug: value.subjectSlug,
      description:
        subjectDescriptions[key] ??
        '이 과목과 관련된 공부 기록을 천천히 모아 두는 폴더입니다.',
      entryCount: value.count,
      latestDate
    });
  });

  return subjects.sort((a, b) => a.subject.localeCompare(b.subject, 'ko'));
}



