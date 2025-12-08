// Experience entry detail page
// Layout: date at top, title, summary section, content, tags at bottom

import { notFound } from 'next/navigation';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import Link from 'next/link';
import { MarkdownRenderer } from '@/lib/markdown';
import { SummarySection } from '@/components/shared/SummarySection';

interface ExperienceEntryDetailPageProps {
  params: Promise<{ entryId: string }>;
}

export default async function ExperienceEntryDetailPage({
  params
}: ExperienceEntryDetailPageProps) {
  const { entryId } = await params;
  const entry = await experienceRepository.getEntryById(entryId);

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
          href="/experience"
          className="mb-4 inline-block text-xs text-slate-400 hover:text-slate-200"
        >
          ← Experience 목록으로
        </Link>

        <header className="section-header">
          {/* Date at top */}
          <p className="mb-3 text-xs text-slate-400">
            {dateRange || '날짜 없음'}
          </p>

          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
              {entry.category}
            </span>
          </div>

          <h1 className="text-section-title">{entry.title}</h1>
        </header>

        {/* Summary section */}
        <SummarySection summary={entry.summary} />

        {/* Images */}
        {entry.images && entry.images.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-4">
            {entry.images.map((src) => (
              <div
                key={src}
                className="h-48 w-64 overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {entry.content && (
          <div className="prose prose-invert mt-8 max-w-none">
            <MarkdownRenderer content={entry.content} />
          </div>
        )}
      </section>
    </main>
  );
}
