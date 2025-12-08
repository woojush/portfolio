// Card component for displaying a learning subject category.
// Used on the main page Learning section.

import Link from 'next/link';

interface LearningSubjectCardProps {
  subject: string;
  count: number;
  latestDate: string;
}

export function LearningSubjectCard({
  subject,
  count,
  latestDate
}: LearningSubjectCardProps) {
  const formattedDate = latestDate
    ? new Date(latestDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long'
      })
    : '';

  return (
    <Link
      href={`/learning?subject=${encodeURIComponent(subject)}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden"
    >
      {/* 헤더 (그라데이션 배경) */}
      <div className="h-24 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
        <h3 className="text-lg font-bold text-white">
          {subject}
        </h3>
      </div>
      
      {/* 본문 */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            과목별 학습 기록을 확인하세요
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>총 {count}개의 기록</span>
          {formattedDate && <span>최근 업데이트 · {formattedDate}</span>}
        </div>
      </div>
    </Link>
  );
}
