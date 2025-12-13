// Experience entry detail page
// Layout: date at top, title, summary section, content, tags at bottom

import { notFound } from 'next/navigation';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import Link from 'next/link';
import { MarkdownRenderer } from '@/lib/markdown';
import { SummarySection } from '@/components/shared/SummarySection';
import { cookies } from 'next/headers';
import { hasAdminSession } from '@/lib/adminSessionStore';

interface ExperienceEntryDetailPageProps {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ category?: string; from?: string }>;
}

export default async function ExperienceEntryDetailPage({
  params,
  searchParams
}: ExperienceEntryDetailPageProps) {
  const { entryId } = await params;
  const { category, from } = await searchParams;
  const entry = await experienceRepository.getEntryById(entryId);

  if (!entry) {
    return notFound();
  }

  // 관리자 세션 확인 (from 파라미터가 있거나 세션이 있으면 관리자로 간주)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  const isAdmin = from === 'admin' || (sessionCookie ? hasAdminSession(sessionCookie) : false);

  const dateRange =
    entry.endDate && entry.endDate !== entry.startDate
      ? `${entry.startDate} ~ ${entry.endDate}`
      : entry.startDate;

  // 이전 경로 결정
  const backUrl = from === 'admin'
    ? category && category !== 'all'
      ? `/admin/experience?category=${encodeURIComponent(category)}`
      : '/admin/experience'
    : category && category !== 'all'
    ? `/experience?category=${encodeURIComponent(category)}`
    : '/experience';

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <section className="section-container border-t-0 pt-0">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={backUrl}
            className="inline-block text-xs text-slate-400 hover:text-slate-200"
          >
            ← Experience 목록으로
          </Link>
          {isAdmin && (
            <Link
              href={`/admin/experience/${entryId}?from=admin&category=${category || 'all'}`}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              편집
            </Link>
          )}
        </div>

        <header className="section-header">
          {/* Date at top */}
          <p className="mb-3 text-xs text-slate-400">
            {dateRange || '날짜 없음'}
          </p>

          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
              {entry.category}
            </span>
            {entry.period && (
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs text-white">
                {entry.period}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-section-title">{entry.title}</h1>
            {entry.period && (
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs text-white">
                {entry.period}
              </span>
            )}
          </div>
        </header>

        {/* Summary section */}
        <SummarySection summary={entry.summary} />

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
