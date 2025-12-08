import type { JourneyItem } from '@/lib/firestore/journey';

interface JourneyTimelineProps {
  items: JourneyItem[];
}

export function JourneyTimeline({ items }: JourneyTimelineProps) {
  return (
    <ol className="space-y-6 border-l border-slate-800 pl-4 md:space-y-8 md:pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-2.5 mt-1 h-2.5 w-2.5 rounded-full border border-slate-300 bg-slate-900" />
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {item.period}
            </p>
            <h3 className="text-sm font-semibold text-slate-100 md:text-base">
              {item.title}
            </h3>
            <p className="text-sm text-slate-300 md:text-base">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}




