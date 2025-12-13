// Card component for displaying a subject category in the Learning section.
// Used on the home page to show available subject categories.

import Link from 'next/link';

interface LearningSubjectCardProps {
  subject: string;
  count: number;
  latestDate: string;
}

export function LearningSubjectCard({ subject, count, latestDate }: LearningSubjectCardProps) {
  const formattedDate = latestDate ? latestDate.replace(/-/g, '.') : '날짜 없음';

  return (
    <Link
      href={`/learning?subject=${encodeURIComponent(subject)}`}
      className="block"
    >
      <div className="flex flex-col rounded-2xl border-[1.5px] border-[#d7dfe9] bg-white p-6 transition-all duration-200 hover:border-[#9ca3af] h-full">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {subject}
        </h3>
        
        <div className="mt-auto flex items-center justify-between text-sm text-slate-500 pt-4">
          <span>{count}개 항목</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
}
