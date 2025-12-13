// Activities repository: Firestore operations for Activities entries

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
  query
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Activity } from '@/lib/firestore/activities';

function docToActivity(
  docSnap: QueryDocumentSnapshot<DocumentData>
): Activity {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    date: data.date ?? '',
    description: data.description ?? '',
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? ''
  };
}

export const activitiesRepository = {
  /**
   * Get all public activities, sorted by date (newest first)
   */
  async getPublicEntries(): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, 'activities'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToActivity);
    } catch (error) {
      console.error('Error fetching public activities:', error);
      throw error;
    }
  },

  /**
   * Get all entries (for admin use)
   */
  async getAllEntries(): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, 'activities'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToActivity);
    } catch (error) {
      console.error('Error fetching all activities:', error);
      throw error;
    }
  },

  /**
   * Get a single entry by ID
   */
  async getEntryById(id: string): Promise<Activity | null> {
    try {
      const docRef = doc(db, 'activities', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docToActivity(docSnap as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error fetching activity:', error);
      return null;
    }
  },

  /**
   * Create a new activity
   */
  async create(
    activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'activities'), {
        ...activity,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  /**
   * Update an existing activity
   */
  async update(
    id: string,
    updates: Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'activities', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  /**
   * Delete an activity
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'activities', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }
};

