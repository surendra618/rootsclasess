import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCourseStore = create(
  persist(
    (set) => ({
   
      classId: null,   

   
      setClassId: (id) => set({ classId: id }),
      
  
      clearClassId: () => set({ classId: null }), 
    }),
    {
      name: "course-storage",
    }
  )   
);