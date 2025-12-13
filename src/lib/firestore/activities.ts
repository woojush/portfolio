// Firestore CRUD functions for Activities entries.
// Collection name: "activities"
// Activities represent participation in events, competitions, etc.

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

export interface Activity {
  id: string;
  date: string;        // YY.MM 형식
  description: string; // 괄호 포함 가능
  createdAt: string;
  updatedAt: string;
}

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

/**
 * Get all activities from Firestore, sorted by date (descending).
 */
export async function getActivities(): Promise<Activity[]> {
  try {
    const q = query(
      collection(db, 'activities'),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToActivity);
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}

/**
 * Add a new activity to Firestore.
 */
export async function addActivity(
  activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'activities'), {
      date: activity.date,
      description: activity.description,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
}

/**
 * Update an existing activity in Firestore.
 */
export async function updateActivity(
  id: string,
  updates: Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'activities', id);
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.description !== undefined) updateData.description = updates.description;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
}

/**
 * Delete an activity from Firestore.
 */
export async function deleteActivity(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'activities', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
}

