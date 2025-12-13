// Journey repository - public/admin helpers

import {
  addJourneyItem,
  deleteJourneyItem,
  getJourneyItems,
  type JourneyItem,
  updateJourneyItem
} from '@/lib/firestore/journey';

export const journeyRepository = {
  async getPublicEntries(): Promise<JourneyItem[]> {
    return await getJourneyItems();
  },

  async getAllEntries(): Promise<JourneyItem[]> {
    return await getJourneyItems();
  },

  async create(
    item: Omit<JourneyItem, 'id' | 'createdAt'>
  ): Promise<string> {
    return await addJourneyItem(item);
  },

  async update(
    id: string,
    updates: Partial<Omit<JourneyItem, 'id' | 'createdAt'>>
  ): Promise<void> {
    return await updateJourneyItem(id, updates);
  },

  async delete(id: string): Promise<void> {
    return await deleteJourneyItem(id);
  }
};

