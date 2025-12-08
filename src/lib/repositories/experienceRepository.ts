// Experience repository: Firestore operations for Experience entries

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
import type { ExperienceItem } from '@/lib/firestore/types';

function docToEntry(
  docSnap: QueryDocumentSnapshot<DocumentData>
): ExperienceItem {
  const data = docSnap.data();
  // Backward compatibility: periodLabel → title
  const title = data.title ?? data.periodLabel ?? '';
  return {
    id: docSnap.id,
    title,
    category: data.category ?? '',
    startDate: data.startDate ?? '',
    endDate: data.endDate,
    summary: data.summary ?? '',
    images: Array.isArray(data.images) ? data.images : [],
    content: data.content,
    public: data.public ?? false,
    draft: data.draft ?? false,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? ''
  };
}

export const experienceRepository = {
  /**
   * Get all public experience items, sorted by startDate (newest first)
   */
  async getPublicEntries(): Promise<ExperienceItem[]> {
    try {
      // Fetch all and filter client-side to avoid index requirement
      const q = query(
        collection(db, 'experienceItems'),
        orderBy('startDate', 'desc')
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(docToEntry);
      // Filter public and non-draft entries
      return items.filter((item) => item.public && !item.draft);
    } catch (error) {
      console.error('Error fetching public experience items:', error);
      throw error;
    }
  },

  /**
   * Get all entries (including drafts) - for admin use
   */
  async getAllEntries(): Promise<ExperienceItem[]> {
    try {
      const q = query(
        collection(db, 'experienceItems'),
        orderBy('startDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToEntry);
    } catch (error) {
      console.error('Error fetching all experience items:', error);
      throw error;
    }
  },

  /**
   * Get a single entry by ID (public or admin)
   */
  async getEntryById(id: string, admin = false): Promise<ExperienceItem | null> {
    try {
      const docRef = doc(db, 'experienceItems', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const entry = docToEntry(docSnap as QueryDocumentSnapshot<DocumentData>);
      if (!admin && (!entry.public || entry.draft)) return null;
      return entry;
    } catch (error) {
      console.error('Error fetching experience item:', error);
      return null;
    }
  },

  /**
   * Create a new experience item
   */
  async create(
    item: Omit<ExperienceItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'experienceItems'), {
        ...item,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating experience item:', error);
      throw error;
    }
  },

  /**
   * Update an existing experience item
   */
  async update(
    id: string,
    updates: Partial<Omit<ExperienceItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'experienceItems', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating experience item:', error);
      throw error;
    }
  },

  /**
   * Delete an experience item
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'experienceItems', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting experience item:', error);
      throw error;
    }
  }
};

