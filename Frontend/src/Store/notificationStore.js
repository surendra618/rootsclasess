import { create } from "zustand";

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => set((state) => ({
    notifications: [
      { id: Date.now(), ...notification, timestamp: new Date(), isRead: false },
      ...state.notifications
    ],
    unreadCount: state.unreadCount + 1
  })),

  markAsRead: () => set({ unreadCount: 0 }),
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 })
}));

export default useNotificationStore;
