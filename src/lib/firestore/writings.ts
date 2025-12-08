// Firestore CRUD functions for Writing entries.
// Collection name: "writingEntries"

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface WritingEntry {
  id: string;
  title: string;
  date: string;
  type: 'reflection' | 'essay' | 'note';
  summary: string;
  link?: string;
  createdAt?: string; // For time-based sorting
}

function docToEntry(
  docSnap: QueryDocumentSnapshot<DocumentData>
): WritingEntry {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title ?? '',
    date: data.date ?? '',
    type: data.type ?? 'note',
    summary: data.summary ?? '',
    link: data.link,
    createdAt: data.createdAt
  };
}

/**
 * Get all writing entries from Firestore, sorted by date (newest first).
 */
export async function getWritingEntries(): Promise<WritingEntry[]> {
  try {
    const q = query(
      collection(db, 'writingEntries'),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToEntry);
  } catch (error) {
    console.error('Error fetching writing entries:', error);
    throw error;
  }
}

/**
 * Add a new writing entry to Firestore.
 */
export async function addWritingEntry(
  entry: Omit<WritingEntry, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'writingEntries'), {
      title: entry.title,
      date: entry.date,
      type: entry.type,
      summary: entry.summary,
      link: entry.link ?? null,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding writing entry:', error);
    throw error;
  }
}

/**
 * Update an existing writing entry in Firestore.
 */
export async function updateWritingEntry(
  id: string,
  updates: Partial<Omit<WritingEntry, 'id'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'writingEntries', id);
    const updateData: Record<string, any> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.link !== undefined) updateData.link = updates.link ?? null;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating writing entry:', error);
    throw error;
  }
}

/**
 * Delete a writing entry from Firestore.
 */
export async function deleteWritingEntry(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'writingEntries', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting writing entry:', error);
    throw error;
  }
}

