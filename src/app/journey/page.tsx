// Journey page - displays journey timeline

import { journeyRepository } from '@/lib/repositories/journeyRepository';
import { JourneyList } from '@/components/journey/JourneyList';
import { ActivitiesSection } from '@/components/journey/ActivitiesSection';

export default async function JourneyPage() {
  const items = await journeyRepository.getPublicEntries();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 md:px-6">
      <section className="section-container border-0 pt-0 text-center" style={{ borderTop: 'none' }}>
        <header className="section-header items-center">
          <h1 className="text-black font-bold" style={{ fontSize: '2.4rem', lineHeight: 1.05 }}>
            Journey
          </h1>
          <div className="mx-auto mt-4 h-px w-full max-w-3xl bg-slate-700/50" />
        </header>
        <div className="mt-6 text-left">
          <JourneyList items={items} />
        </div>
      </section>
      
      {/* Activities Section */}
      <ActivitiesSection />
    </main>
  );
}

