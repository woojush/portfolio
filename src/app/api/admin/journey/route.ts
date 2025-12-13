import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/adminSessionStore';
import { journeyRepository } from '@/lib/repositories/journeyRepository';

function getSessionFromRequest(req: Request) {
  return req.headers
    .get('cookie')
    ?.split(';')
    .find((c) => c.trim().startsWith('admin_session='))
    ?.split('=')[1];
}

function validateBody(body: any) {
  const errors: string[] = [];
  const parsed: Record<string, any> = {};

  if (!body || typeof body !== 'object') {
    errors.push('Invalid payload');
    return { errors, parsed };
  }

  const required = ['period', 'title', 'description'];
  required.forEach((key) => {
    if (!body[key] || typeof body[key] !== 'string') {
      errors.push(`Missing or invalid ${key}`);
    } else {
      parsed[key] = body[key];
    }
  });

  const optionalString = ['organization', 'location', 'logoUrl', 'imageUrl'];
  optionalString.forEach((key) => {
    if (body[key] !== undefined) {
      parsed[key] = typeof body[key] === 'string' ? body[key] : '';
    }
  });

  if (body.sortOrder !== undefined) {
    const n = Number(body.sortOrder);
    if (Number.isNaN(n)) {
      errors.push('sortOrder must be a number');
    } else {
      parsed.sortOrder = n;
    }
  }

  if (body.isCurrent !== undefined) {
    parsed.isCurrent = Boolean(body.isCurrent);
  }

  if (Array.isArray(body.highlights)) {
    parsed.highlights = body.highlights.filter((v: any) => typeof v === 'string');
  }

  if (Array.isArray(body.tags)) {
    parsed.tags = body.tags.filter((v: any) => typeof v === 'string');
  }

  if (body.textColor !== undefined) {
    parsed.textColor = typeof body.textColor === 'string' ? body.textColor : '';
  }
  if (body.textSize !== undefined) {
    const n = Number(body.textSize);
    if (Number.isNaN(n)) {
      errors.push('textSize must be a number');
    } else {
      parsed.textSize = n;
    }
  }
  if (body.durationText !== undefined) {
    parsed.durationText =
      typeof body.durationText === 'string' ? body.durationText : '';
  }

  if (body.logoOffsetX !== undefined) {
    const n = Number(body.logoOffsetX);
    if (Number.isNaN(n)) {
      errors.push('logoOffsetX must be a number');
    } else {
      parsed.logoOffsetX = n;
    }
  }
  if (body.logoOffsetY !== undefined) {
    const n = Number(body.logoOffsetY);
    if (Number.isNaN(n)) {
      errors.push('logoOffsetY must be a number');
    } else {
      parsed.logoOffsetY = n;
    }
  }
  if (body.logoScale !== undefined) {
    const n = Number(body.logoScale);
    if (Number.isNaN(n)) {
      errors.push('logoScale must be a number');
    } else {
      parsed.logoScale = n;
    }
  }

  return { errors, parsed };
}

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session || !hasAdminSession(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const items = await journeyRepository.getAllEntries();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching journey items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session || !hasAdminSession(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const { errors, parsed } = validateBody(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
  }
  try {
    const id = await journeyRepository.create(parsed as any);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Error creating journey item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

