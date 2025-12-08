'use client';

// Accordion card component for Experience items.
// Shows periodLabel · title on closed state, expands to show details.

import type { ExperienceItem } from '@/lib/firestore/types';
import Link from 'next/link';
import { useState } from 'react';

interface ExperienceCardProps {
  item: ExperienceItem;
}

export function ExperienceCard({ item }: ExperienceCardProps) {
  const [open, setOpen] = useState(false);

  // 카테고리에 따른 그라데이션 색상
  const getGradient = (category: string) => {
    const gradients: Record<string, string> = {
      '프로젝트/연구': 'from-purple-500 to-purple-600',
      '동아리/교내외 활동': 'from-green-500 to-green-600',
      '인턴/실무 경험': 'from-orange-500 to-orange-600',
      '공모전/해커톤': 'from-pink-500 to-pink-600',
      '알바/군 경험': 'from-indigo-500 to-indigo-600',
    };
    return gradients[category] || 'from-slate-500 to-slate-600';
  };

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden h-full">
      {/* 헤더 (그라데이션 배경) */}
      <div className={`h-32 bg-gradient-to-br ${getGradient(item.category || '')} p-5 flex flex-col justify-end`}>
        <div className="flex items-center justify-between mb-2">
          <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs text-white border border-white/30">
            {item.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white line-clamp-2">
          {item.periodLabel}
        </h3>
      </div>
      
      {/* 본문 */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-600">
            역할: {item.role}
          </p>
          <p className="text-sm text-slate-700 line-clamp-3">
            {item.summary}
          </p>
        </div>
        
        {/* 하단 정보 및 버튼 */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="w-full text-left text-xs text-slate-500 hover:text-slate-700 flex items-center justify-between"
          >
            <span>{open ? '간단히 접기' : '자세히 보기'}</span>
            <span
              className={[
                'text-xs transition-transform',
                open ? 'rotate-90' : ''
              ].join(' ')}
              aria-hidden="true"
            >
              ▶
            </span>
          </button>

          {/* 확장 내용 */}
          <div
            className={[
              'grid overflow-hidden transition-all duration-200',
              open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            ].join(' ')}
          >
            <div className="min-h-0 space-y-3 pt-2 border-t border-slate-200">
              {item.learnings.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-800">
                    배운 점
                  </p>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-slate-700">
                    {item.learnings.map((learning, idx) => (
                      <li key={idx}>{learning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.images && item.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.images.map((src) => (
                    <div
                      key={src}
                      className="h-20 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <Link
                href={`/experience/${item.id}`}
                className="inline-block text-xs text-blue-600 hover:text-blue-800"
              >
                전체 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
