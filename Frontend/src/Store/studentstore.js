import { create } from "zustand";

let storedStudent = null;

try {
  const data = localStorage.getItem("student");

  if (data && data !== "undefined") {
    storedStudent = JSON.parse(data);
  }
} catch (error) {
  console.log("JSON error:", error);
}

const useStudentStore = create((set) => ({
  student: storedStudent,
  token: localStorage.getItem("token") || null,

  setStudent: (data) => {
    if (!data?.user) return;

    set({
      student: data.user,
      token: data.token,
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("student", JSON.stringify(data.user));
    localStorage.setItem("user", JSON.stringify(data.user)); // Sync legacy key
  },

 logout: () => {
  localStorage.removeItem("token");
  localStorage.removeItem("student");   // 👈 FIX

  set({ student: null, token: null });
}
}));

export default useStudentStore;