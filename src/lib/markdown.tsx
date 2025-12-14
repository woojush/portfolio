// Markdown and HTML rendering utilities
// Handles both Markdown and HTML content (from TipTap editor)

'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { generateHeadingId, resetHeadingCounters } from '@/lib/headingId';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Check if content is HTML (contains HTML tags)
function isHTML(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}


export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && contentRef.current && isHTML(content)) {
      // Dynamically import DOMPurify only on client side
      import('dompurify').then((DOMPurify) => {
        // Sanitize and render HTML
        const sanitized = DOMPurify.default.sanitize(content, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'class'],
        });
        contentRef.current!.innerHTML = sanitized;
      });
    }
  }, [content]);

  // If content is HTML, render it directly (will be populated by useEffect)
  if (isHTML(content)) {
    return (
      <div
        ref={contentRef}
        className={`${className || 'prose prose-invert max-w-none'} prose-headings:text-slate-100 prose-p:text-slate-300 prose-strong:text-slate-100 prose-code:text-warmBeige prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg`}
      />
    );
  }

  // Extract text from ReactMarkdown children (recursive)
  const extractText = (children: any): string => {
    if (typeof children === 'string') {
      return children;
    }
    if (Array.isArray(children)) {
      return children.map(extractText).join('');
    }
    if (children && typeof children === 'object' && 'props' in children && children.props.children) {
      return extractText(children.props.children);
    }
    return String(children || '');
  };

  // Reset counters when content changes to ensure consistency with TableOfContents
  useEffect(() => {
    resetHeadingCounters();
  }, [content]);

  // 연속된 이미지를 슬라이더로 변환
  useEffect(() => {
    if (!containerRef.current || isHTML(content)) return;

    // ReactMarkdown 렌더링 완료 대기
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      // ReactMarkdown은 이미지를 <p> 태그 안에 렌더링합니다
      // <p><div class="my-4"><img /></div></p> 구조
      // 따라서 <p> 태그를 기준으로 연속된 이미지를 찾아야 합니다
      const allParagraphs = Array.from(container.querySelectorAll('p')) as HTMLElement[];
      
      // 이미지만 포함하는 <p> 태그 찾기
      const imageParagraphs: HTMLElement[] = [];
      allParagraphs.forEach(p => {
        const img = p.querySelector('img');
        const divWrapper = p.querySelector('div.my-4');
        // <p> 안에 이미지가 있고, 다른 텍스트가 없는 경우
        if (img && divWrapper && p.textContent?.trim() === '') {
          imageParagraphs.push(p);
        }
      });

      if (imageParagraphs.length < 2) return;

      // 연속된 이미지 그룹 찾기
      const groups: HTMLElement[][] = [];
      let currentGroup: HTMLElement[] = [];

      imageParagraphs.forEach((pTag, index) => {
        if (index === 0) {
          // 첫 번째 이미지는 새 그룹 시작
          currentGroup = [pTag];
          return;
        }

        // 이전 이미지 <p> 태그 찾기
        const prevPTag = imageParagraphs[index - 1];
        
        // DOM에서 실제로 인접해 있는지 확인
        // 이전 <p> 태그의 nextSibling을 확인하여 중간에 다른 요소가 있는지 체크
        let isAdjacent = false;
        
        // 이전 <p> 태그 바로 다음 요소가 현재 <p> 태그인지 확인
        let nextNode = prevPTag.nextSibling;
        while (nextNode) {
          // 텍스트 노드이고 공백만 있는 경우 건너뛰기
          if (nextNode.nodeType === Node.TEXT_NODE) {
            if (!nextNode.textContent?.trim()) {
              nextNode = nextNode.nextSibling;
              continue;
            }
          }
          // 요소 노드인 경우
          if (nextNode.nodeType === Node.ELEMENT_NODE) {
            if (nextNode === pTag) {
              isAdjacent = true;
              break;
            }
            // 다른 요소가 있으면 연속이 아님
            if ((nextNode as Element).tagName === 'P' || (nextNode as Element).textContent?.trim()) {
              break;
            }
          }
          nextNode = nextNode.nextSibling;
        }

        if (isAdjacent) {
          // 연속된 이미지
          currentGroup.push(pTag);
        } else {
          // 연속이 끊김
          if (currentGroup.length >= 2) {
            groups.push([...currentGroup]);
          }
          currentGroup = [pTag];
        }
      });

      // 마지막 그룹 추가
      if (currentGroup.length >= 2) {
        groups.push(currentGroup);
      }

      // 각 그룹을 슬라이더로 변환
      groups.forEach((group) => {
        const imagesData = group.map(pTag => {
          const img = pTag.querySelector('img') as HTMLImageElement;
          return {
            src: img?.src || img?.getAttribute('src') || '',
            alt: img?.alt || ''
          };
        }).filter(img => img.src);

        if (imagesData.length < 2) return;

        const firstPTag = group[0];
        const sliderId = `slider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // 슬라이더 HTML 생성
        const sliderHTML = `
          <div class="relative w-[54%] my-4">
            <div class="relative overflow-hidden rounded-lg bg-slate-100" id="${sliderId}">
              <div class="flex transition-transform duration-300 ease-in-out" data-current-index="0" style="transform: translateX(0%)">
                ${imagesData.map((img, idx) => `
                  <div class="w-full flex-shrink-0">
                    <img src="${img.src}" alt="${img.alt || `이미지 ${idx + 1}`}" class="w-full h-auto object-contain rounded-lg" />
                  </div>
                `).join('')}
              </div>
            </div>
            <button class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition z-10" data-slider-prev="${sliderId}">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition z-10" data-slider-next="${sliderId}">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div class="flex justify-center gap-2 mt-2">
              ${imagesData.map((_, idx) => `
                <button class="slider-indicator h-2 rounded-full transition ${idx === 0 ? 'w-6 bg-black' : 'w-2 bg-slate-300'}" data-slider-indicator="${sliderId}" data-index="${idx}"></button>
              `).join('')}
            </div>
          </div>
        `;

        // 첫 번째 <p> 태그를 슬라이더로 교체
        firstPTag.outerHTML = sliderHTML;

        // 나머지 이미지 <p> 태그 제거
        group.slice(1).forEach(pTag => {
          if (pTag.parentElement) {
            pTag.remove();
          }
        });
      });

    // 이벤트 리스너 추가 (동적으로 생성된 버튼들)
    const updateSlider = (sliderId: string, newIndex: number) => {
      const slider = document.getElementById(sliderId);
      if (!slider) return;

      const flex = slider.querySelector('.flex') as HTMLElement;
      if (!flex) return;

      const total = flex.children.length;
      const index = newIndex < 0 ? total - 1 : newIndex >= total ? 0 : newIndex;
      
      flex.style.transform = `translateX(-${index * 100}%)`;
      flex.setAttribute('data-current-index', String(index));

      // 인디케이터 업데이트 (슬라이더의 부모 요소 내에서만 찾기)
      const sliderParent = slider.parentElement;
      if (sliderParent) {
        const indicators = sliderParent.querySelectorAll(`[data-slider-indicator="${sliderId}"]`);
        indicators.forEach((ind) => {
          const indicator = ind as HTMLElement;
          const indIndex = parseInt(indicator.getAttribute('data-index') || '0');
          if (indIndex === index) {
            indicator.className = 'slider-indicator h-2 w-6 rounded-full transition bg-black';
          } else {
            indicator.className = 'slider-indicator h-2 w-2 rounded-full transition bg-slate-300';
          }
        });
      }
    };

    // 이전/다음 버튼 이벤트
    container.querySelectorAll(`[data-slider-prev]`).forEach(btn => {
      const sliderId = btn.getAttribute('data-slider-prev');
      if (sliderId) {
        btn.addEventListener('click', () => {
          const slider = document.getElementById(sliderId);
          const flex = slider?.querySelector('.flex') as HTMLElement;
          if (flex) {
            const currentIndex = parseInt(flex.getAttribute('data-current-index') || '0');
            updateSlider(sliderId, currentIndex - 1);
          }
        });
      }
    });

    container.querySelectorAll(`[data-slider-next]`).forEach(btn => {
      const sliderId = btn.getAttribute('data-slider-next');
      if (sliderId) {
        btn.addEventListener('click', () => {
          const slider = document.getElementById(sliderId);
          const flex = slider?.querySelector('.flex') as HTMLElement;
          if (flex) {
            const currentIndex = parseInt(flex.getAttribute('data-current-index') || '0');
            updateSlider(sliderId, currentIndex + 1);
          }
        });
      }
    });

    // 인디케이터 버튼 이벤트
    container.querySelectorAll(`[data-slider-indicator]`).forEach(btn => {
      const sliderId = btn.getAttribute('data-slider-indicator');
      const index = parseInt(btn.getAttribute('data-index') || '0');
      if (sliderId) {
        btn.addEventListener('click', () => {
          updateSlider(sliderId, index);
        });
      }
    });

    return () => clearTimeout(timer);
    }, 100); // ReactMarkdown 렌더링 대기
  }, [content]);

  // Otherwise, render as Markdown
  return (
    <div ref={containerRef} className={className || 'prose prose-invert max-w-none'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={{
          h1: ({ children }) => {
            const text = extractText(children);
            const id = generateHeadingId(text, 1);
            return (
              <h1 id={id} className="mb-4 mt-6 text-2xl font-bold scroll-mt-24" style={{ color: 'rgba(0, 0, 0, 1)' }}>
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = extractText(children);
            const id = generateHeadingId(text, 2);
            return (
              <h2 id={id} className="mb-3 mt-5 text-xl font-semibold scroll-mt-24 text-black">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = extractText(children);
            const id = generateHeadingId(text, 3);
            return (
              <h3 id={id} className="mb-2 mt-4 text-lg font-semibold scroll-mt-24 text-black">
                {children}
              </h3>
            );
          },
          hr: () => (
            <hr className="my-6 border-t border-gray-300" />
          ),
          p: ({ children }) => <p className="mb-4 leading-relaxed text-black">{children}</p>,
          ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1 text-black [&_li::marker]:text-black">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1 text-black [&_li::marker]:text-black">{children}</ol>,
          li: ({ children }) => <li className="text-black">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-black">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-warmBeige">{children}</code>
            ) : (
              <code className="block rounded-lg bg-slate-900 p-3 text-xs text-slate-300">{children}</code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-slate-300 bg-slate-100 pl-4 text-black">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <div className="my-4">
              <img src={src} alt={alt} className="rounded-lg max-w-full w-[54%]" />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

