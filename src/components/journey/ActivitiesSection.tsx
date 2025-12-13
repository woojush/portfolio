'use client';

// Activities section component - 작은 섹션으로 Journey 아래에 표시

import { activities } from '@/data/activities';

export function ActivitiesSection() {
  return (
    <section id="activities" className="mt-8 pt-8 border-t border-slate-200">
      <h2 className="text-2xl font-bold mb-4 text-black">Activities</h2>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex gap-3">
            <span className="text-sm font-medium text-black whitespace-nowrap flex-shrink-0">
              {activity.date}:
            </span>
            <p className="text-sm text-black leading-relaxed">
              {activity.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

