// store/blogStore.js
import { create } from "zustand";

export const useBlogStore = create((set) => ({
    blogId: null,

    setBlogId: (id) => set({ blogId: id }),

    clearBlogId: () => set({ blogId: null })
}));