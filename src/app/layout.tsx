import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { FooterWrapper } from '@/components/layout/FooterWrapper';

export const metadata: Metadata = {
  title: 'Shin Woo-Ju | Personal Archive',
  description:
    'A calm, story-based personal site for Shin Woo-Ju: journey, learning, experience, writings and contact.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        className="bg-slate-100 text-slate-900 min-h-screen flex flex-col"
        style={{ backgroundColor: 'rgba(241, 245, 249, 1)' }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <FooterWrapper />
      </body>
    </html>
  );
}




