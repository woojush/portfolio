'use client';

import { useMemo, useState } from 'react';
import type { ExperienceItem } from '@/lib/firestore/types';
import { ExperienceCard } from '@/components/experience/ExperienceCard';

interface ExperienceClientProps {
  items: ExperienceItem[];
}

export function ExperienceClient({ items }: ExperienceClientProps) {
  const [active, setActive] = useState<string>('all');

  // 동적으로 카테고리 생성 (실제 데이터의 category 기반)
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    const categoryList = [
      { key: 'all', label: '전체보기' },
      ...uniqueCategories.map((category) => ({
        key: category,
        label: category
      }))
    ];
    return categoryList;
  }, [items]);

  const filtered = useMemo(() => {
    if (active === 'all') return items;
    return items.filter((item) => item.category === active);
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

        {/* 동적 카테고리 버튼 */}
        {categories.length > 1 && (
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
        )}

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

