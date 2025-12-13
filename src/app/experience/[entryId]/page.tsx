// Experience entry detail page
// Layout: thumbnail, category, title, author profile, summary section, content with TOC

import { notFound } from 'next/navigation';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import Link from 'next/link';
import { MarkdownRenderer } from '@/lib/markdown';
import { SummarySection } from '@/components/shared/SummarySection';
import { TableOfContents } from '@/components/shared/TableOfContents';
import { AuthorProfile } from '@/components/shared/AuthorProfile';
import { cookies } from 'next/headers';
import { hasAdminSession } from '@/lib/adminSessionStore';
import Image from 'next/image';

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

  // 이전 경로 결정
  const backUrl = from === 'admin'
    ? category && category !== 'all'
      ? `/admin/experience?category=${encodeURIComponent(category)}`
      : '/admin/experience'
    : category && category !== 'all'
    ? `/experience?category=${encodeURIComponent(category)}`
    : '/experience';

  return (
    <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <section className="section-container border-t-0 pt-0">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={backUrl}
            className="inline-block text-xs text-slate-400 hover:text-slate-200"
          >
            ← {category || 'Experience'} 목록으로
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

        {/* Main Content Layout: Flex with sidebar */}
        <div className="relative flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Column: Main Content - maintains width */}
          <div className="flex-1 min-w-0">
            {/* Thumbnail - larger size */}
            {entry.thumbnailUrl && (
              <div className="mb-6 relative w-full aspect-video overflow-hidden rounded-lg bg-slate-200">
                <Image
                  src={entry.thumbnailUrl}
                  alt={entry.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 75vw"
                />
              </div>
            )}

            {/* Category */}
            <div className="mb-4">
              <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
                {entry.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgba(0, 0, 0, 1)' }}>
              {entry.title}
            </h1>

            {/* Author Profile and Date */}
            <AuthorProfile
              authorName={entry.authorName}
              authorImageUrl={entry.authorImageUrl}
              date={entry.startDate}
            />

            {/* Summary section with divider */}
            <SummarySection summary={entry.summary} />

            {/* Content */}
            <div className="prose prose-invert mt-8 max-w-none">
              <MarkdownRenderer content={entry.content || ''} />
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
          </div>

          {/* Right Column: Sticky Table of Contents - increased width by 1/3 */}
          <div className="lg:w-[28%] lg:flex-shrink-0">
            <div className="sticky top-24">
              <TableOfContents content={entry.content || ''} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
