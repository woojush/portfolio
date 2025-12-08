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
    <section id="experience" className="section-container">
      <header className="section-header">
        <h2 className="text-section-title">Experience</h2>
        <p className="mt-2 max-w-2xl text-body text-slate-300">
          화려한 이력보다는, 어떤 현장에서 무엇을 배우고 느꼈는지를 중심으로
          정리합니다. 알바와 동아리, 작은 프로젝트에서의 경험이 지금의 저를
          조금씩 만들어 가고 있습니다.
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
        <div className="space-y-4">
          {items.map((item) => (
            <ExperienceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
