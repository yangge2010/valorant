import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface GameState {
  difficulty: 'easy' | 'normal' | 'hard';
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  lastResult: {
    reactionTime: number;
    accuracy: number;
    difficulty: string;
    targetHits: number;
    totalTargets: number;
  } | null;
  setLastResult: (result: GameState['lastResult']) => void;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface Store extends GameState, AuthState {}

export const useStore = create<Store>((set) => ({
  // Game State
  difficulty: 'normal',
  setDifficulty: (difficulty) => set({ difficulty }),
  lastResult: null,
  setLastResult: (lastResult) => set({ lastResult }),

  // Auth State
  user: null,
  setUser: (user) => set({ user }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
