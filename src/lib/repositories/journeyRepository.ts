// Journey repository - placeholder for now
// Can be extended later if needed

import { getJourneyItems } from '@/lib/firestore/journey';
import type { JourneyItem } from '@/lib/firestore/journey';

export const journeyRepository = {
  async getPublicEntries(): Promise<JourneyItem[]> {
    // For now, return all items
    // Can add public/draft filtering later if needed
    return await getJourneyItems();
  }
};

