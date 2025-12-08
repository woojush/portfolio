// Firestore type definitions

export interface LearningEntry {
  id: string;
  title: string;
  subject: string; // 자유 입력
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  summary: string;
  tags: string[];
  content: string; // markdown
  public: boolean;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceItem {
  id: string;
  title: string; // "2024.01 - 2024.03" (이전 periodLabel)
  category: string; // "알바", "동아리", "프로젝트" 등
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  summary: string;
  images: string[]; // URL list
  content?: string; // markdown (optional)
  public: boolean;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WritingEntry {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  summary: string;
  content: string; // markdown
  tags?: string[];
  public: boolean;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyItem {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  description: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodayMemo {
  id: string;
  date: string; // "YYYY-MM-DD"
  content: string;
  updatedAt: string;
}

export interface HabitDefinition {
  id: string;
  name: string;
  unit?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  value?: number;
  notes?: string;
  createdAt: string;
}

export interface TodoItem {
  id: string;
  type?: 'todo' | 'folder'; // New: type of item
  title: string;
  priority?: 'high' | 'medium' | 'low'; // Optional for folders
  completed: boolean;
  subTasks?: { 
    id: string; 
    title: string; 
    completed: boolean;
    priority?: 'high' | 'medium' | 'low'; // Optional for subtasks
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  sleepStart?: string; // "HH:mm" format
  sleepEnd?: string; // "HH:mm" format
  moodMorning?: number; // 1-5 scale
  moodNoon?: number; // 1-5 scale
  moodEvening?: number; // 1-5 scale
  memo?: string;
  weather?: string;
  temperature?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  type: 'weekly' | 'monthly';
  period: string; // "2024-W01" for weekly, "2024-01" for monthly
  title: string;
  completed: boolean;
  reflection?: string;
  createdAt: string;
  updatedAt: string;
}

// AI 진단서 저장용 인터페이스
export interface HabitDiagnosis {
  id: string;
  habitId: string | null; // 개별 습관의 경우 habitId, 전체의 경우 null
  analysis: string; // 마크다운 형식의 분석 결과
  stats?: {
    sleepStats?: Record<string, { achieved: number; total: number }>;
    moodStats?: Record<string, { achieved: number; total: number }>;
    achievementRate?: number;
    totalLogs?: number;
    totalHabits?: number;
  };
  lastLogDate: string; // 마지막 습관 기록 날짜 (재진단 판단용)
  logCountAtDiagnosis: number; // 진단 시점의 습관 기록 수
  createdAt: string;
  updatedAt: string;
}

// 홈 페이지 설정
export interface HomePageSettings {
  id: string;
  heroImageUrl?: string; // 배경 이미지 URL
  heroImagePosition?: string; // legacy object-position (e.g., 'center', '50% 30%')
  heroImageFit?: 'cover' | 'contain'; // object-fit 옵션
  heroImagePosX?: number; // 0-100 (%)
  heroImagePosY?: number; // 0-100 (%)
  heroOverlayOpacity?: number; // 0-1
  heroTextColor?: string;
  heroTextAlign?: 'left' | 'center' | 'right';
  heroNameSize?: number; // px
  heroSloganSize?: number; // px
  heroIntroSize?: number; // px
  navBgColor?: string; // 상단바 배경색 (hex 또는 rgba)
  navTextColor?: string; // 기본 텍스트 색
  navHoverBgColor?: string; // 호버 배경색
  navHoverTextColor?: string; // 호버 텍스트
  navActiveBgColor?: string; // 활성 배경색
  navActiveTextColor?: string; // 활성 텍스트
  name: string; // 이름
  slogan: string; // 한 줄 소개
  introParagraphs: string[]; // 자기소개 문단들
  additionalContent?: string; // 추가 내용 (마크다운)
  createdAt: string;
  updatedAt: string;
}

// 대시보드 설정
export interface DashboardSettings {
  id: string;
  calendarUrl?: string; // Google Calendar embed URL
  createdAt: string;
  updatedAt: string;
}
