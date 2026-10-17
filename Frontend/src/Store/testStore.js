import { create } from "zustand";

export const useTestStore = create((set) => ({
  testId: null,
  isTestActive: false,

  // set testId
  setTestId: (id) => set({ testId: id }),

  // clear testId
  clearTestId: () => set({ testId: null }),

  // set test active mode (hides navbar & footer during active test)
  setIsTestActive: (active) => set({ isTestActive: active }),
}));