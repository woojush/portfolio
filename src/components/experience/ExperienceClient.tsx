'use client';

import { useMemo, useState } from 'react';
import type { ExperienceItem } from '@/lib/firestore/types';
import { ExperienceCard } from '@/components/experience/ExperienceCard';

const categories = [
  { key: 'all', label: '전체보기', match: [] },
  { key: 'project', label: '프로젝트/연구', match: ['프로젝트', '연구', 'research'] },
  { key: 'club', label: '동아리/교내외 활동', match: ['동아리', '교내', '교외', '학회', 'club'] },
  { key: 'intern', label: '인턴/실무 경험', match: ['인턴', 'intern'] },
  { key: 'contest', label: '공모전/해커톤', match: ['공모전', '해커톤', 'hackathon', 'contest'] },
  { key: 'parttime', label: '알바/군 경험', match: ['알바', '파트', '군', '군대', 'army'] }
];

interface ExperienceClientProps {
  items: ExperienceItem[];
}

export function ExperienceClient({ items }: ExperienceClientProps) {
  const [active, setActive] = useState<string>('all');

  const filtered = useMemo(() => {
    if (active === 'all') return items;
    const cat = categories.find((c) => c.key === active);
    if (!cat) return items;
    return items.filter((item) => {
      const val = (item.category || '').toLowerCase();
      return cat.match.some((m) => val.includes(m.toLowerCase()));
    });
  }, [active, items]);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-3 md:px-6 md:pt-4 bg-slate-100 text-slate-900">
      <section className="section-container pt-0" style={{ borderTop: 'none' }}>
        <header className="section-header">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm">
            <h1 className="text-section-title">Experience</h1>
            <p className="mt-2 max-w-2xl text-body text-slate-0 mx-auto">
              도전과 경험의 배움을 공유합니다.
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-slate-200" />
        </header>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(c.key)}
              className={[
                'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                active === c.key
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white text-slate-900 hover:border-blue-600 hover:text-blue-600'
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">해당 카테고리에 기록이 없습니다.</p>
          ) : (
            filtered.map((item) => <ExperienceCard key={item.id} item={item} />)
          )}
        </div>
      </section>
    </main>
  );
}

