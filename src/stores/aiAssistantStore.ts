/**
 * AI Assistant Store - Manages AI suggestion panel state
 */

import { create } from 'zustand';

export interface Suggestion {
  id: string;
  type: 'action' | 'insight' | 'reminder' | 'next-step';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionLabel?: string;
  action?: () => void;
}

export interface AIAssistantState {
  // Panel State
  isOpen: boolean;
  suggestions: Suggestion[];
  isLoading: boolean;
  lastRefresh: Date | null;

  // Context Tracking
  currentRoute: string;
  recentActions: string[];

  // Actions
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  setLoading: (isLoading: boolean) => void;
  dismissSuggestion: (id: string) => void;
  setCurrentRoute: (route: string) => void;
  addRecentAction: (action: string) => void;
  refreshSuggestions: () => Promise<void>;
}

export const useAIAssistantStore = create<AIAssistantState>((set, get) => ({
  // Initial State
  isOpen: false,
  suggestions: [],
  isLoading: false,
  lastRefresh: null,
  currentRoute: '/',
  recentActions: [],

  // Actions
  openAssistant: () => {
    set({ isOpen: true });
    // Auto-refresh suggestions when opening
    get().refreshSuggestions();
  },

  closeAssistant: () => set({ isOpen: false }),

  toggleAssistant: () => {
    const willOpen = !get().isOpen;
    set({ isOpen: willOpen });
    if (willOpen) {
      get().refreshSuggestions();
    }
  },

  setSuggestions: (suggestions: Suggestion[]) =>
    set({ suggestions, lastRefresh: new Date() }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  dismissSuggestion: (id: string) =>
    set((state) => ({
      suggestions: state.suggestions.filter((s) => s.id !== id),
    })),

  setCurrentRoute: (route: string) => {
    set({ currentRoute: route });
    // Auto-refresh if panel is open
    if (get().isOpen) {
      get().refreshSuggestions();
    }
  },

  addRecentAction: (action: string) =>
    set((state) => ({
      recentActions: [...state.recentActions.slice(-9), action], // Keep last 10
    })),

  refreshSuggestions: async () => {
    set({ isLoading: true });
    try {
      // Dynamic import to avoid circular dependencies
      const { generateSuggestions } = await import('../services/suggestionEngine');
      const { currentRoute, recentActions } = get();
      const suggestions = await generateSuggestions({ currentRoute, recentActions });
      set({ suggestions, lastRefresh: new Date(), isLoading: false });
    } catch (error) {
      console.error('Failed to refresh suggestions:', error);
      set({ isLoading: false });
    }
  },
}));
