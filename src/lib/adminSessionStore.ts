// Very small in-memory admin session store.
// NOTE: This is sufficient for a personal portfolio, but not for production-grade security.

const sessions = new Set<string>();

export function addAdminSession(token: string) {
  sessions.add(token);
}

export function hasAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  return sessions.has(token);
}

export function removeAdminSession(token: string) {
  sessions.delete(token);
}




