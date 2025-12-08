// Admin logout route: clears the admin session cookie and removes from session store

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { removeAdminSession } from '@/lib/adminSessionStore';

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  // Remove from session store if token exists
  if (sessionToken) {
    removeAdminSession(sessionToken);
  }

  // Clear the cookie
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.delete('admin_session');

  return res;
}

