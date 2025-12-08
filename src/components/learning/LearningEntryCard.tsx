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

  return (
    <Link
      href={`/learning/${encodeURIComponent(entry.subject)}/${entry.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-500 hover:bg-slate-900"
    >
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {dateRange}
        </p>
        <h3 className="text-sm font-semibold text-slate-100 md:text-base">
          {entry.title}
        </h3>
        <p className="text-sm text-slate-300 md:text-base">{entry.summary}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

