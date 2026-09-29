import { create } from "zustand";

export const useTopicStore = create((set) => ({
  topicId: null,

  setTopicId: (id) => set({ topicId: id }),

  clearTopicId: () => set({ topicId: null })
}));