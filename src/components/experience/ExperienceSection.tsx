'use client';

// Client component that fetches Experience items from Firestore
// and displays them as accordion cards.

import { useEffect, useState } from 'react';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import type { ExperienceItem } from '@/lib/firestore/types';
import { ExperienceCard } from './ExperienceCard';

export function ExperienceSection() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await experienceRepository.getPublicEntries();
        setItems(data);
      } catch (err) {
        setError('경험 기록을 불러오지 못했습니다.');
        console.error('Experience fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section
      id="experience"
      className="section-container py-10 md:py-14"
    >
      <header className="section-header space-y-3">
        <h2 className="text-4xl font-bold md:text-5xl">Experience</h2>
        <p className="mt-1 max-w-3xl text-lg text-slate-300 md:text-xl">
          경험의 힘을 믿고 나눕니다.
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
          아직 경험 기록이 없습니다. Admin 페이지에서 항목을 추가해 보세요.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <ExperienceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
