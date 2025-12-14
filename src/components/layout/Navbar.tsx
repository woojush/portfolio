'use client';

// Navbar with scroll behavior and conditional navigation
// Public nav: Home, Journey, Learning, Experience, Writings
// Admin nav: 학습 관리, 경험 관리, 글 관리, 대시보드

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const publicNavItems = [
  { href: '/', label: 'Home' },
  { href: '/journey', label: 'Journey' },
  { href: '/learning', label: 'Learning' },
  { href: '/experience', label: 'Experience' }
];

const adminNavItems = [
  { href: '/admin/learning', label: '학습 관리'},
  { href: '/admin/experience', label: '경험 관리'},
  { href: '/admin/journey', label: '여정 관리' },
  { href: '/admin/homepage', label: '홈페이지 설정'},
  { href: '/admin/dashboard', label: '대시보드'}
];

function useIsLoggedIn(): [boolean, () => void] {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = () => {
    // If we're on an admin page, assume we're logged in (middleware handles auth)
    if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
      setIsLoggedIn(true);
      return;
    }

    // Otherwise, try to check cookie (may not work if httpOnly, but worth trying)
    const cookies = document.cookie.split(';');
    const hasSession = cookies.some((cookie) =>
      cookie.trim().startsWith('admin_session=')
    );
    setIsLoggedIn(hasSession);
  };

  useEffect(() => {
    checkAuth();
    // Check periodically (every 5 seconds)
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, [pathname]);

  return [isLoggedIn, checkAuth];
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, refreshAuth] = useIsLoggedIn();
  const [displayName, setDisplayName] = useState('Shin Woo-Ju');
  const [hasHeroImage, setHasHeroImage] = useState(false);
  const isAdminPage = pathname ? pathname.startsWith('/admin') && pathname !== '/admin/login' : false;
  const [loggingOut, setLoggingOut] = useState(false);

  // 디버깅: Navbar 렌더링 확인
  useEffect(() => {
    console.log('Navbar rendered:', { pathname, isAdminPage, isLoggedIn });
  }, [pathname, isAdminPage, isLoggedIn]);

  // 일반 화면: 화이트 계열 고정, 관리자: 네이비 고정
  const navColors = isAdminPage
    ? {
        bg: '#0f172a', // 네이비 고정
        text: '#E2E8F0',
        hoverBg: 'rgba(255,255,255,0.08)',
        hoverText: '#FFFFFF',
        activeBg: 'rgba(255,255,255,0.10)',
        activeText: '#FFFFFF'
      }
    : {
        // 일반 화면: 화이트 계열 고정
        bg: 'rgba(255,255,255,0.95)', // 화이트 반투명
        text: '#0F172A', // 다크 텍스트
        hoverBg: 'rgba(15,23,42,0.08)', // 다크 호버
        hoverText: '#0F172A',
        activeBg: 'rgba(15,23,42,0.10)',
        activeText: '#0F172A'
      };

  // 배경색에 따라 조화로운 팔레트 계산
  const pickPalette = (bg: string) => {
    // rgba/hex 파싱 후 상대 명도 계산
    const toRgb = (color: string) => {
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const bigint = parseInt(hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
      }
      const match = color.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
      if (match) {
        return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
      }
      // fallback slate-950
      return { r: 15, g: 23, b: 42 };
    };

    const { r, g, b } = toRgb(bg);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isDark = luminance < 0.45;

    if (isDark) {
      return {
        text: '#E2E8F0',
        muted: '#94A3B8',
        card: 'rgba(15,23,42,0.7)',
        cardBorder: 'rgba(255,255,255,0.08)'
      };
    }
    return {
      text: '#0F172A',
      muted: '#475569',
      card: 'rgba(255,255,255,0.8)',
      cardBorder: 'rgba(15,23,42,0.1)'
    };
  };

  // 홈 설정에서 이름을 불러와 네비게이션 좌측에 표시
  useEffect(() => {
    (async () => {
      try {
        const repo = await import('@/lib/repositories/dashboardRepository');
        const settings = await repo.dashboardRepository.getHomePageSettings();
        if (settings?.name) {
          setDisplayName(settings.name);
        }
        if (settings) {
          setHasHeroImage(!!settings.heroImageUrl);
        }
      } catch (error) {
        // 실패 시 기본값 유지
        console.error('Failed to load display name:', error);
      }
    })();
  }, []);

  // 페이지 배경 색 설정 (관리자: 네이비 고정, 일반: 화이트 계열 고정)
  useEffect(() => {
    if (isAdminPage) {
      // 관리자 페이지: 네이비 고정
      const adminBg = '#0f172a';
      const palette = pickPalette(adminBg);
      document.body.style.backgroundColor = adminBg;
      document.body.style.color = palette.text;
      document.documentElement.style.setProperty('--surface-bg', adminBg);
      document.documentElement.style.setProperty('--card-bg', palette.card);
      document.documentElement.style.setProperty('--border-color', palette.cardBorder);
      document.documentElement.style.setProperty('--text-primary', palette.text);
      document.documentElement.style.setProperty('--text-muted', palette.muted);
      return;
    }

    // 일반 페이지: 화이트 계열 고정 (배경 이미지 여부와 관계없이 동일하게 적용)
    const publicBg = 'rgba(241, 245, 249, 1)'; // slate-100
    const palette = pickPalette(publicBg);

    document.body.style.backgroundColor = publicBg;
    document.body.style.color = palette.text;

    document.documentElement.style.setProperty('--surface-bg', publicBg);
    document.documentElement.style.setProperty('--card-bg', palette.card);
    document.documentElement.style.setProperty('--border-color', palette.cardBorder);
    document.documentElement.style.setProperty('--text-primary', palette.text);
    document.documentElement.style.setProperty('--text-muted', palette.muted);
  }, [isAdminPage, hasHeroImage, pathname]);

  // 관리자 로그인 시에는 관리용 네비게이션만 표시
  const navItems = isLoggedIn ? adminNavItems : publicNavItems;

  async function handleLogout() {
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      const res = await fetch('/api/admin/logout', {
        method: 'POST'
      });
      
      if (res.ok) {
        // 인증 상태 즉시 업데이트
        refreshAuth();
        // 로그아웃 성공 시 홈으로 리다이렉트
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

  // 짙은 네이비 반투명 상단바 고정 (사진 위에서도 가독성 확보)
  const shouldShowBackground = true;

  // Navbar 항상 렌더링 (사용자 페이지에서도 표시)
  return (
    <header
      className={[
        'sticky top-0 z-50 w-full transition-all duration-300',
        shouldShowBackground
          ? 'backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      ].join(' ')}
      style={{
        backgroundColor: navColors.bg,
        borderBottom: isAdminPage
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%'
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link
          href={isLoggedIn ? '/admin/dashboard' : '/'}
          className="font-semibold tracking-tight transition"
          style={{ color: navColors.text }}
        >
          <span>{isLoggedIn ? '관리자' : displayName}</span>
        </Link>
        <ul className="flex items-center gap-2 text-xs md:gap-4 md:text-sm">
          {navItems.map((item) => {
            // 관리자 페이지에서는 경로 매칭을 더 유연하게
            let isActive = false;
            if (isLoggedIn) {
              // 관리자 페이지: 경로가 해당 섹션으로 시작하는지 확인
              if (item.href === '/admin/learning') {
                isActive = pathname?.startsWith('/admin/learning') || false;
              } else if (item.href === '/admin/experience') {
                isActive = pathname?.startsWith('/admin/experience') || false;
              } else if (item.href === '/admin/journey') {
                isActive = pathname?.startsWith('/admin/journey') || false;
              } else if (item.href === '/admin/dashboard') {
                isActive = pathname?.startsWith('/admin/dashboard') || false;
              }
            } else {
              // 공개 페이지: 정확한 경로 매칭
              isActive = pathname === item.href;
            }
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className="rounded-full px-3 py-1.5 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    color: isActive ? navColors.activeText : navColors.text,
                    backgroundColor: isActive ? navColors.activeBg : 'transparent',
                    outlineColor: navColors.hoverText
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          {isLoggedIn && (
            <li>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full px-3 py-1.5 text-xs transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  color: navColors.text,
                  outlineColor: navColors.hoverText
                }}
                title="로그아웃"
              >
                {loggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
