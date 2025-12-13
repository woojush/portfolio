// Admin-only endpoint to migrate Firestore collection
// from "learningEntries" to "learningItems".

import { NextResponse } from 'next/server';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { hasAdminSession } from '@/lib/adminSessionStore';

export async function POST(req: Request) {
  try {
    const sessionCookie = req.headers
      .get('cookie')
      ?.split(';')
      .find((c) => c.trim().startsWith('admin_session='))
      ?.split('=')[1];

    if (!sessionCookie || !hasAdminSession(sessionCookie)) {
      return NextResponse.json(
        { error: 'Unauthorized', hasCookie: !!sessionCookie },
        { status: 401 }
      );
    }

    return runMigration();
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function runMigration() {
  const sourceCol = collection(db, 'learningEntries');
  const targetCol = 'learningItems';

  const snapshot = await getDocs(sourceCol);
  if (snapshot.empty) {
    return NextResponse.json({
      migrated: 0,
      skipped: 0,
      deleted: 0,
      message: 'No documents found in learningEntries.'
    });
  }

  const migrated: string[] = [];
  const skipped: string[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (!data) {
      skipped.push(docSnap.id);
      continue;
    }

    try {
      // Upsert into new collection with same ID
      await setDoc(doc(db, targetCol, docSnap.id), data);
      migrated.push(docSnap.id);
    } catch (error: any) {
      errors.push({ id: docSnap.id, error: String(error) });
      continue;
    }
  }

  // Delete originals only after successful write
  let deletedCount = 0;
  for (const id of migrated) {
    try {
      await deleteDoc(doc(db, 'learningEntries', id));
      deletedCount += 1;
    } catch (error) {
      errors.push({ id, error: `delete failed: ${String(error)}` });
    }
  }

  return NextResponse.json({
    success: true,
    migrated: migrated.length,
    deleted: deletedCount,
    skipped: skipped.length,
    errors
  });
}

