import type { LearningEntry } from '@/data/learning';

interface LearningCardProps {
  entry: LearningEntry;
}

export function LearningCard({ entry }: LearningCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-500 hover:bg-slate-900">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {entry.date}
        </p>
        <h3 className="text-sm font-semibold text-slate-100 md:text-base">
          {entry.title}
        </h3>
        <p className="text-sm text-slate-300 md:text-base">{entry.summary}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}




