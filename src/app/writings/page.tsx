// Writings page - shows all writing entries

import { writingsRepository } from '@/lib/repositories/writingsRepository';
import { WritingsList } from '@/components/writings/WritingsList';

export default async function WritingsPage() {
  const entries = await writingsRepository.getPublicEntries();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <WritingsList entries={entries} />
    </main>
  );
}
