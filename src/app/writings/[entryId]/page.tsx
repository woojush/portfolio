// Writing entry detail page
// Layout: date at top, title, summary section, content, tags at bottom

import { notFound } from 'next/navigation';
import { writingsRepository } from '@/lib/repositories/writingsRepository';
import Link from 'next/link';
import { MarkdownRenderer } from '@/lib/markdown';
import { SummarySection } from '@/components/shared/SummarySection';

interface WritingEntryDetailPageProps {
  params: Promise<{ entryId: string }>;
}

export default async function WritingEntryDetailPage({
  params
}: WritingEntryDetailPageProps) {
  const { entryId } = await params;
  const entry = await writingsRepository.getEntryById(entryId);

  if (!entry) {
    return notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <section className="section-container border-t-0 pt-0">
        <Link
          href="/writings"
          className="mb-4 inline-block text-xs text-slate-400 hover:text-slate-200"
        >
          ← Writings 목록으로
        </Link>

        <header className="section-header">
          {/* Date at top (네이버 블로그 스타일) */}
          <p className="mb-3 text-xs text-slate-400">{entry.date}</p>

          <h1 className="text-section-title">{entry.title}</h1>
        </header>

        {/* Summary section with divider */}
        <SummarySection summary={entry.summary} />

        {/* Content */}
        <div className="prose prose-invert mt-8 max-w-none">
          <MarkdownRenderer content={entry.content} />
        </div>

        {/* Tags at bottom */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-12 border-t border-slate-800 pt-6">
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
