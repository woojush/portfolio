'use client';

// Summary section component with collapsible "요약하여 읽기" section
// Shows divider, "요약" title, summary content, and another divider

import { useState } from 'react';

interface SummarySectionProps {
  summary: string;
}

export function SummarySection({ summary }: SummarySectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!summary) return null;

  return (
    <div className="mt-6">
      {/* Top divider */}
      <div className="mb-4 h-px w-full bg-slate-800" />

      {/* Summary section */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between text-left"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            요약
          </h2>
          <span className="text-xs text-slate-500">
            {expanded ? '접기' : '요약하여 읽기'}
          </span>
        </button>

        <div
          className={[
            'overflow-hidden transition-all duration-200',
            expanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
          ].join(' ')}
        >
          <p className="text-sm leading-relaxed text-slate-300">{summary}</p>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="mt-4 h-px w-full bg-slate-800" />
    </div>
  );
}

