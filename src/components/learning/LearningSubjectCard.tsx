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
      className="group flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:border-warmBeige/70 hover:bg-slate-800/80 hover:shadow-lg"
    >
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100 md:text-base">
          {subject}
        </h3>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
        <span>총 {count}개의 기록</span>
        {formattedDate && <span>최근 업데이트 · {formattedDate}</span>}
      </div>
    </Link>
  );
}
