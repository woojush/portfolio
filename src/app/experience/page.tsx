import { experienceRepository } from '@/lib/repositories/experienceRepository';
import { ExperienceClient } from '@/components/experience/ExperienceClient';

export default async function ExperiencePage() {
  const items = await experienceRepository.getPublicEntries();
  return <ExperienceClient items={items} />;
}
