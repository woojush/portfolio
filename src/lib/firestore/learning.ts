// Firestore CRUD functions for Learning entries.
// Collection name: "learningEntries"

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface LearningEntry {
  id: string;
  title: string;
  subject: string;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  tags: string[];
  summary: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

function docToEntry(
  docSnap: QueryDocumentSnapshot<DocumentData>
): LearningEntry {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title ?? '',
    subject: data.subject ?? '',
    startDate: data.startDate ?? '',
    endDate: data.endDate,
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary ?? '',
    content: data.content ?? '',
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? ''
  };
}

/**
 * Get all learning entries from Firestore, sorted by startDate (newest first).
 */
export async function getLearningEntries(): Promise<LearningEntry[]> {
  try {
    const q = query(
      collection(db, 'learningEntries'),
      orderBy('startDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToEntry);
  } catch (error) {
    console.error('Error fetching learning entries:', error);
    throw error;
  }
}

/**
 * Get learning entries filtered by subject.
 */
export async function getLearningEntriesBySubject(
  subject: string
): Promise<LearningEntry[]> {
  try {
    const q = query(
      collection(db, 'learningEntries'),
      where('subject', '==', subject),
      orderBy('startDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToEntry);
  } catch (error) {
    console.error('Error fetching learning entries by subject:', error);
    throw error;
  }
}

/**
 * Get a single learning entry by ID.
 */
export async function getLearningEntry(id: string): Promise<LearningEntry | null> {
  try {
    const docRef = doc(db, 'learningEntries', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docToEntry(docSnap as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error fetching learning entry:', error);
    return null;
  }
}

/**
 * Get unique subjects from all learning entries.
 */
export async function getLearningSubjects(): Promise<
  Array<{ subject: string; count: number; latestDate: string }>
> {
  try {
    const entries = await getLearningEntries();
    const subjectMap = new Map<
      string,
      { count: number; latestDate: string }
    >();

    entries.forEach((entry) => {
      const existing = subjectMap.get(entry.subject);
      if (existing) {
        existing.count += 1;
        if (entry.startDate > existing.latestDate) {
          existing.latestDate = entry.startDate;
        }
      } else {
        subjectMap.set(entry.subject, {
          count: 1,
          latestDate: entry.startDate
        });
      }
    });

    return Array.from(subjectMap.entries())
      .map(([subject, data]) => ({
        subject,
        count: data.count,
        latestDate: data.latestDate
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject));
  } catch (error) {
    console.error('Error fetching learning subjects:', error);
    throw error;
  }
}

/**
 * Add a new learning entry to Firestore.
 */
export async function addLearningEntry(
  entry: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'learningEntries'), {
      title: entry.title,
      subject: entry.subject,
      startDate: entry.startDate,
      endDate: entry.endDate ?? null,
      tags: entry.tags,
      summary: entry.summary,
      content: entry.content,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding learning entry:', error);
    throw error;
  }
}

/**
 * Update an existing learning entry in Firestore.
 */
export async function updateLearningEntry(
  id: string,
  updates: Partial<Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'learningEntries', id);
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString()
    };
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate;
    if (updates.endDate !== undefined)
      updateData.endDate = updates.endDate ?? null;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.content !== undefined) updateData.content = updates.content;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating learning entry:', error);
    throw error;
  }
}

/**
 * Delete a learning entry from Firestore.
 */
export async function deleteLearningEntry(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'learningEntries', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting learning entry:', error);
    throw error;
  }
}
