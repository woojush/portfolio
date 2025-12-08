// Journey page - displays journey timeline

import { journeyRepository } from '@/lib/repositories/journeyRepository';
import { JourneyList } from '@/components/journey/JourneyList';

export default async function JourneyPage() {
  const items = await journeyRepository.getPublicEntries();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-3 md:px-6 md:pt-4">
      <section className="section-container border-0 pt-0" style={{ borderTop: 'none' }}>
        <header className="section-header">
          <h1 className="text-section-title">Journey</h1>
          <p className="mt-2 max-w-2xl text-body text-slate-0">
            시간의 흐름 속에서 어떤 선택을 했고, 무엇을 느꼈는지 간단한
            타임라인으로 정리했습니다.
          </p>
          <div className="mt-4 h-px w-full bg-slate-800" />
        </header>
        <JourneyList items={items} />
      </section>
    </main>
  );
}

