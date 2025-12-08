// Card component for displaying a single Experience item.
// Used on /experience page and detail views.

import Link from 'next/link';
import type { ExperienceItem } from '@/lib/firestore/types';

interface ExperienceCardProps {
  item: ExperienceItem;
}

export function ExperienceCard({ item }: ExperienceCardProps) {

  return (
    <Link
      href={`/experience/${item.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden h-full"
    >
      {/* 헤더 (그라데이션 배경) */}
      <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 p-5 flex flex-col justify-end">
        <h3 className="text-lg font-bold text-white line-clamp-2">
          {item.title}
        </h3>
      </div>
      
      {/* 본문 */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-sm text-slate-700 line-clamp-3">
            {item.summary}
          </p>
        </div>
        
        {/* 하단 정보 */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
          <span>{item.category}</span>
        </div>
      </div>
    </Link>
  );
}
