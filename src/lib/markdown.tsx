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

  // Otherwise, render as Markdown
  return (
    <div className={className || 'prose prose-invert max-w-none'}>
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
              <h2 id={id} className="mb-3 mt-5 text-xl font-semibold scroll-mt-24" style={{ color: 'var(--card-bg)' }}>
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = extractText(children);
            const id = generateHeadingId(text, 3);
            return (
              <h3 id={id} className="mb-2 mt-4 text-lg font-semibold scroll-mt-24" style={{ color: 'var(--card-bg)' }}>
                {children}
              </h3>
            );
          },
          p: ({ children }) => <p className="mb-4 leading-relaxed" style={{ color: 'var(--card-bg)' }}>{children}</p>,
          ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1 text-slate-300">{children}</ol>,
          li: ({ children }) => <li className="text-slate-300">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
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
            <blockquote className="my-4 border-l-4 border-warmBeige/50 bg-slate-900/50 pl-4 italic text-slate-400">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="rounded-lg max-w-full" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

