import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const token = cookieHeader
    .split(';')
    .find((c) => c.trim().startsWith('admin_session='))
    ?.split('=')[1];

  const secret = process.env.ADMIN_SECRET;
  const ok = verifyAdminToken(token, secret);

  return NextResponse.json({
    ok,
    hasCookie: !!token,
    hasSecret: !!secret
  });
}
