import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../src/components/mainLayout/Navbar";
import Footer from "../src/components/mainLayout/Footer";
import FloatingContact from "../src/components/mainLayout/FloatingContact";
import { useEffect } from "react";
import socketService from "./services/socket";
import { toast } from "react-toastify";
import useNotificationStore from "./Store/notificationStore";
import { useTestStore } from "./Store/testStore";

const StudentLayout = () => {
  const location = useLocation();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const isTestActive = useTestStore((state) => state.isTestActive);

  useEffect(() => {
    // Initial sync of notifications from backend
    useNotificationStore.getState().fetchNotifications();

    socketService.connect();
    socketService.joinStudents();

    socketService.on("new_test_available", (data) => {
      // ✅ Add to Global Store
      addNotification({
        id: `test-${data?._id || Date.now()}`,
        title: "📝 New Test Available",
        message: `${data.title || 'New Test'} is now live!`,
        type: "test",
        link: "/test",
        data: data
      });

      toast.success(`New Test Available: ${data.title}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    socketService.on("new_batch_announced", (data) => {
      addNotification({
        id: `batch-${data?._id || Date.now()}`,
        title: "🚀 New Batch Announced",
        message: `${data.title || 'New Batch'} admissions started!`,
        type: "batch",
        link: "/comingbatches",
        data: data
      });
      toast.info(`New Batch: ${data.title}`, { position: "top-right", autoClose: 5000 });
    });

    socketService.on("announcement", (data) => {
      addNotification({
        id: `announcement-${Date.now()}`,
        title: data?.title || "📢 Announcement",
        message: data?.message || "Check out latest updates.",
        type: "info",
        link: data?.link || "/course",
        data: data
      });
    });

    return () => {
      socketService.off("new_test_available");
      socketService.off("new_batch_announced");
      socketService.off("announcement");
    };
  }, []);

  const hideLayoutRoutes = [
    '/stdprofile',
    '/purchescourse',
    '/dashboard',
    '/student/dashboard',
    '/student/profile'
  ];

  const shouldHideLayout = isTestActive || hideLayoutRoutes.some(route => 
    location.pathname === route || 
    location.pathname.startsWith('/stdprofile') || 
    location.pathname.startsWith('/purchescourse') ||
    location.pathname.startsWith('/student/dashboard') ||
    location.pathname.startsWith('/student/profile')
  );

  return (
    <>
      {!shouldHideLayout && <Navbar />}

      <Outlet />

      {!shouldHideLayout && <Footer />}
      {!shouldHideLayout && <FloatingContact />}
    </>
  );
};

export default StudentLayout;
