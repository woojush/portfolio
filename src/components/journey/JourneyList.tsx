'use client';

import type { JourneyItem } from '@/lib/firestore/journey';

interface JourneyListProps {
  items: JourneyItem[];
}

export function JourneyList({ items }: JourneyListProps) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-black">아직 여정 기록이 없습니다.</p>;
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

  const logoStyle = (item: JourneyItem) => ({
    objectFit: 'cover' as const,
    transform: `translate(${item.logoOffsetX ?? 0}px, ${item.logoOffsetY ?? 0}px) scale(${(item.logoScale ?? 100) / 100})`,
    transformOrigin: 'center center'
  });

  const toColor = (c?: string) => {
    if (c === 'gray') return '#475569';
    if (c === 'blue') return '#1e3a8a';
    return '#0f172a';
  };

  const toSize = () => 16; // base not used directly now

  const computeDuration = (text?: string) => {
    if (!text) return '';
    const normalize = text.replace(/\s+/g, '');
    const match = normalize.match(
      /(?<sy>\d{4})[.\s년-]?(?<sm>\d{1,2})월?(?:-|~|to)?(?<ey>\d{4})[.\s년-]?(?<em>\d{1,2})월?/
    );
    if (!match || !match.groups) return '';
    const sy = Number(match.groups.sy);
    const sm = Number(match.groups.sm);
    const ey = Number(match.groups.ey);
    const em = Number(match.groups.em);
    if ([sy, sm, ey, em].some((v) => Number.isNaN(v))) return '';
    const totalStart = sy * 12 + (sm - 1);
    const totalEnd = ey * 12 + (em - 1);
    const diff = totalEnd - totalStart + 1;
    if (diff <= 0) return '';
    const years = Math.floor(diff / 12);
    const months = diff % 12;
    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    return parts.join(' ');
  };

  const durationLabel = (item: JourneyItem) => computeDuration(item.period);

  return (
    <div className="space-y-10">
      {current && (
        <article className="relative grid grid-cols-[auto,1fr] items-start gap-4 rounded-3xl bg-transparent p-5">
          {current.logoUrl ? (
            <img
              src={current.logoUrl}
              alt={current.organization || current.title}
              className="rounded-2xl bg-transparent"
              style={{ width: '88px', height: '88px', ...logoStyle(current) }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-2xl bg-transparent text-xs text-black"
              style={{ width: '88px', height: '88px' }}
            >
              Logo
            </div>
          )}
          <div className="space-y-1.5" style={{ color: toColor(current.textColor) }}>
            <p className="font-semibold leading-tight" style={{ fontSize: 20 }}>
              {current.organization}
              {current.title && (
                <>
                  <span style={{ fontSize: 16, marginLeft: 6, color: '#6b7280' }}>·</span>
                  <span className="text-sm" style={{ color: '#475569', marginLeft: 6, fontSize: 16 }}>
                    {current.title}
                  </span>
                </>
              )}
            </p>
            {current.affiliation && (
              <p className="font-normal leading-tight" style={{ fontSize: 18 }}>
                {current.affiliation}
              </p>
            )}
            <p className="text-sm font-normal" style={{ color: '#475569', fontSize: 14, fontWeight: 400 }}>
              {current.period}
              {durationLabel(current) && ` · ${durationLabel(current)}`}
            </p>
            {current.location && (
              <p className="text-sm" style={{ color: '#94a3b8', fontSize: 14 }}>
                {current.location}
              </p>
            )}
            {current.description && (
              <p className="leading-relaxed whitespace-pre-wrap" style={{ color: '#94a3b8', fontSize: 14 }}>
                {current.description}
              </p>
            )}
          </div>
        </article>
      )}

      {/* Timeline list */}
      <ol className="relative space-y-6 pl-5 md:space-y-8 md:pl-7">
        {rest.map((item) => (
          <li key={item.id} className="relative pl-4">
            <div className="absolute left-0 top-4 bottom-4 w-px bg-slate-300" />
            <span className="absolute -left-2 top-2 h-3.5 w-3.5 rounded-full bg-blue-500" />
            <article className="grid grid-cols-[auto,1fr] items-start gap-3 rounded-3xl bg-transparent p-5 transition hover:border-warmBeige/70">
              {item.logoUrl ? (
                <img
                  src={item.logoUrl}
                  alt={item.organization || item.title}
                  className="rounded-xl bg-transparent"
                  style={{ width: '88px', height: '88px', ...logoStyle(item) }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-xl bg-transparent text-[10px] text-black"
                  style={{ width: '88px', height: '88px' }}
                >
                  Logo
                </div>
              )}
              <div
                className="space-y-1.5"
                style={{ color: toColor(item.textColor) }}
              >
                <p className="font-semibold leading-tight" style={{ fontSize: 20 }}>
                  {item.organization}
                  {item.title && (
                    <>
                      <span style={{ fontSize: 16, marginLeft: 6, color: '#6b7280' }}>·</span>
                      <span className="text-xs" style={{ color: '#475569', marginLeft: 6, fontSize: 16 }}>
                        {item.title}
                      </span>
                    </>
                  )}
                </p>
                {item.affiliation && (
                  <p className="font-normal leading-tight" style={{ fontSize: 18 }}>
                    {item.affiliation}
                  </p>
                )}
                <p className="text-xs font-normal" style={{ color: '#0f172a', fontSize: 14, fontWeight: 400 }}>
                  {item.period}
                  {durationLabel(item) && ` · ${durationLabel(item)}`}
                </p>
                {item.location && (
                  <p className="text-sm" style={{ color: '#94a3b8', fontSize: 14 }}>
                    {item.location}
                  </p>
                )}
                {item.description && (
                  <p className="leading-relaxed whitespace-pre-wrap" style={{ fontSize: 14, color: '#94a3b8' }}>
                    {item.description}
                  </p>
                )}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

