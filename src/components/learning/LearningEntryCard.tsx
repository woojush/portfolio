// Card component for displaying a single LearningEntry.
// Used on /learning page and detail views.

import Link from 'next/link';
import type { LearningEntry } from '@/lib/firestore/types';

interface LearningEntryCardProps {
  entry: LearningEntry;
}

export function LearningEntryCard({ entry }: LearningEntryCardProps) {
  const dateRange =
    entry.startDate && entry.endDate && entry.endDate !== entry.startDate
      ? `${entry.startDate} ~ ${entry.endDate}`
      : entry.startDate || '날짜 없음';
  
  const formattedDate = entry.startDate 
    ? new Date(entry.startDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <Link
      href={`/learning/${encodeURIComponent(entry.subject)}/${entry.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden h-full"
    >
      {/* 헤더 (그라데이션 배경) */}
      <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 p-5 flex flex-col justify-end">
        <h3 className="text-lg font-bold text-white line-clamp-2">
          {entry.title}
        </h3>
      </div>
      
      {/* 본문 */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-sm text-slate-700 line-clamp-3">
            {entry.summary}
          </p>
        </div>
        
        {/* 태그 */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 border border-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* 하단 정보 */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
          <span>{formattedDate || dateRange}</span>
        </div>
      </div>
    </Link>
  );
}

