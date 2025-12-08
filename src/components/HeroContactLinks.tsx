'use client';

// Small contact popover used in the hero section next to the name.

import { useState } from 'react';
import { profile } from '@/data/profile';

export function HeroContactLinks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-200 shadow-sm transition hover:border-warmBeige hover:bg-slate-900 md:text-sm"
      >
        Links
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-20 w-56 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-lg backdrop-blur">
          <p className="mb-2 text-[11px] text-slate-400">
            공부와 글을 조금 더 자세히 보고 싶다면 아래 링크들로 이어집니다.
          </p>
          <ul className="space-y-1.5">
            {profile.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  className="flex items-center justify-between rounded-xl px-2 py-1 text-[11px] text-slate-200 transition hover:bg-slate-900/80"
                >
                  <span>{link.label}</span>
                  <span className="text-[10px] text-slate-500">열기 →</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-slate-500">
            {/* TODO: profile.links에 실제 주소를 채워 넣으면 이 카드에 자동으로 반영됩니다. */}
          </p>
        </div>
      )}
    </div>
  );
}




