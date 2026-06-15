import { useState, useMemo, useCallback } from 'react';
import type { ProjectRecord } from '@ai-radar/shared';

export function useResearchStore() {
  const [compareItems, setCompareItems] = useState<ProjectRecord[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string[]>>({});

  const addCompare = useCallback((item: ProjectRecord) => {
    setCompareItems((prev) => {
      if (prev.length >= 4) return prev;
      if (prev.some((i) => i.repoId === item.repoId)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeCompare = useCallback((repoId: string) => {
    setCompareItems((prev) => prev.filter((i) => i.repoId !== repoId));
  }, []);

  const saveNote = useCallback((repoId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [repoId]: note }));
  }, []);

  const toggleTag = useCallback((repoId: string, tag: string) => {
    setTags((prev) => {
      const current = prev[repoId] ?? [];
      if (current.includes(tag)) {
        return { ...prev, [repoId]: current.filter((t) => t !== tag) };
      }
      return { ...prev, [repoId]: [...current, tag] };
    });
  }, []);

  const store = useMemo(
    () => ({ compareItems, notes, tags, addCompare, removeCompare, saveNote, toggleTag }),
    [compareItems, notes, tags, addCompare, removeCompare, saveNote, toggleTag],
  );

  return store;
}
