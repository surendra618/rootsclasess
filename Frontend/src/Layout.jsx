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
    socketService.connect();
    socketService.joinStudents();

    socketService.on("new_test_available", (data) => {
      // ✅ Add to Global Store
      addNotification({
        title: "New Test Available",
        message: `${data.title} is now live!`,
        type: "test",
        data: data
      });

      toast.success(`New Test Available: ${data.title}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });


    return () => {
      socketService.off("new_test_available");
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
