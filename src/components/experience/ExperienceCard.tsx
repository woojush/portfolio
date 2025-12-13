// Card component for displaying a single Experience item.
// Used on /experience page and detail views.

import Link from 'next/link';
import Image from 'next/image';
import type { ExperienceItem } from '@/lib/firestore/types';

interface ExperienceCardProps {
  item: ExperienceItem;
  disableLink?: boolean;
}

export function ExperienceCard({ item, disableLink = false }: ExperienceCardProps) {
  const formattedDate = item.startDate ? item.startDate.replace(/-/g, '.') : '날짜 없음';

  const cardContent = (
    <div className="group flex flex-col rounded-2xl border-[1.5px] border-[#d7dfe9] bg-white transition-all duration-200 hover:border-[#9ca3af] overflow-hidden h-full">
      {/* 썸네일 이미지 (16:9 비율) */}
      <div className="relative w-full aspect-video overflow-hidden bg-slate-200">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
            <span className="text-slate-500 text-sm">이미지 없음</span>
          </div>
        )}
      </div>
      
      {/* 본문 (제목, 요약, 날짜) */}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
          {item.title}
        </h3>

        {item.summary && (
          <p className="mt-3 text-sm text-slate-600 leading-snug line-clamp-2">
            {item.summary}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end text-sm text-slate-500 pr-1">
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );

  if (disableLink) {
    return cardContent;
  }

  return (
    <Link
      href={`/experience/${item.id}`}
      className="block"
    >
      {cardContent}
    </Link>
  );
}
