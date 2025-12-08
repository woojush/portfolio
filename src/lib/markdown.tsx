// Markdown and HTML rendering utilities
// Handles both Markdown and HTML content (from TipTap editor)

'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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

  // Otherwise, render as Markdown
  return (
    <div className={className || 'prose prose-invert max-w-none'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

