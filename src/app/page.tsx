// Home page with full-screen hero image background
// Content is managed via Firestore (admin/homepage)

import Link from 'next/link';
import Image from 'next/image';
import { dashboardRepository } from '@/lib/repositories/dashboardRepository';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default async function HomePage() {
  // Firestore에서 홈 페이지 설정 가져오기
  const settings = await dashboardRepository.getHomePageSettings();
  
  // DB 설정값 사용 (없으면 빈 값 처리)
  const heroImageUrl = settings?.heroImageUrl || process.env.NEXT_PUBLIC_HERO_IMAGE_URL || null;
  const heroImagePosition = settings?.heroImagePosition || 'center';
  const heroImageFit = settings?.heroImageFit || 'cover';
  const heroImagePosX = settings?.heroImagePosX ?? 50;
  const heroImagePosY = settings?.heroImagePosY ?? 50;
  const heroOverlayOpacity = settings?.heroOverlayOpacity ?? 0.45;
  
  // 텍스트 스타일 설정 (Admin에서 설정한 값 우선, 없으면 기본 스타일)
  const heroTextColor = settings?.heroTextColor || '#f8fafc';
  const heroTextAlign = settings?.heroTextAlign || 'left';
  const heroNameSize = settings?.heroNameSize ?? 64;
  const heroSloganSize = settings?.heroSloganSize ?? 24;
  const heroIntroSize = settings?.heroIntroSize ?? 18;

  // 콘텐츠 (Admin에서 설정한 값만 사용)
  const name = settings?.name || ''; 
  const slogan = settings?.slogan || '';
  const introParagraphs = settings?.introParagraphs || [];
  const additionalContent = settings?.additionalContent;

  return (
    <div className="relative min-h-screen">
      {/* Full-screen background image with overlay */}
      <div className="fixed inset-0 -z-10">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="Background"
            fill
            className={heroImageFit === 'contain' ? 'object-contain' : 'object-cover'}
            style={{ objectPosition: `${heroImagePosX}% ${heroImagePosY}%` }}
            priority
            unoptimized={heroImageUrl.startsWith('http')}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        )}
        {/* 단일 오버레이 */}
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(15,23,42,${heroOverlayOpacity})` }}
        />
      </div>

      {/* Content - positioned below Navbar */}
      <div className="relative z-0 flex min-h-[calc(100vh-4rem)] flex-col pt-16">
        {/* Hero Section */}
        <section className="flex flex-1 flex-col justify-center px-4 pt-20 pb-40 md:px-6 lg:px-8">
          <div className={`w-full mx-auto max-w-7xl flex flex-col ${heroTextAlign === 'right' ? 'items-end text-right' : heroTextAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
            {name && (
              <h1
                className="mb-4 font-bold tracking-tight"
                style={{ color: heroTextColor, fontSize: `${heroNameSize}px` }}
              >
                {name}
              </h1>
            )}
            {slogan && (
              <p
                className="mb-6"
                style={{ color: heroTextColor, fontSize: `${heroSloganSize}px` }}
              >
                {slogan}
              </p>
            )}
            {introParagraphs.length > 0 && (
              <div
                className="max-w-2xl space-y-4 text-body"
                style={{ color: heroTextColor, fontSize: `${heroIntroSize}px` }}
              >
                {introParagraphs.map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
            
            {/* Additional Content (Markdown) */}
            {additionalContent && (
              <div className="mt-8 max-w-2xl">
                <div className="prose prose-invert max-w-none text-slate-300">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                    rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
                    components={{
                      p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                      h1: ({ children }) => <h1 className="mb-4 mt-6 text-2xl font-bold text-slate-100">{children}</h1>,
                      h2: ({ children }) => <h2 className="mb-3 mt-5 text-xl font-semibold text-slate-200">{children}</h2>,
                      h3: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-semibold text-slate-200">{children}</h3>,
                      ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-slate-300">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-warmBeige">{children}</code>
                        ) : (
                          <code className="block rounded-lg bg-slate-900 p-3 text-xs text-slate-300">{children}</code>
                        );
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="my-4 border-l-4 border-warmBeige/50 bg-slate-900/50 pl-4 italic text-slate-400">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {additionalContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer with admin login link */}
        <footer className="mt-auto px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto flex max-w-4xl justify-end">
            <Link
              href="/admin/login"
              className="text-xs text-slate-300 transition hover:text-warmBeige"
            >
              관리자 로그인
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
