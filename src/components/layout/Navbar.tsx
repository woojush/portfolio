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
  { href: '/experience', label: 'Experience' },
  { href: '/writings', label: 'Writings' }
];

const adminNavItems = [
  { href: '/admin/learning', label: '학습 관리'},
  { href: '/admin/experience', label: '경험 관리'},
  { href: '/admin/writings', label: '글 관리' },
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
  const [navColors, setNavColors] = useState({
    bg: 'rgba(15,23,42,0.8)', // slate-950/80
    text: '#F8FAFC', // slate-50
    hoverBg: 'rgba(255,255,255,0.08)',
    hoverText: '#FFFFFF',
    activeBg: 'rgba(255,255,255,0.10)',
    activeText: '#FFFFFF'
  });
  const isAdminPage = pathname?.startsWith('/admin') && pathname !== '/admin/login';
  const [loggingOut, setLoggingOut] = useState(false);

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
          setNavColors({
            bg: settings.navBgColor || 'rgba(15,23,42,0.8)',
            text: settings.navTextColor || '#F8FAFC',
            hoverBg: settings.navHoverBgColor || 'rgba(255,255,255,0.08)',
            hoverText: settings.navHoverTextColor || '#FFFFFF',
            activeBg: settings.navActiveBgColor || 'rgba(255,255,255,0.10)',
            activeText: settings.navActiveTextColor || '#FFFFFF'
          });
        }
      } catch (error) {
        // 실패 시 기본값 유지
        console.error('Failed to load display name:', error);
      }
    })();
  }, []);

  // 페이지 배경 색을 네비게이션 배경과 맞추기 (관리자 페이지는 클래식 네이비 고정)
  useEffect(() => {
    const adminBg = '#0f172a';
    if (isAdminPage) {
      const palette = pickPalette(adminBg);
      setNavColors({
        bg: adminBg,
        text: palette.text,
        hoverBg: 'rgba(255,255,255,0.08)',
        hoverText: '#FFFFFF',
        activeBg: 'rgba(255,255,255,0.10)',
        activeText: '#FFFFFF'
      });
      document.body.style.backgroundColor = adminBg;
      document.body.style.color = palette.text;
      document.documentElement.style.setProperty('--surface-bg', adminBg);
      document.documentElement.style.setProperty('--card-bg', palette.card);
      document.documentElement.style.setProperty('--border-color', palette.cardBorder);
      document.documentElement.style.setProperty('--text-primary', palette.text);
      document.documentElement.style.setProperty('--text-muted', palette.muted);
      return;
    }

    // 공개 페이지: 경험/여정 등 모든 페이지는 네비 색상과 동일한 바디 배경
    const bgColor = navColors.bg || 'rgba(15,23,42,0.8)';
    const palette = pickPalette(bgColor);

    // 홈에서 배경 이미지가 없으면 네비와 바디를 동일 색상으로
    if (pathname === '/' && !hasHeroImage) {
      document.body.style.backgroundColor = bgColor;
      document.body.style.color = palette.text;
    } else if (pathname !== '/') {
      document.body.style.backgroundColor = bgColor;
      document.body.style.color = palette.text;
    } else {
      // 홈에서 배경 이미지가 있을 경우 기본 스타일 유지
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
    document.documentElement.style.setProperty('--surface-bg', bgColor);
    document.documentElement.style.setProperty('--card-bg', palette.card);
    document.documentElement.style.setProperty('--border-color', palette.cardBorder);
    document.documentElement.style.setProperty('--text-primary', palette.text);
    document.documentElement.style.setProperty('--text-muted', palette.muted);
  }, [isAdminPage, navColors.bg, hasHeroImage, pathname]);

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

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-300',
        shouldShowBackground
          ? 'backdrop-blur shadow-lg'
          : 'bg-transparent'
      ].join(' ')}
      style={{ backgroundColor: navColors.bg }}
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
              } else if (item.href === '/admin/writings') {
                isActive = pathname?.startsWith('/admin/writings') || false;
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
                  className="rounded-full px-3 py-1.5 transition-colors"
                  style={{
                    color: isActive ? navColors.activeText : navColors.text,
                    backgroundColor: isActive ? navColors.activeBg : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = navColors.hoverText;
                    e.currentTarget.style.backgroundColor = navColors.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive ? navColors.activeText : navColors.text;
                    e.currentTarget.style.backgroundColor = isActive ? navColors.activeBg : 'transparent';
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
                className="rounded-full px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                style={{ color: navColors.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = navColors.hoverText;
                  e.currentTarget.style.backgroundColor = navColors.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = navColors.text;
                  e.currentTarget.style.backgroundColor = 'transparent';
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
