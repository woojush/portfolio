'use client';

// Client component that fetches Journey items from Firestore
// and displays them in a timeline format.

import { useEffect, useState } from 'react';
import { getJourneyItems, type JourneyItem } from '@/lib/firestore/journey';
import { JourneyTimeline } from './JourneyTimeline';

export function JourneySection() {
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getJourneyItems();
        setItems(data);
      } catch (err) {
        setError('여정 기록을 불러오지 못했습니다.');
        console.error('Journey fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section id="journey" className="section-container">
      <header className="section-header">
        <h2 className="text-section-title">Journey</h2>
        <p className="mt-2 max-w-2xl text-body text-slate-300">
          시간의 흐름 속에서 어떤 선택을 했고, 무엇을 느꼈는지 간단한
          타임라인으로 정리했습니다. 아직은 작은 기록들이지만, 앞으로의
          걸음들이 계속 이어질 자리입니다.
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
          아직 여정 기록이 없습니다. Admin 페이지에서 항목을 추가해 보세요.
        </p>
      )}

      {!loading && !error && items.length > 0 && <JourneyTimeline items={items} />}
    </section>
  );
}

