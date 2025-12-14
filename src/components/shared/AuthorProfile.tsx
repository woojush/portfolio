'use client';

// Author profile component showing author name, profile image, and date

import Image from 'next/image';

interface AuthorProfileProps {
  authorName?: string;
  authorImageUrl?: string;
  date: string; // "YYYY-MM-DD" format
}

export function AuthorProfile({ authorName, authorImageUrl, date }: AuthorProfileProps) {
  // Format date to "YYYY년 MM월 DD일"
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    } catch {
      return dateStr;
    }
  };

  // Fixed author information
  const displayName = authorName || '신우주';
  const defaultImageUrl = 'https://i.ibb.co/0R334jM2/2024-01-30.jpg';
  const profileImageUrl = authorImageUrl || defaultImageUrl;
  const formattedDate = formatDate(date);

  return (
    <div className="mt-4 flex items-center gap-3">
      {/* Profile Image */}
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-300">
        <Image
          src={profileImageUrl}
          alt={displayName}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>

      {/* Name and Date */}
      <div className="flex flex-col">
        <span className="text-base font-medium text-slate-900">{displayName}</span>
        <span className="text-sm text-slate-500">{formattedDate}</span>
      </div>
    </div>
  );
}

