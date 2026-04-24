import { create } from 'zustand';

interface NavbarStore {
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}

export const useNavbarStore = create<NavbarStore>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (isMenuOpen) => set({ isMenuOpen }),
}));
