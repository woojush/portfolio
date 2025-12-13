import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100 text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-sm md:flex-row md:items-center md:justify-between">
        <span className="text-[13px] text-slate-700">
          © {new Date().getFullYear()} WOOJU. All rights reserved.
        </span>
        <div className="flex items-center gap-3 text-[13px]">
          <Link href="https://www.linkedin.com" className="hover:text-slate-900">
            LinkedIn
          </Link>
          <Link href="mailto:tlsdntjr1121@naver.com" className="hover:text-slate-900">
            Email
          </Link>
        </div>
      </div>
    </footer>
  );
}

