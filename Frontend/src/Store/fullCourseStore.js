// Store/fullCourseStore.js
import { create } from 'zustand';

export const useCourseStore = create((set) => ({
    courseId: null,
    setCourseId: (id) => set({ courseId: id }),
    clearCourseId: () => set({ courseId: null }),
}));