// Writings repository: Firestore operations for Writing entries

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
import type { WritingEntry } from '@/lib/firestore/types';

function docToEntry(
  docSnap: QueryDocumentSnapshot<DocumentData>
): WritingEntry {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title ?? '',
    date: data.date ?? '',
    summary: data.summary ?? '',
    content: data.content ?? '',
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    public: data.public ?? false,
    draft: data.draft ?? false,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? ''
  };
}

export const writingsRepository = {
  /**
   * Get all public writing entries, sorted by date (newest first)
   */
  async getPublicEntries(): Promise<WritingEntry[]> {
    try {
      // Fetch all and filter client-side to avoid index requirement
      const q = query(
        collection(db, 'writingEntries'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(docToEntry);
      // Filter public and non-draft entries
      return entries.filter((entry) => entry.public && !entry.draft);
    } catch (error) {
      console.error('Error fetching public writing entries:', error);
      throw error;
    }
  },

  /**
   * Get all entries (including drafts) - for admin use
   */
  async getAllEntries(): Promise<WritingEntry[]> {
    try {
      const q = query(
        collection(db, 'writingEntries'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToEntry);
    } catch (error) {
      console.error('Error fetching all writing entries:', error);
      throw error;
    }
  },

  /**
   * Get a single entry by ID (public or admin)
   */
  async getEntryById(id: string, admin = false): Promise<WritingEntry | null> {
    try {
      const docRef = doc(db, 'writingEntries', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const entry = docToEntry(docSnap as QueryDocumentSnapshot<DocumentData>);
      if (!admin && (!entry.public || entry.draft)) return null;
      return entry;
    } catch (error) {
      console.error('Error fetching writing entry:', error);
      return null;
    }
  },

  /**
   * Create a new writing entry
   */
  async create(
    entry: Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'writingEntries'), {
        ...entry,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating writing entry:', error);
      throw error;
    }
  },

  /**
   * Update an existing writing entry
   */
  async update(
    id: string,
    updates: Partial<Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'writingEntries', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating writing entry:', error);
      throw error;
    }
  },

  /**
   * Delete a writing entry
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'writingEntries', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting writing entry:', error);
      throw error;
    }
  }
};

