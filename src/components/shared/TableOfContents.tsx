'use client';

// Table of Contents component that extracts headings from markdown content

import { useMemo } from 'react';
import { generateHeadingId, resetHeadingCounters } from '@/lib/headingId';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  content: string;
}

// Extract headings from markdown content
function extractHeadings(content: string): Heading[] {
  // Reset counters to ensure consistency
  resetHeadingCounters();
  
  const lines = content.split('\n');
  const headings: Heading[] = [];
  
  for (const line of lines) {
    // Match markdown headers: #, ##, ###, etc.
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      
      // Use shared ID generation function
      const id = generateHeadingId(text, level);
      
      headings.push({ level, text, id });
    }
  }
  
  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  
  if (headings.length === 0) {
    return null;
  }
  
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="mb-4 text-base md:text-lg font-semibold text-slate-900">목차</h2>
      <div className="space-y-1">
        {headings.map((heading) => {
          // Bar width based on level
          const barWidth = heading.level === 1 ? 'w-1' : 'w-0.5';

          // Padding based on level - H1 needs extra left padding to prevent overlap with bar
          const itemPadding = heading.level === 1 
            ? 'mb-1 pl-5' 
            : heading.level === 2 
            ? 'mb-1 ml-4 pl-4' 
            : 'mb-1 ml-8 pl-4';

          return (
            <div
              key={heading.id}
              className={`relative ${itemPadding}`}
            >
              {/* Bar indicator - always visible, black color */}
              <div
                className={`absolute left-0 top-0 bottom-0 ${barWidth} bg-black rounded`}
              />
              <div
                className={`text-left w-full cursor-default text-slate-600 ${
                  heading.level === 1
                    ? 'text-base font-semibold'
                    : heading.level === 2
                    ? 'text-sm font-medium'
                    : 'text-sm font-normal'
                }`}
              >
                {heading.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
