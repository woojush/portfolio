'use client';

// Activities section component - 작은 섹션으로 Journey 아래에 표시

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { activitiesRepository } from '@/lib/repositories/activitiesRepository';
import type { Activity } from '@/lib/firestore/activities';

// 괄호로 감싸진 텍스트를 회색으로 표시하는 헬퍼 함수
function renderDescriptionWithGrayParentheses(text: string): (string | ReactElement)[] {
  // 괄호로 감싸진 부분을 찾아서 회색으로 표시
  const parts: (string | ReactElement)[] = [];
  let lastIndex = 0;
  const regex = /\([^)]*\)/g;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // 괄호 이전 텍스트
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // 괄호로 감싸진 텍스트 (회색)
    parts.push(
      <span key={`paren-${keyIndex++}`} className="text-slate-500">
        {match[0]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  // 남은 텍스트
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // 매치가 없으면 원본 텍스트 반환
  return parts.length > 0 ? parts : [text];
}

export function ActivitiesSection() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function load() {
      try {
        const data = await activitiesRepository.getPublicEntries();
        
        // 컴포넌트가 마운트된 상태인지 확인
        if (!isMounted) return;
        
        // 날짜 기준으로 내림차순 정렬 (최신순)
        // date 형식: "YY.MM" (예: "24.06")
        const sorted = [...data].sort((a, b) => {
          // "YY.MM" 형식을 파싱하여 비교
          const parseDate = (dateStr: string): number => {
            const [year, month] = dateStr.split('.').map(Number);
            return (year || 0) * 100 + (month || 0);
          };
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          return dateB - dateA; // 내림차순 (최신순)
        });
        
        if (isMounted) {
          setActivities(sorted);
        }
      } catch (err) {
        console.error('Activities fetch error:', err);
        if (isMounted) {
          setError('활동 기록을 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    load();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section id="activities" className="mt-12 pt-8 border-t border-slate-200">
        <h2 className="text-2xl font-bold mb-4 text-black">Activities</h2>
        <p className="text-sm text-slate-400">불러오는 중입니다...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="activities" className="mt-12 pt-8 border-t border-slate-200">
        <h2 className="text-2xl font-bold mb-4 text-black">Activities</h2>
        <p className="text-sm text-red-400">{error}</p>
      </section>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <section id="activities" className="mt-12 pt-8 border-t border-slate-200">
      <h2 className="text-2xl font-bold mb-4 text-black">Activities</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <span className="text-sm font-medium text-black whitespace-nowrap flex-shrink-0">
              {activity.date}
            </span>
            <p className="text-sm text-black leading-relaxed">
              {renderDescriptionWithGrayParentheses(activity.description)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

