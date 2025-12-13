// Learning repository: Firestore operations for Learning entries
// Separates data fetching from UI components

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
import type { LearningEntry } from '@/lib/firestore/types';

const COLLECTION_NEW = 'learningItems';
const COLLECTION_LEGACY = 'learningEntries';

function docToEntry(
  docSnap: QueryDocumentSnapshot<DocumentData>
): LearningEntry {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title ?? '',
    subject: data.subject ?? '',
    thumbnailUrl: data.thumbnailUrl ?? '',
    startDate: data.startDate,
    endDate: data.endDate,
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary ?? '',
    content: data.content ?? '',
    authorName: data.authorName,
    authorImageUrl: data.authorImageUrl,
    public: data.public ?? false,
    draft: data.draft ?? false,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? ''
  };
}

export const learningRepository = {
  /**
   * Get all public learning entries, sorted by startDate (newest first)
   */
  async getPublicEntries(): Promise<LearningEntry[]> {
    try {
      // Fetch all and filter client-side to avoid index requirement
      const qNew = query(
        collection(db, COLLECTION_NEW),
        orderBy('startDate', 'desc')
      );
      const qLegacy = query(
        collection(db, COLLECTION_LEGACY),
        orderBy('startDate', 'desc')
      );

      let snapshot = await getDocs(qNew);
      if (snapshot.empty) {
        snapshot = await getDocs(qLegacy);
      }

      const entries = snapshot.docs.map(docToEntry);
      // Filter public and non-draft entries
      return entries.filter((entry) => entry.public && !entry.draft);
    } catch (error) {
      console.error('Error fetching public learning entries:', error);
      throw error;
    }
  },

  /**
   * Get all entries (including drafts) - for admin use
   */
  async getAllEntries(): Promise<LearningEntry[]> {
    try {
      const qNew = query(
        collection(db, COLLECTION_NEW),
        orderBy('startDate', 'desc')
      );
      const qLegacy = query(
        collection(db, COLLECTION_LEGACY),
        orderBy('startDate', 'desc')
      );

      let snapshot = await getDocs(qNew);
      if (snapshot.empty) {
        snapshot = await getDocs(qLegacy);
      }

      return snapshot.docs.map(docToEntry);
    } catch (error) {
      console.error('Error fetching all learning entries:', error);
      throw error;
    }
  },

  /**
   * Get entries by subject (public only)
   */
  async getEntriesBySubject(subject: string): Promise<LearningEntry[]> {
    try {
      // Fetch all and filter client-side to avoid index requirement
      const qNew = query(
        collection(db, COLLECTION_NEW),
        orderBy('startDate', 'desc')
      );
      const qLegacy = query(
        collection(db, COLLECTION_LEGACY),
        orderBy('startDate', 'desc')
      );

      let snapshot = await getDocs(qNew);
      if (snapshot.empty) {
        snapshot = await getDocs(qLegacy);
      }

      const entries = snapshot.docs.map(docToEntry);
      // Filter by subject, public and non-draft entries
      return entries
        .filter((entry) => entry.subject === subject)
        .filter((entry) => entry.public && !entry.draft);
    } catch (error) {
      console.error('Error fetching learning entries by subject:', error);
      throw error;
    }
  },

  /**
   * Get a single entry by ID (public or admin)
   */
  async getEntryById(id: string, admin = false): Promise<LearningEntry | null> {
    try {
      const docRefNew = doc(db, COLLECTION_NEW, id);
      const docRefLegacy = doc(db, COLLECTION_LEGACY, id);

      let docSnap = await getDoc(docRefNew);
      if (!docSnap.exists()) {
        docSnap = await getDoc(docRefLegacy);
        if (!docSnap.exists()) return null;
      }

      const entry = docToEntry(docSnap as QueryDocumentSnapshot<DocumentData>);
      if (!admin && (!entry.public || entry.draft)) return null;
      return entry;
    } catch (error) {
      console.error('Error fetching learning entry:', error);
      return null;
    }
  },

  /**
   * Get unique subjects from public entries
   */
  async getSubjects(): Promise<
    Array<{ subject: string; count: number; latestDate: string }>
  > {
    try {
      const entries = await this.getPublicEntries();
      const subjectMap = new Map<
        string,
        { count: number; latestDate: string }
      >();

      entries.forEach((entry) => {
        const existing = subjectMap.get(entry.subject);
        if (existing) {
          existing.count += 1;
          if (
            entry.startDate &&
            (!existing.latestDate || entry.startDate > existing.latestDate)
          ) {
            existing.latestDate = entry.startDate;
          }
        } else {
          subjectMap.set(entry.subject, {
            count: 1,
            latestDate: entry.startDate ?? ''
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
  },

  /**
   * Create a new learning entry
   */
  async create(
    entry: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, COLLECTION_NEW), {
        ...entry,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating learning entry:', error);
      throw error;
    }
  },

  /**
   * Update an existing learning entry
   */
  async update(
    id: string,
    updates: Partial<Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const docRefNew = doc(db, COLLECTION_NEW, id);
      const docRefLegacy = doc(db, COLLECTION_LEGACY, id);

      const targetRef = (await getDoc(docRefNew)).exists()
        ? docRefNew
        : docRefLegacy;

      await updateDoc(targetRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating learning entry:', error);
      throw error;
    }
  },

  /**
   * Delete a learning entry
   */
  async delete(id: string): Promise<void> {
    try {
      const docRefNew = doc(db, COLLECTION_NEW, id);
      const docRefLegacy = doc(db, COLLECTION_LEGACY, id);

      const targetRef = (await getDoc(docRefNew)).exists()
        ? docRefNew
        : docRefLegacy;

      await deleteDoc(targetRef);
    } catch (error) {
      console.error('Error deleting learning entry:', error);
      throw error;
    }
  }
};

