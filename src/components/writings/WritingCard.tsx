import Link from 'next/link';
import type { WritingEntry } from '@/lib/firestore/types';

interface WritingCardProps {
  entry: WritingEntry;
}

export function WritingCard({ entry }: WritingCardProps) {
  return (
    <Link
      href={`/writings/${entry.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-500 hover:bg-slate-900"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {entry.date}
          </p>
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <h3 className="text-sm font-semibold text-slate-100 md:text-base">
          {entry.title}
        </h3>
        <p className="text-sm text-slate-300 md:text-base">{entry.summary}</p>
      </div>
    </Link>
  );
}




