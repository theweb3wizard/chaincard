import { create } from 'zustand';
import type { WalletProfile, SavedCard, ArchetypeKey, WalletStatus } from '@/types';
import { analyzeWallet } from '@/lib/wallet';
import { getSavedCards, saveCard, removeSavedCard } from '@/lib/cache';

interface AppState {
  walletAddress: string | null;
  walletProfile: WalletProfile | null;
  status: WalletStatus;
  error: string | null;
  show3D: boolean;
  cameraAngle: number;
  timeProgress: number;
  savedCards: SavedCard[];

  setWalletAddress: (address: string) => void;
  setStatus: (status: WalletStatus) => void;
  setError: (error: string | null) => void;
  setShow3D: (show: boolean) => void;
  setCameraAngle: (angle: number) => void;
  setTimeProgress: (progress: number) => void;

  generateCard: (input: string) => Promise<void>;
  toggle3D: () => void;
  fetchSavedCards: () => Promise<void>;
  toggleSaveCard: (card: SavedCard) => Promise<void>;
  isCardSaved: (address: string) => boolean;
  reset: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  walletAddress: null,
  walletProfile: null,
  status: 'idle',
  error: null,
  show3D: true,
  cameraAngle: 0,
  timeProgress: 0,
  savedCards: [],

  setWalletAddress: (address) => set({ walletAddress: address }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setShow3D: (show) => set({ show3D: show }),
  setCameraAngle: (angle) => set({ cameraAngle: angle }),
  setTimeProgress: (progress) => set({ timeProgress: progress }),

  generateCard: async (input) => {
    const store = get();
    store.setStatus('searching');
    store.setError(null);

    try {
      const profile = await analyzeWallet(input);
      set({
        walletProfile: profile,
        walletAddress: profile.address,
        status: 'complete',
        show3D: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze wallet';
      set({ error: message, status: 'error' });
    }
  },

  toggle3D: () => set((s) => ({ show3D: !s.show3D })),

  fetchSavedCards: async () => {
    try {
      const saved = localStorage.getItem('chaincard_saved_cards');
      if (saved) {
        set({ savedCards: JSON.parse(saved) });
      } else {
        const cards = await getSavedCards();
        set({ savedCards: cards });
        localStorage.setItem('chaincard_saved_cards', JSON.stringify(cards));
      }
    } catch {
      set({ savedCards: [] });
    }
  },

  toggleSaveCard: async (card) => {
    const { savedCards } = get();
    const exists = savedCards.some(
      (c) => c.address.toLowerCase() === card.address.toLowerCase()
    );

    let updated: SavedCard[];
    if (exists) {
      updated = savedCards.filter(
        (c) => c.address.toLowerCase() !== card.address.toLowerCase()
      );
      await removeSavedCard(card.address);
    } else {
      updated = [...savedCards, { ...card, timestamp: Date.now() }];
      await saveCard(updated[updated.length - 1]);
    }

    set({ savedCards: updated });
    localStorage.setItem('chaincard_saved_cards', JSON.stringify(updated));
  },

  isCardSaved: (address) => {
    return get().savedCards.some(
      (c) => c.address.toLowerCase() === address.toLowerCase()
    );
  },

  reset: () =>
    set({
      walletAddress: null,
      walletProfile: null,
      status: 'idle',
      error: null,
      show3D: true,
      cameraAngle: 0,
      timeProgress: 0,
    }),
}));