'use client';

import type { JourneyItem } from '@/lib/firestore/journey';

interface JourneyListProps {
  items: JourneyItem[];
}

export function JourneyList({ items }: JourneyListProps) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400">아직 여정 기록이 없습니다.</p>;
  }

  const sorted = [...items].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
    }
    return (b.period || '').localeCompare(a.period || '');
  });

  const current = sorted.find((i) => i.isCurrent) || sorted[0];
  const rest = sorted.filter((i) => i.id !== (current?.id ?? ''));

  return (
    <div className="space-y-10">
      {current && (
        <article className="flex flex-col gap-4 rounded-3xl border border-slate-800/60 bg-transparent p-5 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            {current.logoUrl ? (
              <img
                src={current.logoUrl}
                alt={current.organization || current.title}
                className="h-16 w-16 rounded-xl border border-slate-800/60 bg-slate-900 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900 text-xs text-slate-400">
                Logo
              </div>
            )}
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">현재</p>
              <h3 className="text-xl font-semibold text-slate-0 leading-tight">
                {current.organization || current.title}
              </h3>
              {current.title && (
                <p className="text-base font-medium text-slate-0">{current.title}</p>
              )}
              <p className="text-sm text-slate-200">{current.period}</p>
              {current.description && (
                <p className="text-sm text-slate-0">{current.description}</p>
              )}
            </div>
          </div>
        </article>
      )}

      {/* Timeline list */}
      <ol className="relative space-y-6 border-l border-blue-500/80 pl-5 md:space-y-8 md:pl-7">
        {rest.map((item) => (
          <li key={item.id} className="relative">
            <span className="absolute -left-2.5 mt-1 h-2.5 w-2.5 rounded-full border border-blue-300 bg-blue-500" />
            <article className="rounded-3xl border border-slate-800/60 bg-transparent p-5 transition hover:border-warmBeige/70">
              <div className="mb-2 flex items-start gap-3">
                {item.logoUrl ? (
                  <img
                    src={item.logoUrl}
                    alt={item.organization || item.title}
                    className="h-12 w-12 rounded-lg border border-slate-800/60 bg-slate-900 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-800/60 bg-slate-900 text-[10px] text-slate-400">
                    Logo
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400">{item.period}</p>
                  <h3 className="text-base font-semibold text-slate-0 leading-tight">
                    {item.organization || item.title}
                  </h3>
                  {item.title && (
                    <p className="text-sm text-slate-0">{item.title}</p>
                  )}
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-slate-0">{item.description}</p>
              )}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

