// Shared utility for generating consistent heading IDs
// Used by both TableOfContents (for extraction) and MarkdownRenderer (for rendering)

interface HeadingIdCounter {
  counters: Map<string, number>;
}

// Global counter shared across all instances (client-side only)
let globalHeadingCounters: Map<string, number> = new Map();

// Reset counters (call when content changes)
export function resetHeadingCounters(): void {
  globalHeadingCounters.clear();
}

// Generate consistent ID from heading text and level
export function generateHeadingId(text: string, level: number): string {
  // Normalize text
  const baseId = text
    .toLowerCase()
    .replace(/[^\w\s-가-힣]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Use level prefix to ensure uniqueness across different heading levels
  const key = `${level}-${baseId}`;
  const count = globalHeadingCounters.get(key) || 0;
  globalHeadingCounters.set(key, count + 1);
  
  // Add index if not first occurrence to make it unique
  return count > 0 ? `${baseId}-${count}` : baseId;
}

