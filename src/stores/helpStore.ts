/**
 * Help Center Store - Manages help panel state and viewed articles tracking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HelpState {
  // UI State
  isOpen: boolean;
  searchQuery: string;
  activeCategory: string | null;
  selectedArticleId: string | null;

  // Persistent Data
  viewedArticles: string[];

  // Actions
  openHelp: () => void;
  closeHelp: () => void;
  toggleHelp: () => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string | null) => void;
  selectArticle: (id: string | null) => void;
  markArticleViewed: (id: string) => void;
  goBack: () => void;
}

export const useHelpStore = create<HelpState>()(
  persist(
    (set, get) => ({
      // Initial State
      isOpen: false,
      searchQuery: '',
      activeCategory: null,
      selectedArticleId: null,
      viewedArticles: [],

      // Actions
      openHelp: () => set({ isOpen: true }),
      closeHelp: () => set({ isOpen: false }),
      toggleHelp: () => set((state) => ({ isOpen: !state.isOpen })),

      setSearchQuery: (query: string) =>
        set({ searchQuery: query, activeCategory: null, selectedArticleId: null }),

      setActiveCategory: (category: string | null) =>
        set({ activeCategory: category, selectedArticleId: null, searchQuery: '' }),

      selectArticle: (id: string | null) => {
        if (id && !get().viewedArticles.includes(id)) {
          set((state) => ({
            selectedArticleId: id,
            viewedArticles: [...state.viewedArticles, id],
          }));
        } else {
          set({ selectedArticleId: id });
        }
      },

      markArticleViewed: (id: string) => {
        const { viewedArticles } = get();
        if (!viewedArticles.includes(id)) {
          set({ viewedArticles: [...viewedArticles, id] });
        }
      },

      goBack: () => set({ selectedArticleId: null }),
    }),
    {
      name: 'property-manager-help-store',
      partialize: (state) => ({
        viewedArticles: state.viewedArticles,
      }),
    }
  )
);
