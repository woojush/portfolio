// Learning entry detail page
// Layout: date at top, title, summary section with divider, content, tags at bottom

import { notFound } from 'next/navigation';
import { learningRepository } from '@/lib/repositories/learningRepository';
import Link from 'next/link';
import { MarkdownRenderer } from '@/lib/markdown';
import { SummarySection } from '@/components/shared/SummarySection';

interface LearningEntryDetailPageProps {
  params: Promise<{ subject: string; entryId: string }>;
}

export default async function LearningEntryDetailPage({
  params
}: LearningEntryDetailPageProps) {
  const { entryId } = await params;
  const entry = await learningRepository.getEntryById(entryId);

  if (!entry) {
    return notFound();
  }

  const dateRange =
    entry.endDate && entry.endDate !== entry.startDate
      ? `${entry.startDate} ~ ${entry.endDate}`
      : entry.startDate;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <section className="section-container border-t-0 pt-0">
        <Link
          href={`/learning?subject=${encodeURIComponent(entry.subject)}`}
          className="mb-4 inline-block text-xs text-slate-400 hover:text-slate-200"
        >
          ← {entry.subject} 목록으로
        </Link>

        <header className="section-header">
          {/* Date at top (네이버 블로그 스타일) */}
          <p className="mb-3 text-xs text-slate-400">
            {dateRange || '날짜 없음'}
          </p>

          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
              {entry.subject}
            </span>
          </div>

          <h1 className="text-section-title">{entry.title}</h1>
        </header>

        {/* Summary section with divider */}
        <SummarySection summary={entry.summary} />

        {/* Content */}
        <div className="prose prose-invert mt-8 max-w-none">
          <MarkdownRenderer content={entry.content} />
        </div>

        {/* Tags at bottom */}
        {entry.tags.length > 0 && (
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
