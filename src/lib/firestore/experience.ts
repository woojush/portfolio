// Firestore CRUD functions for Experience entries.
// Collection name: "experienceItems"

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

export interface ExperienceItem {
  id: string;
  title: string;
  periodLabel: string; // "2023 겨울", "2024-1학기" 등 표시용
  category: string; // "part-time", "project", "club", "military" 등 자유 문자열
  role: string;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  summary: string;
  learnings: string[];
  images: string[];
  content?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

function docToEntry(
  docSnap: QueryDocumentSnapshot<DocumentData>
): ExperienceItem {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title ?? '',
    periodLabel: data.periodLabel ?? '',
    category: data.category ?? '',
    role: data.role ?? '',
    startDate: data.startDate ?? '',
    endDate: data.endDate,
    summary: data.summary ?? '',
    learnings: Array.isArray(data.learnings) ? data.learnings : [],
    images: Array.isArray(data.images) ? data.images : [],
    content: data.content,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? ''
  };
}

/**
 * Get all experience items from Firestore, sorted by startDate (newest first).
 */
export async function getExperienceItems(): Promise<ExperienceItem[]> {
  try {
    const q = query(
      collection(db, 'experienceItems'),
      orderBy('startDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToEntry);
  } catch (error) {
    console.error('Error fetching experience items:', error);
    throw error;
  }
}

/**
 * Add a new experience item to Firestore.
 */
export async function addExperienceItem(
  item: Omit<ExperienceItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'experienceItems'), {
      title: item.title,
      periodLabel: item.periodLabel,
      category: item.category,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate ?? null,
      summary: item.summary,
      learnings: item.learnings,
      images: item.images,
      content: item.content ?? null,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding experience item:', error);
    throw error;
  }
}

/**
 * Update an existing experience item in Firestore.
 */
export async function updateExperienceItem(
  id: string,
  updates: Partial<Omit<ExperienceItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'experienceItems', id);
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.periodLabel !== undefined)
      updateData.periodLabel = updates.periodLabel;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate;
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate ?? null;
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.learnings !== undefined) updateData.learnings = updates.learnings;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.content !== undefined)
      updateData.content = updates.content ?? null;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating experience item:', error);
    throw error;
  }
}

/**
 * Delete an experience item from Firestore.
 */
export async function deleteExperienceItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'experienceItems', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting experience item:', error);
    throw error;
  }
}
