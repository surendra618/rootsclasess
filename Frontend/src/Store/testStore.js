import { create } from "zustand";

export const useTestStore = create((set) => ({
  testId: null,

  // set testId
  setTestId: (id) => set({ testId: id }),

  // clear testId
  clearTestId: () => set({ testId: null }),
}));