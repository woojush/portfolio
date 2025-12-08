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

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full text-left"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              {item.periodLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 border border-slate-200">
              {item.category}
            </span>
            <span
              className={[
                'text-xs text-slate-500 transition-transform',
                open ? 'rotate-90' : ''
              ].join(' ')}
              aria-hidden="true"
            >
              ▶
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          {open ? '간단히 접기' : '자세히 보기'}
        </p>
      </button>

      <div
        className={[
          'grid overflow-hidden transition-all duration-200',
          open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        ].join(' ')}
      >
        <div className="min-h-0 space-y-3">
          <p className="mb-2 text-xs font-medium text-slate-700 md:text-sm">
            역할: {item.role}
          </p>
          <p className="text-sm text-slate-800 md:text-base">{item.summary}</p>
          {item.learnings.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800 md:text-sm">
                배운 점
              </p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-slate-800 md:text-base">
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
          {item.content && (
            <div className="prose max-w-none text-sm text-slate-800">
              <p>{item.content}</p>
            </div>
          )}
          <Link
            href={`/experience/${item.id}`}
            className="mt-2 inline-block text-xs text-slate-600 hover:text-slate-800"
          >
            전체 보기 →
          </Link>
        </div>
      </div>
    </article>
  );
}
