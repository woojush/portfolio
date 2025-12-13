// Firestore CRUD functions for Journey entries.
// Collection name: "journeyItems"
// Journey represents major life transitions and decisions over time.

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
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface JourneyItem {
  id: string;
  period: string;              // "2025.02 - 2025.05"
  title: string;               // 역할/직위
  organization?: string;       // 조직명
  location?: string;           // 위치
  description: string;         // 간단 설명
  highlights?: string[];       // 불릿 하이라이트
  tags?: string[];             // 기술/역할 태그
  logoUrl?: string;            // 로고 이미지
  imageUrl?: string;           // 배경/대표 이미지
  isCurrent?: boolean;         // 현재 재직 여부
  createdAt?: string;          // 정렬용
  sortOrder?: number;          // 수동 정렬
  textColor?: string;          // 표시 색상 (예: black/gray/blue)
  textSize?: number;           // 표시 폰트 크기(px 등)
  durationText?: string;       // 기간 옆에 표시할 "X년 Y개월" 등 문구
  logoOffsetX?: number;        // 로고 미리보기 X 이동(px)
  logoOffsetY?: number;        // 로고 미리보기 Y 이동(px)
  logoScale?: number;          // 로고 미리보기 배율(%)
}

function docToEntry(
  docSnap: QueryDocumentSnapshot<DocumentData>
): JourneyItem {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    period: data.period ?? '',
    title: data.title ?? '',
    organization: data.organization ?? '',
    location: data.location ?? '',
    description: data.description ?? '',
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    logoUrl: data.logoUrl ?? '',
    imageUrl: data.imageUrl ?? '',
    isCurrent: data.isCurrent ?? false,
    createdAt: data.createdAt,
    sortOrder: data.sortOrder,
    textColor: data.textColor ?? '',
    textSize: data.textSize,
    durationText: data.durationText ?? '',
    logoOffsetX: data.logoOffsetX ?? 0,
    logoOffsetY: data.logoOffsetY ?? 0,
    logoScale: data.logoScale ?? 100
  };
}

/**
 * Ensure only one document has isCurrent=true.
 */
async function clearOtherCurrents(exceptId?: string) {
  const q = query(collection(db, 'journeyItems'), where('isCurrent', '==', true));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    if (d.id !== exceptId) {
      batch.update(d.ref, { isCurrent: false });
    }
  });
  await batch.commit();
}

/**
 * Get all journey items from Firestore, sorted by period or sortOrder.
 */
export async function getJourneyItems(): Promise<JourneyItem[]> {
  try {
    // Try to sort by sortOrder first, then by period
    const q = query(
      collection(db, 'journeyItems'),
      orderBy('sortOrder', 'desc')
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(docToEntry);
    // 현재/정렬 우선
    return items.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return b.sortOrder - a.sortOrder;
      }
      return (b.period || '').localeCompare(a.period || '');
    });
  } catch (error) {
    // If sortOrder doesn't exist, try period-based
    try {
      const q = query(
        collection(db, 'journeyItems'),
        orderBy('period', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToEntry);
    } catch (err) {
      console.error('Error fetching journey items:', err);
      throw err;
    }
  }
}

/**
 * Add a new journey item to Firestore.
 */
export async function addJourneyItem(
  item: Omit<JourneyItem, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'journeyItems'), {
      period: item.period,
      title: item.title,
      organization: item.organization || '',
      location: item.location || '',
      description: item.description,
      highlights: item.highlights ?? [],
      tags: item.tags ?? [],
      logoUrl: item.logoUrl || '',
      imageUrl: item.imageUrl || '',
      isCurrent: item.isCurrent ?? false,
      createdAt: new Date().toISOString(),
      sortOrder: item.sortOrder ?? null,
      textColor: item.textColor || '',
      textSize: item.textSize ?? null,
      durationText: item.durationText || '',
      logoOffsetX: item.logoOffsetX ?? 0,
      logoOffsetY: item.logoOffsetY ?? 0,
      logoScale: item.logoScale ?? 100
    });
    if (item.isCurrent) {
      await clearOtherCurrents(docRef.id);
    }
    return docRef.id;
  } catch (error) {
    console.error('Error adding journey item:', error);
    throw error;
  }
}

/**
 * Update an existing journey item in Firestore.
 */
export async function updateJourneyItem(
  id: string,
  updates: Partial<Omit<JourneyItem, 'id'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'journeyItems', id);
    const updateData: Record<string, any> = {};
    if (updates.period !== undefined) updateData.period = updates.period;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.organization !== undefined)
      updateData.organization = updates.organization;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.highlights !== undefined)
      updateData.highlights = updates.highlights ?? [];
    if (updates.tags !== undefined) updateData.tags = updates.tags ?? [];
    if (updates.logoUrl !== undefined) updateData.logoUrl = updates.logoUrl;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
    if (updates.isCurrent !== undefined) {
      updateData.isCurrent = updates.isCurrent;
      if (updates.isCurrent) {
        await clearOtherCurrents(id);
      }
    }
    if (updates.sortOrder !== undefined)
      updateData.sortOrder = updates.sortOrder ?? null;
    if (updates.textColor !== undefined)
      updateData.textColor = updates.textColor ?? '';
    if (updates.textSize !== undefined)
      updateData.textSize = updates.textSize ?? null;
    if (updates.durationText !== undefined)
      updateData.durationText = updates.durationText ?? '';
    if (updates.logoOffsetX !== undefined)
      updateData.logoOffsetX = updates.logoOffsetX ?? 0;
    if (updates.logoOffsetY !== undefined)
      updateData.logoOffsetY = updates.logoOffsetY ?? 0;
    if (updates.logoScale !== undefined)
      updateData.logoScale = updates.logoScale ?? 100;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating journey item:', error);
    throw error;
  }
}

/**
 * Delete a journey item from Firestore.
 */
export async function deleteJourneyItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'journeyItems', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting journey item:', error);
    throw error;
  }
}

