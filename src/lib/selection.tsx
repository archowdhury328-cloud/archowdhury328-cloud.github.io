import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { publicationById } from '../data/publications';
import type { Publication, Topic } from '../data/types';
import { DEFAULT_FILTERS, type Filters } from './publicationQuery';

interface SelectionState {
  filters: Filters;
  selectedId: string | null;
  selected: Publication | undefined;
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
  selectPublication: (id: string | null) => void;
  selectTopic: (topic: Topic | 'all') => void;
  /** Polite status message for screen readers. */
  announcement: string;
}

const Ctx = createContext<SelectionState | null>(null);

/** One shared source of truth for list, details panel and 3D scenes. */
export function SelectionProvider({ children, initial }: { children: ReactNode; initial?: Partial<Filters> }) {
  const [filters, setFiltersState] = useState<Filters>({ ...DEFAULT_FILTERS, ...initial });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const setFilters = useCallback((patch: Partial<Filters>) => setFiltersState((f) => ({ ...f, ...patch })), []);
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setAnnouncement('Filters reset. Showing all publications.');
  }, []);
  const selectPublication = useCallback((id: string | null) => {
    setSelectedId(id);
    const p = id ? publicationById(id) : undefined;
    setAnnouncement(p ? `Selected: ${p.title}` : 'Selection cleared.');
  }, []);
  const selectTopic = useCallback((topic: Topic | 'all') => {
    setFiltersState((f) => ({ ...f, topic }));
    setAnnouncement(topic === 'all' ? 'Showing all topics.' : `Filtered to ${topic}.`);
  }, []);

  const value = useMemo<SelectionState>(
    () => ({
      filters,
      selectedId,
      selected: selectedId ? publicationById(selectedId) : undefined,
      setFilters,
      resetFilters,
      selectPublication,
      selectTopic,
      announcement,
    }),
    [filters, selectedId, setFilters, resetFilters, selectPublication, selectTopic, announcement],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSelection(): SelectionState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSelection must be used inside <SelectionProvider>');
  return v;
}
