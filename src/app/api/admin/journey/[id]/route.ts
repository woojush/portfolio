import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasAdminSession } from '@/lib/adminSessionStore';
import { journeyRepository } from '@/lib/repositories/journeyRepository';

function getSessionFromRequest(req: Request) {
  return req.headers
    .get('cookie')
    ?.split(';')
    .find((c) => c.trim().startsWith('admin_session='))
    ?.split('=')[1];
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromRequest(req);
  if (!session || !hasAdminSession(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const allowedKeys = [
    'period',
    'title',
    'description',
    'organization',
    'affiliation',
    'location',
    'logoUrl',
    'imageUrl',
    'sortOrder',
    'isCurrent',
    'highlights',
    'tags',
    'textColor',
    'textSize',
    'durationText',
    'logoOffsetX',
    'logoOffsetY',
    'logoScale'
  ];

  const updates: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  if (updates.sortOrder !== undefined) {
    const n = Number(updates.sortOrder);
    if (Number.isNaN(n)) {
      return NextResponse.json(
        { error: 'sortOrder must be a number' },
        { status: 400 }
      );
    }
    updates.sortOrder = n;
  }

  if (updates.highlights !== undefined && !Array.isArray(updates.highlights)) {
    return NextResponse.json(
      { error: 'highlights must be an array of strings' },
      { status: 400 }
    );
  }
  if (Array.isArray(updates.highlights)) {
    updates.highlights = updates.highlights.filter((v: any) => typeof v === 'string');
  }

  if (updates.tags !== undefined && !Array.isArray(updates.tags)) {
    return NextResponse.json(
      { error: 'tags must be an array of strings' },
      { status: 400 }
    );
  }
  if (Array.isArray(updates.tags)) {
    updates.tags = updates.tags.filter((v: any) => typeof v === 'string');
  }

  if (updates.isCurrent !== undefined) {
    updates.isCurrent = Boolean(updates.isCurrent);
  }

  if (updates.textSize !== undefined) {
    const n = Number(updates.textSize);
    if (Number.isNaN(n)) {
      return NextResponse.json(
        { error: 'textSize must be a number' },
        { status: 400 }
      );
    }
    updates.textSize = n;
  }

  const numericKeys = ['logoOffsetX', 'logoOffsetY', 'logoScale'] as const;
  for (const key of numericKeys) {
    if (updates[key] !== undefined) {
      const n = Number(updates[key]);
      if (Number.isNaN(n)) {
        return NextResponse.json(
          { error: `${key} must be a number` },
          { status: 400 }
        );
      }
      updates[key] = n;
    }
  }

  try {
    await journeyRepository.update(id, updates as any);
    // 캐시 무효화
    revalidatePath('/journey');
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating journey item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getSessionFromRequest(req);
  if (!session || !hasAdminSession(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;
  try {
    await journeyRepository.delete(id);
    // 캐시 무효화
    revalidatePath('/journey');
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting journey item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


