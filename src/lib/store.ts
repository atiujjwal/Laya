import { create } from "zustand";

interface LayaStore {
  // Grid State
  currentDate: Date;
  setCurrentDate: (date: Date) => void;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useLayaStore = create<LayaStore>((set) => ({
  currentDate: new Date(),
  setCurrentDate: (date) => set({ currentDate: date }),
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
