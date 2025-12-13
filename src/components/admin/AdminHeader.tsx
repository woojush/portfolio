'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  // 현재 페이지에 따라 제목 결정
  const getPageTitle = () => {
    if (pathname?.startsWith('/admin/dashboard')) return 'Dashboard';
    if (pathname?.startsWith('/admin/learning')) return 'Learning 관리';
    if (pathname?.startsWith('/admin/experience')) return 'Experience 관리';
    if (pathname?.startsWith('/admin/journey')) return 'Journey 관리';
    if (pathname?.startsWith('/admin/homepage')) return '홈페이지 설정';
    return 'Dashboard';
  };

  async function handleLogout() {
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      const res = await fetch('/api/admin/logout', {
        method: 'POST'
      });
      
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  }

  const today = new Date().toLocaleDateString('ko-KR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{getPageTitle()}</h1>
        <p className="text-slate-400">{today}</p>
      </div>
      
      <div className="flex flex-wrap gap-3 text-sm">
        {[
          { href: '/admin/dashboard', label: 'Dashboard' },
          { href: '/admin/journey', label: 'Journey 관리' },
          { href: '/admin/learning', label: 'Learning 관리' },
          { href: '/admin/experience', label: 'Experience 관리' },
          { href: '/admin/homepage', label: '홈페이지 설정' }
        ].map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'rounded-lg px-4 py-2 transition',
                isActive
                  ? 'bg-slate-700 text-slate-50'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg bg-slate-800 px-4 py-2 text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
        >
          {loggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    </div>
  );
}

