'use client';

// Focus page: Shows all learning, experience, and writings entries
// sorted by time (newest first), representing what I've been focusing on.

import { useEffect, useState } from 'react';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import type { LearningEntry, ExperienceItem } from '@/lib/firestore/types';
import { LearningCard } from '@/components/learning/LearningCard';
import { ExperienceCard } from '@/components/experience/ExperienceCard';

type FocusItem =
  | { type: 'learning'; data: LearningEntry }
  | { type: 'experience'; data: ExperienceItem };

export default function FocusPage() {
  const [items, setItems] = useState<FocusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [learnings, experiences] = await Promise.all([
          learningRepository.getAllEntries(),
          experienceRepository.getAllEntries()
        ]);

        const allItems: FocusItem[] = [
          ...learnings.map((l) => ({ type: 'learning' as const, data: l })),
          ...experiences.map((e) => ({ type: 'experience' as const, data: e }))
        ];

        // Sort by date (newest first)
        allItems.sort((a, b) => {
          const getDate = (item: FocusItem): string => {
            if (item.type === 'learning') {
              return item.data.startDate || '';
            } else {
              return item.data.startDate || item.data.periodLabel || '';
            }
          };
          const dateA = getDate(a);
          const dateB = getDate(b);
          return dateB.localeCompare(dateA);
        });

        setItems(allItems);
      } catch (err) {
        setError('집중 기록을 불러오지 못했습니다.');
        console.error('Focus fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const typeLabels = {
    learning: '학습',
    experience: '경험'
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <section className="section-container border-t-0 pt-0">
        <header className="section-header">
          <h1 className="text-section-title">현재까지 집중한 것들</h1>
          <p className="mt-2 max-w-2xl text-body text-slate-300">
            학습과 경험을 시간순으로 모아 둔 공간입니다. 언제 무엇에
            집중했는지 한눈에 볼 수 있습니다.
          </p>
        </header>

        {loading && (
          <p className="text-sm text-slate-400">불러오는 중입니다...</p>
        )}

        {error && (
          <p className="text-sm text-red-400" aria-live="polite">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-slate-400">
            아직 집중 기록이 없습니다. Admin 페이지에서 항목을 추가해 보세요.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-6">
            {items.map((item, idx) => {
              const getDate = (item: FocusItem): string => {
                if (item.type === 'learning') {
                  return item.data.startDate || '';
                } else {
                  return item.data.startDate || item.data.periodLabel || '';
                }
              };
              const date = getDate(item);
              return (
                <div key={`${item.type}-${item.data.id}-${idx}`} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] text-slate-300">
                      {typeLabels[item.type]}
                    </span>
                    <span className="text-[11px] text-slate-400">{date}</span>
                  </div>
                  {item.type === 'learning' && (
                    <LearningCard entry={item.data} />
                  )}
                  {item.type === 'experience' && (
                    <ExperienceCard item={item.data} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

