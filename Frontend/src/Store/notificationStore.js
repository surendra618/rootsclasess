import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import api from "../services/endpoints";

export const DEFAULT_NOTIFICATIONS = [
  {
    id: "rsat-scholarship-2026",
    title: "🎉 RSAT 2026 Registration Open",
    message: "Roots Scholarship Admission Test 2026 is Live! Appear online & win up to 100% scholarship on NEET & JEE courses.",
    type: "scholarship",
    link: "/scholarship",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: false
  },
  {
    id: "target-batches-2026",
    title: "📢 Target 2026-27 New Batches",
    message: "New batches starting for Class 8-10 Foundation, NEET Droppers & IIT-JEE. Offline & hybrid batches commencing soon.",
    type: "batch",
    link: "/comingbatches",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false
  },
  {
    id: "free-mock-test-series",
    title: "📝 All India Test Series Active",
    message: "Comprehensive practice tests and chapter-wise mock exams are ready. Evaluate your rank and speed today!",
    type: "test",
    link: "/test",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    isRead: false
  },
  {
    id: "roots-welcome",
    title: "⭐ Welcome to Roots Classes!",
    message: "Access premium lectures, personalized mentorship, and comprehensive test series.",
    type: "info",
    link: "/course",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    isRead: true
  }
];

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      unreadCount: DEFAULT_NOTIFICATIONS.filter(n => !n.isRead).length,
      isLoading: false,

      // Add a single notification (e.g. from socket or local action)
      addNotification: (notification) => set((state) => {
        const newNotif = {
          id: notification.id || `notif-${Date.now()}`,
          title: notification.title || "New Notification",
          message: notification.message || "",
          type: notification.type || "info",
          link: notification.link || "/course",
          timestamp: notification.timestamp ? new Date(notification.timestamp).toISOString() : new Date().toISOString(),
          isRead: false,
          ...notification
        };

        // Prevent duplicate IDs
        const filtered = state.notifications.filter(n => n.id !== newNotif.id);
        const updated = [newNotif, ...filtered];
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.isRead).length
        };
      }),

      // Mark all notifications as read
      markAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      })),

      // Mark a single notification as read
      markSingleAsRead: (id) => set((state) => {
        const updated = state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.isRead).length
        };
      }),

      // Delete a single notification
      removeNotification: (id) => set((state) => {
        const updated = state.notifications.filter(n => n.id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.isRead).length
        };
      }),

      // Clear all notifications
      clearNotifications: () => set({
        notifications: [],
        unreadCount: 0
      }),

      // Restore default notifications
      restoreDefaults: () => set({
        notifications: DEFAULT_NOTIFICATIONS,
        unreadCount: DEFAULT_NOTIFICATIONS.filter(n => !n.isRead).length
      }),

      // Fetch live notifications from backend
      fetchNotifications: async () => {
        try {
          set({ isLoading: true });
          const endpoint = api.student?.notifications;
          if (!endpoint) return;

          const res = await axios.get(endpoint, { timeout: 6000 });
          if (res?.data?.success && Array.isArray(res.data.notifications)) {
            const serverNotifs = res.data.notifications;
            set((state) => {
              const currentList = state.notifications || [];
              const currentIds = new Set(currentList.map(n => n.id));

              // Map incoming server items
              const formattedIncoming = serverNotifs.map(n => ({
                id: n.id || `server-${Date.now()}-${Math.random()}`,
                title: n.title,
                message: n.message,
                type: n.type || 'info',
                link: n.link || '/course',
                timestamp: n.createdAt || n.timestamp || new Date().toISOString(),
                isRead: false
              }));

              // Only append new items not already present
              const newItems = formattedIncoming.filter(n => !currentIds.has(n.id));
              if (newItems.length === 0) return { isLoading: false };

              const merged = [...newItems, ...currentList];
              return {
                notifications: merged,
                unreadCount: merged.filter(n => !n.isRead).length,
                isLoading: false
              };
            });
          }
        } catch (err) {
          // If offline or network error, keep current notifications intact
          console.warn("Notification fetch skipped or offline:", err.message);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: "root_classes_notifications",
      // If persisted data has empty notifications on initial load, fall back to defaults
      onRehydrateStorage: () => (state) => {
        if (state && (!state.notifications || state.notifications.length === 0)) {
          state.notifications = DEFAULT_NOTIFICATIONS;
          state.unreadCount = DEFAULT_NOTIFICATIONS.filter(n => !n.isRead).length;
        }
      }
    }
  )
);

export default useNotificationStore;
